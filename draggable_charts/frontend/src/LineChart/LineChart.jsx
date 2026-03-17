import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"
import { Line, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "../Utils/chartOptions"
import { calculateNewYValue } from "../Utils/handlers"
import { 
  storeOriginalShadeValues, 
  updateShadeLines, 
  saveShadeData 
} from "../Utils/shadeHelpers"

Chart.register(...registerables, zoomPlugin)

class LineChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.lockedYBounds = null
    this.originalYBounds = null
    this.originalChartData = null
    this.state = {
      activePoint: null,
      originalYValue: null,
      shadeOriginalValues: null,  // Store original min/max values for shade
      originalData: props.args.data,
      chartData: createChartData(props.args.data, props.args.options.colors),
      options: createOptions(props.args.options, props.theme, this.getZoomOptions(props.args.options)),
    }
  }

  componentDidUpdate(prevProps) {
    Streamlit.setFrameHeight()
    if (this.props.args !== prevProps.args) {
      this.setState({
        originalData: this.props.args.data,
        chartData: createChartData(
          this.props.args.data,
          this.props.args.options
        ),
        options: createOptions(
          this.props.args.options,
          this.props.theme,
          this.getZoomOptions(this.props.args.options)
        ),
      }, () => {
        this.applyLockedYBounds()
        this.snapshotOriginalChartData()
      })
    }
  }

  snapshotOriginalChartData() {
    const chart = this.chartRef.current
    if (!chart?.data?.datasets) {
      return
    }

    this.originalChartData = JSON.parse(JSON.stringify(chart.data.datasets))
  }

  captureOriginalYBounds() {
    const chart = this.chartRef.current
    if (!chart?.scales?.y) {
      return
    }

    this.originalYBounds = {
      min: chart.scales.y.min,
      max: chart.scales.y.max,
    }
  }

  getZoomOptions(options) {
    if (!options.smooth_drag_zoom) {
      return null
    }

    return {
      limits: {
        x: { min: "original", max: "original" },
        y: {},
      },
    }
  }

  doubleClickHandler = () => {
    if (this.props.args.options.smooth_drag_zoom && this.chartRef.current) {
      const chart = this.chartRef.current
      this.lockedYBounds = null

      if (!this.originalYBounds) {
        this.captureOriginalYBounds()
      }

      // Restore original bounds explicitly.
      if (chart.options?.scales?.y && this.originalYBounds) {
        chart.options.scales.y.min = this.originalYBounds.min
        chart.options.scales.y.max = this.originalYBounds.max
      }

      chart.update("none")
    }
  }

  updateLockedYBounds(chart, newYValue) {
    if (!this.props.args.options.smooth_drag_zoom || !chart?.scales?.y) {
      return
    }

    const yScale = chart.scales.y
    if (!this.originalYBounds) {
      this.captureOriginalYBounds()
    }

    if (!this.lockedYBounds) {
      this.lockedYBounds = {
        min: yScale.min,
        max: yScale.max,
      }
    }

    this.lockedYBounds.min = Math.min(this.lockedYBounds.min, newYValue)
    this.lockedYBounds.max = Math.max(this.lockedYBounds.max, newYValue)

    chart.options.scales.y.min = this.lockedYBounds.min
    chart.options.scales.y.max = this.lockedYBounds.max
  }

  applyLockedYBounds() {
    if (!this.props.args.options.smooth_drag_zoom || !this.lockedYBounds) {
      return
    }

    const chart = this.chartRef.current
    if (!chart?.options?.scales?.y) {
      return
    }

    chart.options.scales.y.min = this.lockedYBounds.min
    chart.options.scales.y.max = this.lockedYBounds.max
    chart.update("none")
  }

  togglePan(enabled) {
    this.chartRef.current.options.plugins.zoom.pan.enabled = enabled
    this.chartRef.current.update("none")
  }

  downHandler = (event) => {
    const points = getElementAtEvent(this.chartRef.current, event, {
      intersect: false,
    })
    if (points.length > 0) {
      const datasetLabel =
        this.chartRef.current.data.datasets[points[0].datasetIndex].label
      if (
        this.props.args.options.fixed_lines &&
        this.props.args.options.fixed_lines.includes(datasetLabel)
      ) {
        // This line is fixed, so don't allow it to be moved
        return
      }
      
      const chart = this.chartRef.current
      const pointIndex = points[0].index
      const xLabel = this.state.chartData.labels[pointIndex]
      const originalY = chart.data.datasets[points[0].datasetIndex].data[xLabel]
      
      // Store original shade values using helper
      const shadeValues = storeOriginalShadeValues(
        chart,
        datasetLabel,
        pointIndex,
        this.props.args.options,
        this.state.chartData.labels
      )
      
      this.setState({ 
        activePoint: points[0],
        originalYValue: originalY,
        shadeOriginalValues: shadeValues
      })
      this.togglePan(false)
    }
  }

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const position = getRelativePosition(event, this.chartRef.current)
      const chartArea = chart.chartArea
      const yAxis = chart.scales.y
      const newYValue = calculateNewYValue(position, chartArea, yAxis)
      this.updateLockedYBounds(chart, newYValue)
      const pointIndex = this.state.activePoint.index
      const xLabel = this.state.chartData.labels[pointIndex]
      const datasetLabel = chart.data.datasets[this.state.activePoint.datasetIndex].label
      
      // Calculate the delta (change in Y value) from the original position
      const deltaY = newYValue - this.state.originalYValue

      // Update the main line
      chart.data.datasets[this.state.activePoint.datasetIndex].data[xLabel] = newYValue
      
      // Update shade lines using helper
      if (this.state.shadeOriginalValues && this.state.shadeOriginalValues.hasShade) {
        updateShadeLines(
          chart,
          datasetLabel,
          pointIndex,
          deltaY,
          this.props.args.options,
          this.state.chartData.labels,
          this.state.shadeOriginalValues.minValues,
          this.state.shadeOriginalValues.maxValues
        )
      }
      
      chart.update("none")
    }
  }

  upHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const datasetIndex = this.state.activePoint.datasetIndex
      const pointIndex = this.state.activePoint.index
      const datasetLabel = chart.data.datasets[datasetIndex].label
      const xLabel = this.state.chartData.labels[pointIndex]
      const yValue = chart.data.datasets[datasetIndex].data[xLabel]

      // Update the main line data
      this.state.originalData[datasetLabel]["data"][xLabel] = yValue
      
      // Save shade data using helper
      saveShadeData(
        chart,
        datasetLabel,
        pointIndex,
        this.props.args.options,
        this.state.chartData.labels,
        this.state.originalData
      )
      
      this.setState({ 
        activePoint: null,
        originalYValue: null,
        shadeOriginalValues: null
      })
      this.togglePan(true)
      Streamlit.setComponentValue(this.state.originalData)
    }
  }

  render() {
    return (
      <Line
        ref={this.chartRef}
        data={this.state.chartData}
        options={this.state.options}
        onPointerDown={this.downHandler}
        onPointerUp={this.upHandler}
        onPointerMove={this.moveHandler}
        onDoubleClick={this.doubleClickHandler}
      />
    )
  }
}

export default LineChart
