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
      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ].y = newYValue

      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ].x = newXValue

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

      this.state.originalData[datasetLabel]["x"][pointIndex] = xValue
      this.state.originalData[datasetLabel]["y"][pointIndex] = yValue
      Streamlit.setComponentValue(this.state.originalData)

      this.setState({ activePoint: null })
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
