import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"
import { Line, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "../Utils/chartOptions"
import { calculateNewYValue } from "../Utils/handlers"

Chart.register(...registerables, zoomPlugin)

class LineChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.state = {
      activePoint: null,
      originalYValue: null,  // Track original Y value for calculating delta
      originalMinValue: null,  // Track original min value
      originalMaxValue: null,  // Track original max value
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
      
      // Store the original Y value for calculating delta
      const chart = this.chartRef.current
      const pointIndex = points[0].index
      const xLabel = this.state.chartData.labels[pointIndex]
      const originalY = chart.data.datasets[points[0].datasetIndex].data[xLabel]
      
      // Store original min/max values if this line has shade_between configuration
      let originalMin = null
      let originalMax = null
      const shadeBetween = this.props.args.options.shade_between
      if (shadeBetween) {
        Object.entries(shadeBetween).forEach(([targetLine, config]) => {
          if (datasetLabel === targetLine) {
            // Find and store the original min value
            const minDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.min
            )
            if (minDatasetIndex !== -1) {
              originalMin = chart.data.datasets[minDatasetIndex].data[xLabel]
            }
            
            // Find and store the original max value
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1) {
              originalMax = chart.data.datasets[maxDatasetIndex].data[xLabel]
            }
          }
        })
      }
      
      this.setState({ 
        activePoint: points[0],
        originalYValue: originalY,
        originalMinValue: originalMin,
        originalMaxValue: originalMax
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
      const pointIndex = this.state.activePoint.index
      const xLabel = this.state.chartData.labels[pointIndex]
      const datasetLabel = chart.data.datasets[this.state.activePoint.datasetIndex].label
      
      // Calculate the delta (change in Y value) from the original position
      const deltaY = newYValue - this.state.originalYValue

      // Update the main line
      chart.data.datasets[this.state.activePoint.datasetIndex].data[xLabel] = newYValue
      
      // Check if this line has shade_between configuration and update min/max lines
      const shadeBetween = this.props.args.options.shade_between
      if (shadeBetween) {
        Object.entries(shadeBetween).forEach(([targetLine, config]) => {
          if (datasetLabel === targetLine) {
            // Update the min line by applying delta to the original min value
            const minDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.min
            )
            if (minDatasetIndex !== -1 && this.state.originalMinValue !== null) {
              chart.data.datasets[minDatasetIndex].data[xLabel] = this.state.originalMinValue + deltaY
            }
            
            // Update the max line by applying delta to the original max value
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1 && this.state.originalMaxValue !== null) {
              chart.data.datasets[maxDatasetIndex].data[xLabel] = this.state.originalMaxValue + deltaY
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
      const xLabel = this.state.chartData.labels[pointIndex]
      const yValue = chart.data.datasets[datasetIndex].data[xLabel]

      // Update the main line data
      this.state.originalData[datasetLabel]["data"][xLabel] = yValue
      
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
              const minYValue = chart.data.datasets[minDatasetIndex].data[xLabel]
              this.state.originalData[config.min]["data"][xLabel] = minYValue
            }
            
            // Update the max line data
            const maxDatasetIndex = chart.data.datasets.findIndex(
              ds => ds.label === config.max
            )
            if (maxDatasetIndex !== -1) {
              const maxYValue = chart.data.datasets[maxDatasetIndex].data[xLabel]
              this.state.originalData[config.max]["data"][xLabel] = maxYValue
            }
          }
        })
      }
      
      this.setState({ 
        activePoint: null,
        originalYValue: null,
        originalMinValue: null,
        originalMaxValue: null
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
      />
    )
  }
}

export default LineChart
