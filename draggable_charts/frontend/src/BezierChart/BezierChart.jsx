import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"

import { Scatter, getElementAtEvent } from "react-chartjs-2"
import { Streamlit, StreamlitComponentBase } from "streamlit-component-lib"
import { createControlData, createBezierData } from "./chartData"
import { createOptions } from "./chartOptions"

Chart.register(...registerables, zoomPlugin)

class BezierChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.state = {
      activePoint: null,
      originalData: props.args.data,
      controlData: createControlData(
        this.props.args.data,
        this.props.args.options
      ),
      bezierData: createBezierData(
        this.props.args.data,
        this.props.args.options.colors
      ),
      options: createOptions(props.args.options, props.theme),
    }
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
          this.props.args.options.colors
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

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current;
      const position = getRelativePosition(event, this.chartRef.current);
      const chartArea = chart.chartArea;
  
      const newYValue = this.calculateNewYValue(
        position,
        chartArea,
        chart.scales.y
      );
  
      const newXValue = this.calculateNewXValue(
        position,
        chartArea,
        chart.scales.x
      );
  
      // Update control point position
      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ].y = newYValue;
  
      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ].x = newXValue;

      // Set new values in originalData
      const datasetIndex = this.state.activePoint.datasetIndex
      const pointIndex = this.state.activePoint.index
      const datasetLabel = chart.data.datasets[datasetIndex].label
      const xValue = chart.data.datasets[datasetIndex].data[pointIndex].x
      const yValue = chart.data.datasets[datasetIndex].data[pointIndex].y

      this.state.originalData[datasetLabel]["x"][pointIndex] = xValue
      this.state.originalData[datasetLabel]["y"][pointIndex] = yValue

      // Recalculate Bezier data
      const bezierData = createBezierData(
        this.state.originalData,
        this.props.args.options.colors
      );
      // Update state
      this.setState({ bezierData });
      chart.update("none");
    }
  };

  upHandler = (event) => {
    if (this.state.activePoint) {
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
        data={{
          datasets: [
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
