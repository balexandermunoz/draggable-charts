export function createChartData(data, options) {
  const tension =
    options && options.tension !== undefined
      ? Math.min(Math.max(options.tension, 0), 0.4)
      : 0.3
  const fillGaps = options && options.fill_gaps ? options.fill_gaps : false
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const data = Object.values(colData)
    return {
      data,
      label: colName,
      fill: false,
      lineTension: tension,
      cubicInterpolationMode: "default",
      spanGaps: fillGaps,
    }
  })

  if (options && options.colors) {
    datasets.forEach((dataset, index) => {
      dataset.backgroundColor = options.colors[index]
      dataset.borderColor = options.colors[index]
    })
  }

  return {
    labels: Object.keys(data[Object.keys(data)[0]]),
    datasets: datasets,
  }
}
