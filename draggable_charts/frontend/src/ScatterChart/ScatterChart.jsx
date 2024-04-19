import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"

import { Scatter, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "./chartOptions"

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

  calculateNewYValue = (position, chartArea, yAxis) => {
    if (this.props.args.options.y_type === "category") {
      const categories = yAxis.getLabels()
      const categoryIndex = Math.round(
        this.map(
          position.y,
          chartArea.top,
          chartArea.bottom,
          0,
          categories.length - 1
        )
      )
      return categories[categoryIndex]
    } else {
      return this.map(
        position.y,
        chartArea.bottom,
        chartArea.top,
        yAxis.min,
        yAxis.max
      )
    }
  }

  calculateNewXValue = (position, chartArea, xAxis) => {
    if (this.props.args.options.x_type === "category") {
      const categories = xAxis.getLabels()
      const categoryIndex = Math.round(
        this.map(
          position.x,
          chartArea.left,
          chartArea.right,
          0,
          categories.length - 1
        )
      )
      return categories[categoryIndex]
    } else {
      return this.map(
        position.x,
        chartArea.left,
        chartArea.right,
        xAxis.min,
        xAxis.max
      )
    }
  }

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const position = getRelativePosition(event, this.chartRef.current)
      const chartArea = chart.chartArea

      const newYValue = this.calculateNewYValue(
        position,
        chartArea,
        chart.scales.y
      )

      const newXValue = this.calculateNewXValue(
        position,
        chartArea,
        chart.scales.x
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

  map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
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
