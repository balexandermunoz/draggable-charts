import React from "react"
import { Chart, registerables } from "chart.js"
import { getRelativePosition } from "chart.js/helpers"
import { Line, getElementAtEvent } from "react-chartjs-2"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import zoomPlugin from "chartjs-plugin-zoom"

Chart.register(...registerables, zoomPlugin)

class DraggableLineChart extends StreamlitComponentBase {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
    this.state = {
      activePoint: null,
      chartData: this.createChartData(
        props.args.data,
        props.args.options.colors
      ),
      options: this.createOptions(props.args.options),
    }
  }

  componentDidUpdate(prevProps) {
    Streamlit.setFrameHeight()
    if (this.props.args !== prevProps.args) {
      this.setState({
        chartData: this.createChartData(
          this.props.args.data,
          this.props.args.options
        ),
        options: this.createOptions(this.props.args.options),
      })
    }
  }

  createChartData(data, options) {
    const datasets = Object.entries(data).map(([colName, colData], index) => {
      const data = Object.values(colData)
      return {
        data,
        label: colName,
        fill: false,
        lineTension: 0.3,
        cubicInterpolationMode: "monotone",
      }
    })

    if (options.colors) {
      datasets.forEach((dataset, index) => {
        dataset.backgroundColor = options.colors[index]
        dataset.borderColor = options.colors[index]
      })
    }

    return {
      labels: Object.keys(data.Col1),
      datasets: datasets,
    }
  }

  createOptions(options) {
    return {
      responsive: true,
      animation: {
        duration: 0,
      },
      tooltips: {
        mode: "nearest",
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          event.native.target.style.cursor = "crosshair"
        } else {
          event.native.target.style.cursor = "default"
        }
      },
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: "x",
          },
          pan: {
            enabled: false,
          },
        },
        title: {
          display: true,
          text: options.title,
        },
        legend: {
          onHover: (event, legendItem, legend) => {
            if (legendItem) {
              event.native.target.style.cursor = "pointer"
            } else {
              event.native.target.style.cursor = "default"
            }
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: options.x_label,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: options.y_label,
          },
        },
      },
    }
  }

  downHandler = (event) => {
    const points = getElementAtEvent(this.chartRef.current, event, {
      intersect: false,
    })
    if (points.length > 0) {
      this.setState({ activePoint: points[0] })
    }
  }

  upHandler = (event) => {
    if (this.state.activePoint) {
      const data = this.chartRef.current.data.datasets.reduce(
        (acc, dataset) => {
          const colData = dataset.data.reduce((colAcc, value, index) => {
            colAcc[this.state.chartData.labels[index]] = value
            return colAcc
          }, {})
          acc[dataset.label] = colData
          return acc
        },
        {}
      )

      Streamlit.setComponentValue(data)
    }
    this.setState({ activePoint: null })
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
      chart.update()
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
