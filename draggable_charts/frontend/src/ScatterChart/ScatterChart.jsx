import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"

import { Scatter, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "../Utils/chartOptions"
import { calculateNewXValue, calculateNewYValue } from "../Utils/handlers"

Chart.register(...registerables, zoomPlugin)

class ScatterChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.state = {
      activePoint: null,
      originalXValue: null,  // Track original X value for calculating delta
      originalYValue: null,  // Track original Y value for calculating delta
      originalMinX: null,    // Track original min X value
      originalMinY: null,    // Track original min Y value
      originalMaxX: null,    // Track original max X value
      originalMaxY: null,    // Track original max Y value
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
      
      // Store the original X and Y values for calculating delta
      const chart = this.chartRef.current
      const pointIndex = points[0].index
      const originalX = chart.data.datasets[points[0].datasetIndex].data[pointIndex].x
      const originalY = chart.data.datasets[points[0].datasetIndex].data[pointIndex].y
      
      // Store original min/max values if this line has shade_between configuration
      let originalMinX = null
      let originalMinY = null
      let originalMaxX = null
      let originalMaxY = null
      const shadeBetween = this.props.args.options.shade_between
      if (shadeBetween) {
        Object.entries(shadeBetween).forEach(([targetLine, config]) => {
          if (datasetLabel === targetLine) {
            // Find and store the original min values
            const minDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.min
            )
            if (minDatasetIndex !== -1) {
              originalMinX = chart.data.datasets[minDatasetIndex].data[pointIndex].x
              originalMinY = chart.data.datasets[minDatasetIndex].data[pointIndex].y
            }
            
            // Find and store the original max values
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1) {
              originalMaxX = chart.data.datasets[maxDatasetIndex].data[pointIndex].x
              originalMaxY = chart.data.datasets[maxDatasetIndex].data[pointIndex].y
            }
          }
        })
      }
      
      this.setState({ 
        activePoint: points[0],
        originalXValue: originalX,
        originalYValue: originalY,
        originalMinX: originalMinX,
        originalMinY: originalMinY,
        originalMaxX: originalMaxX,
        originalMaxY: originalMaxY
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
      
      // Calculate the deltas from the original positions
      const deltaX = newXValue - this.state.originalXValue
      const deltaY = newYValue - this.state.originalYValue

      // Update the main point
      chart.data.datasets[this.state.activePoint.datasetIndex].data[pointIndex].y = newYValue
      chart.data.datasets[this.state.activePoint.datasetIndex].data[pointIndex].x = newXValue

      // Check if this line has shade_between configuration and update min/max lines
      const shadeBetween = this.props.args.options.shade_between
      if (shadeBetween) {
        Object.entries(shadeBetween).forEach(([targetLine, config]) => {
          if (datasetLabel === targetLine) {
            // Update the min line by applying deltas to the original min values
            const minDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.min
            )
            if (minDatasetIndex !== -1 && this.state.originalMinX !== null && this.state.originalMinY !== null) {
              chart.data.datasets[minDatasetIndex].data[pointIndex].x = this.state.originalMinX + deltaX
              chart.data.datasets[minDatasetIndex].data[pointIndex].y = this.state.originalMinY + deltaY
            }
            
            // Update the max line by applying deltas to the original max values
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1 && this.state.originalMaxX !== null && this.state.originalMaxY !== null) {
              chart.data.datasets[maxDatasetIndex].data[pointIndex].x = this.state.originalMaxX + deltaX
              chart.data.datasets[maxDatasetIndex].data[pointIndex].y = this.state.originalMaxY + deltaY
            }
          }
        })
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
      
      // Check if this line has shade_between configuration and update min/max lines
      const shadeBetween = this.props.args.options.shade_between
      if (shadeBetween) {
        Object.entries(shadeBetween).forEach(([targetLine, config]) => {
          if (datasetLabel === targetLine) {
            // Update the min line data
            const minDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.min
            )
            if (minDatasetIndex !== -1) {
              const minXValue = chart.data.datasets[minDatasetIndex].data[pointIndex].x
              const minYValue = chart.data.datasets[minDatasetIndex].data[pointIndex].y
              this.state.originalData[config.min]["x"][pointIndex] = minXValue
              this.state.originalData[config.min]["y"][pointIndex] = minYValue
            }
            
            // Update the max line data
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1) {
              const maxXValue = chart.data.datasets[maxDatasetIndex].data[pointIndex].x
              const maxYValue = chart.data.datasets[maxDatasetIndex].data[pointIndex].y
              this.state.originalData[config.max]["x"][pointIndex] = maxXValue
              this.state.originalData[config.max]["y"][pointIndex] = maxYValue
            }
          }
        })
      }
      
      Streamlit.setComponentValue(this.state.originalData)

      this.setState({ 
        activePoint: null,
        originalXValue: null,
        originalYValue: null,
        originalMinX: null,
        originalMinY: null,
        originalMaxX: null,
        originalMaxY: null
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
