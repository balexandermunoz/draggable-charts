export function createChartData(data, options) {
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

  if (options && options.colors) {
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
