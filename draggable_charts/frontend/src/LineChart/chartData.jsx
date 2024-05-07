export function createChartData(data, options) {
  const xLabels = Object.keys(data[Object.keys(data)[0]])
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const data = Object.values(colData)
    return {
      showLine: options.show_line,
      data: data,
      label: colName,
      lineTension: options.tension,
      cubicInterpolationMode: "default",
      spanGaps: options.fill_gaps,
      backgroundColor: colData.color,
      borderColor: colData.color,
      pointRadius: colData.point_radius,
      borderDash: colData.border_dash,
    }
  })

  return {
    labels: xLabels,
    datasets: datasets,
  }
}
