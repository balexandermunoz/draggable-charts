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
      this.setState({ activePoint: points[0] })
      this.togglePan(false)
    }
  }

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const position = getRelativePosition(event, this.chartRef.current)
      const chartArea = chart.chartArea
      const yAxis = chart.scales.y
      const yValue = calculateNewYValue(position, chartArea, yAxis)
      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ] = yValue
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
      const yValue = chart.data.datasets[datasetIndex].data[pointIndex]

      this.state.originalData[datasetLabel]["data"][xLabel] = yValue
      this.setState({ activePoint: null })
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
