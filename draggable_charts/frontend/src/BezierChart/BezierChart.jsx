import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"

import { Scatter, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createFixedData, createControlData, createBezierData } from "./chartData"
import { createOptions } from "./chartOptions"

Chart.register(...registerables, zoomPlugin)

class BezierChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.fixedData = createFixedData(
      this.props.args.data,
      this.props.args.options
    )
    this.state = {
      activePoint: null,
      originalData: props.args.data,
      controlData: createControlData(
        this.props.args.data,
        this.props.args.options
      ),
      bezierData: createBezierData(
        this.props.args.data,
        this.props.args.options
      ),
      options: createOptions(props.args.options, props.theme),
    }
    // Return the initial Bezier data:
    // this.sendBezierData()
  }

  componentDidUpdate(prevProps) {
    Streamlit.setFrameHeight()
    if (this.props.args !== prevProps.args) {
      this.setState({
        originalData: this.props.args.data,
        controlData: createControlData(
          this.props.args.data,
          this.props.args.options
        ),
        bezierData: createBezierData(
          this.props.args.data,
          this.props.args.options
        ),
        options: createOptions(this.props.args.options, this.props.theme),
      })
    }
  }

  sendBezierData() {
    const newBezierData = this.convertBezierData(this.state.bezierData.datasets)
    Streamlit.setComponentValue(newBezierData)
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
      const dataset =
        this.chartRef.current.data.datasets[points[0].datasetIndex]
      if (dataset.isControlPoint) {
        this.setState({ activePoint: points[0] })
        this.togglePan(false)
      }
    }
  }

  calculateNewYValue = (position, chartArea, yAxis) => {
    return this.map(
      position.y,
      chartArea.bottom,
      chartArea.top,
      yAxis.min,
      yAxis.max
    )
  }

  calculateNewXValue = (position, chartArea, xAxis) => {
    return this.map(
      position.x,
      chartArea.left,
      chartArea.right,
      xAxis.min,
      xAxis.max
    )
  }

  updateControlPointPosition = (chart, activePoint, newXValue, newYValue) => {
    const datasetIndex = activePoint.datasetIndex
    const pointIndex = activePoint.index
    chart.data.datasets[datasetIndex].data[pointIndex].x = newXValue
    chart.data.datasets[datasetIndex].data[pointIndex].y = newYValue
  }

  updateOriginalData = (chart, activePoint) => {
    const datasetIndex = activePoint.datasetIndex
    const pointIndex = activePoint.index
    const datasetLabel = chart.data.datasets[datasetIndex].label
    const xValue = chart.data.datasets[datasetIndex].data[pointIndex].x
    const yValue = chart.data.datasets[datasetIndex].data[pointIndex].y

    this.state.originalData[datasetLabel]["x"][pointIndex] = xValue
    this.state.originalData[datasetLabel]["y"][pointIndex] = yValue
  }

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const activePoint = this.state.activePoint
      const position = getRelativePosition(event, chart)
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

      // Update control point position
      this.updateControlPointPosition(chart, activePoint, newXValue, newYValue)
      // Set new values in originalData
      this.updateOriginalData(chart, activePoint)

      // Recalculate Bezier data
      const bezierData = createBezierData(
        this.state.originalData,
        this.props.args.options
      )
      // Update state
      this.setState({ bezierData })
      chart.update("none")
    }
  }

  upHandler = (event) => {
    if (this.state.activePoint) {
      this.sendBezierData()
      this.setState({ activePoint: null })
      this.togglePan(true)
    }
  }

  convertBezierData(bezierData) {
    const result = {}
    bezierData.forEach((dataset) => {
      const trace = dataset.label.replace(" (bezier)", "")
      result[trace] = {
        x: [],
        y: [],
      }
      dataset.data.forEach((point) => {
        const { x, y } = point
        const index = result[trace].x.findIndex(
          (val, i) => val === x && result[trace].y[i] === y
        )
        if (index === -1) {
          result[trace].x.push(x)
          result[trace].y.push(y)
        }
      })
    })
    return result
  }

  map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
  }

  render() {
    return (
      <Scatter
        ref={this.chartRef}
        data={{
          datasets: [
            ...this.fixedData.datasets,
            ...this.state.controlData.datasets,
            ...this.state.bezierData.datasets,
          ],
        }}
        options={this.state.options}
        onPointerDown={this.downHandler}
        onPointerUp={this.upHandler}
        onPointerMove={this.moveHandler}
      />
    )
  }
}

export default BezierChart
