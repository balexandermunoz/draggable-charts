import { Bezier } from "bezier-js"

export function createControlData(data, options) {
  const fillGaps = options && options.fill_gaps ? options.fill_gaps : false
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
    return {
      data: data,
      isControlPoint: true,
      label: colName,
      fill: false,
      tension: 0,
      cubicInterpolationMode: "default",
      spanGaps: fillGaps,
      showLine: true,
      borderDash: [5, 5],
      borderWidth: 1,
    }
  })

  return {
    datasets: datasets,
  }
}

export function createBezierData(data, options) {
  const datasets = Object.entries(data).map(([trace, traceData], i) => {
    const points = traceData.x.map((x, j) => ({
      x: x,
      y: traceData.y[j],
    }))

    const bezierSegments = []
    for (let i = 0; i < points.length - 2; i += 2) {
      const bezierPoints = points.slice(i, i + 3)
      const bezier = new Bezier(bezierPoints)
      const lut = bezier.getLUT(10)
      bezierSegments.push(...lut)
    }
    return {
      label: trace + " (bezier)",
      data: bezierSegments,
      isControlPoint: false,
      showLine: true,
      tension: 0.3,
      pointRadius: 0,
    }
  })

  if (options && options.colors) {
    datasets.forEach((dataset, index) => {
      dataset.backgroundColor = options.colors[index % options.colors.length]
      dataset.borderColor = options.colors[index % options.colors.length]
    })
  }

  return { datasets }
}
