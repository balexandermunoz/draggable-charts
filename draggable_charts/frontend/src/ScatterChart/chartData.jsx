export function createChartData(data, options) {
  const xLabels = options && options.x_labels ? options.x_labels : []
  const showLine = options && options.show_line ? options.show_line : false
  const tension =
    options && options.tension !== undefined
      ? Math.min(Math.max(options.tension, 0), 0.4)
      : 0.3
  const fillGaps = options && options.fill_gaps ? options.fill_gaps : false
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
    return {
      showLine: showLine,
      data: data,
      label: colName,
      fill: false,
      lineTension: tension,
      cubicInterpolationMode: "default",
      spanGaps: fillGaps,
      backgroundColor: colData.color,
      borderColor: colData.color,
      pointRadius: colData.point_radius,
    }
  })

  return {
    labels: xLabels,
    datasets: datasets,
  }
}
