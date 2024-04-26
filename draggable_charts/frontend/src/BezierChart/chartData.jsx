import { Bezier } from "bezier-js"
// import rgba from "color-rgba"

export function createFixedData(data, options) {
  const fixedLines = options && options.fixed_lines ? options.fixed_lines : []
  const datasets = Object.entries(data)
    .filter(([colName]) => fixedLines.includes(colName))
    .map(([colName, colData], index) => {
      const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
      return {
        data: data,
        isControlPoint: false,
        label: colName,
        fill: false,
        tension: 0.3,
        cubicInterpolationMode: "default",
        spanGaps: false,
        showLine: true,
        borderWidth: 1,
      }
    })

  return {
    datasets: datasets,
  }
}

export function createControlData(data, options) {
  const fillGaps = options && options.fill_gaps ? options.fill_gaps : false
  const fixedLines = options && options.fixed_lines ? options.fixed_lines : []
  const datasets = Object.entries(data)
    .filter(([colName]) => !fixedLines.includes(colName))
    .map(([colName, colData], index) => {
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
  const fixedLines = options && options.fixed_lines ? options.fixed_lines : []
  const datasets = Object.entries(data)
    .filter(([trace]) => !fixedLines.includes(trace))
    .map(([trace, traceData], i) => {
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

  return { datasets }
}
