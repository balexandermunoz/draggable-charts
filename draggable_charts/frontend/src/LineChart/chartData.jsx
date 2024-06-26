export function createChartData(data, options) {
  const xLabels = Object.keys(data[Object.keys(data)[0]].data)
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    return {
      showLine: options.show_line,
      data: colData.data,
      label: colName,
      lineTension: options.tension,
      cubicInterpolationMode: "default",
      spanGaps: options.fill_gaps,
      backgroundColor: colData.color,
      borderColor: colData.color,
      pointRadius: colData.point_radius,
      borderDash: colData.border_dash,
      fill: {
        target: colData.fill,
        above: 'rgb(128, 128, 128, 0.2)',
        below: 'rgb(128, 128, 128, 0.2)',
      },
    }
  })

  return {
    labels: xLabels,
    datasets: datasets,
  }
}
