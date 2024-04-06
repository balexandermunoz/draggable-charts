import React from "react";
import { Chart, registerables } from "chart.js";
import { getRelativePosition } from 'chart.js/helpers';
import { Line, getElementAtEvent } from "react-chartjs-2";
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"

Chart.register(...registerables);

class MyChartComponent extends StreamlitComponentBase {
  constructor(props) {
    super(props);
    console.log(props.args)
    this.chartRef = React.createRef();

    const datasets = Object.entries(props.args.data).map(([colName, colData], index) => {
      const data = Object.values(colData);
      return {
        data,
        label: colName,
        fill: false,
        lineTension: 0.3,
        cubicInterpolationMode: 'monotone'
      };
    });
    if (props.args.colors) {
      datasets.forEach((dataset, index) => {
        dataset.borderColor = props.args.colors[index];
      });
    }
    this.state = {
      activePoint: null,
      chartData: {
        labels: Object.keys(props.args.data.Col1),
        datasets: datasets,
      },
    };
  }

  options = {
    animation: {
      duration: 0,
    },
    tooltips: {
      mode: "nearest",
    },
    onHover: (event, chartElement) => {
      if (event && event.target) {
        event.target.style.cursor = chartElement[0] ? "pointer" : "default";
      }
    },
    plugins: {
      title: {
         display: true,
         text: this.props.args.title
       }
    }
  };

  downHandler = (event) => {
    const points = getElementAtEvent(this.chartRef.current, event, {
      intersect: false,
    });
    if (points.length > 0) {
      this.setState({ activePoint: points[0] });
    }
  };

  upHandler = (event) => {
    if (this.state.activePoint){
      const data = this.chartRef.current.data.datasets.reduce((acc, dataset) => {
        const colData = dataset.data.reduce((colAcc, value, index) => {
          colAcc[this.state.chartData.labels[index]] = value;
          return colAcc;
        }, {});
        acc[dataset.label] = colData;
        return acc;
      }, {});
  
      Streamlit.setComponentValue(data);
      console.log(data);
    }
    this.setState({ activePoint: null });
  };

  moveHandler = (event) => {
    if (this.state.activePoint) {
      const chart = this.chartRef.current;
      const position = getRelativePosition(event, this.chartRef.current);
      const chartArea = chart.chartArea;
      const yAxis = chart.scales.y;
      const yValue = this.map(
        position.y,
        chartArea.bottom,
        chartArea.top,
        yAxis.min,
        yAxis.max
      );
      chart.data.datasets[this.state.activePoint.datasetIndex].data[this.state.activePoint.index] =
        yValue;
      chart.update();
    }
  };

  map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  };

  render() {
    return (
      <div style={{ position: "relative" }}>
        <Line
          ref={this.chartRef}
          data={this.state.chartData}
          options={this.options}
          onPointerDown={this.downHandler}
          onPointerUp={this.upHandler}
          onPointerMove={this.moveHandler}
        />
      </div>
    );
  }
}

export default withStreamlitConnection(MyChartComponent);