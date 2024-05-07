export function createChartData(data, options) {
  const xLabels = options && options.x_labels ? options.x_labels : []
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
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
