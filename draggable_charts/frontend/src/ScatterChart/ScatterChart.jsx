import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"

import { Scatter, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "../Utils/chartOptions"
import { calculateNewXValue, calculateNewYValue } from "../Utils/handlers"
import {
  updateLockedYBounds,
  applyLockedYBounds,
  snapshotOriginalChartData,
} from "../Utils/lockedBoundsHelper"
import { 
  storeOriginalShadeValues, 
  updateShadeScatter, 
  saveShadeScatterData 
} from "../Utils/shadeHelpers"

Chart.register(...registerables, zoomPlugin)

class ScatterChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.lockedYBounds = null
    this.originalYBounds = null
    this.originalChartData = null
    this.state = {
      activePoint: null,
      originalXValue: null,
      originalYValue: null,
      shadeOriginalValues: null,  // Store original min/max values for shade
      originalData: props.args.data,
      chartData: createChartData(props.args.data, props.args.options.colors),
      options: createOptions(props.args.options, props.theme),
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
        options: createOptions(this.props.args.options, this.props.theme),
      }, () => {
        applyLockedYBounds(this)
        snapshotOriginalChartData(this)
      })
    }
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
      const originalX = chart.data.datasets[points[0].datasetIndex].data[pointIndex].x
      const originalY = chart.data.datasets[points[0].datasetIndex].data[pointIndex].y
      
      // Store original shade values using helper (pass null for labels since scatter doesn't use them)
      const shadeValues = storeOriginalShadeValues(
        chart,
        datasetLabel,
        pointIndex,
        this.props.args.options,
        null  // Scatter chart doesn't use labels
      )
      
      this.setState({ 
        activePoint: points[0],
        originalXValue: originalX,
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
      const pointIndex = this.state.activePoint.index
      const datasetLabel = chart.data.datasets[this.state.activePoint.datasetIndex].label

      const newYValue = calculateNewYValue(
        position,
        chartArea,
        chart.scales.y,
        this.props.args.options.y_type
      )

      const newXValue = calculateNewXValue(
        position,
        chartArea,
        chart.scales.x,
        this.props.args.options.x_type
      )
      
      updateLockedYBounds(this, chart, newYValue)
      
      // Calculate the deltas from the original positions
      const deltaX = newXValue - this.state.originalXValue
      const deltaY = newYValue - this.state.originalYValue

      // Update the main point
      chart.data.datasets[this.state.activePoint.datasetIndex].data[pointIndex].y = newYValue
      chart.data.datasets[this.state.activePoint.datasetIndex].data[pointIndex].x = newXValue

      // Update shade scatter using helper
      if (this.state.shadeOriginalValues && this.state.shadeOriginalValues.hasShade) {
        updateShadeScatter(
          chart,
          datasetLabel,
          pointIndex,
          deltaX,
          deltaY,
          this.props.args.options,
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
      const xValue = chart.data.datasets[datasetIndex].data[pointIndex].x
      const yValue = chart.data.datasets[datasetIndex].data[pointIndex].y

      // Update the main line data
      this.state.originalData[datasetLabel]["x"][pointIndex] = xValue
      this.state.originalData[datasetLabel]["y"][pointIndex] = yValue
      
      // Save shade scatter data using helper
      saveShadeScatterData(
        chart,
        datasetLabel,
        pointIndex,
        this.props.args.options,
        this.state.originalData
      )
      
      Streamlit.setComponentValue(this.state.originalData)

      this.setState({ 
        activePoint: null,
        originalXValue: null,
        originalYValue: null,
        shadeOriginalValues: null
      })
      this.togglePan(true)
    }
  }

  render() {
    return (
      <Scatter
        ref={this.chartRef}
        data={this.state.chartData}
        options={this.state.options}
        onPointerDown={this.downHandler}
        onPointerUp={this.upHandler}
        onPointerMove={this.moveHandler}
      />
    )
  }
}

export default ScatterChart
