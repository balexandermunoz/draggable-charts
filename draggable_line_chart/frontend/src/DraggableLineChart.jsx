import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import zoomPlugin from "chartjs-plugin-zoom"
import React from "react"
import { Line, getElementAtEvent } from "react-chartjs-2"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import { createChartData } from "./chartData"
import { createOptions } from "./chartOptions"

Chart.register(...registerables, zoomPlugin)

class DraggableLineChart extends StreamlitComponentBase {
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

  upHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const datasetLabel =
        chart.data.datasets[this.state.activePoint.datasetIndex].label
      const xLabel = this.state.chartData.labels[this.state.activePoint.index]
      const yValue =
        chart.data.datasets[this.state.activePoint.datasetIndex].data[
          this.state.activePoint.index
        ]

      this.state.originalData[datasetLabel][xLabel] = yValue
      this.setState({ activePoint: null })
      this.togglePan(true)
      Streamlit.setComponentValue(this.state.originalData)
    }
  }

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current
      const position = getRelativePosition(event, this.chartRef.current)
      const chartArea = chart.chartArea
      const yAxis = chart.scales.y
      const yValue = this.map(
        position.y,
        chartArea.bottom,
        chartArea.top,
        yAxis.min,
        yAxis.max
      )
      chart.data.datasets[this.state.activePoint.datasetIndex].data[
        this.state.activePoint.index
      ] = yValue
      chart.update("none")
    }
  }

  map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
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

export default withStreamlitConnection(DraggableLineChart)
