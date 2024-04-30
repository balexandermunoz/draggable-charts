import { Bezier } from "bezier-js"
import rgba from "color-rgba"

export function createFixedData(data, options) {
  const fixedLines = options && options.fixed_lines ? options.fixed_lines : []
  const datasets = Object.entries(data)
    .filter(([colName]) => fixedLines.includes(colName))
    .map(([colName, colData], index) => {
      const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
      const colorRGBA = rgba(colData.color)
      const backgroundColorRGBA = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, 0.7)`
      return {
        data: data,
        isControlPoint: false,
        label: colName,
        fill: false,
        tension: 0.3,
        spanGaps: false,
        showLine: true,
        backgroundColor: backgroundColorRGBA,
        borderColor: colData.color,
      }
    })

  return {
    datasets: datasets,
  }
}

export function createControlData(data, options) {
  const fillGaps = options && options.fill_gaps ? options.fill_gaps : false
  const fixedLines = options && options.fixed_lines ? options.fixed_lines : []
  const lineControl = (ctx, value, length) => {
    const index = ctx.p1DataIndex
    if (
      (index % 3 === 0 && index < length - 1) ||
      index % 3 === 1 ||
      index == length - 1
    ) {
      return value
    } else {
      return undefined
    }
  }
  const datasets = Object.entries(data)
    .filter(([colName]) => !fixedLines.includes(colName))
    .map(([colName, colData], index) => {
      const data = colData.x.map((x, i) => ({ x, y: colData.y[i] }))
      const colorRGBA = rgba(colData.color)
      const borderColorRGBA = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, 1)`
      const backgroundColorRGBA = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, 0.8)`
      return {
        data: data,
        isControlPoint: true,
        label: colName,
        spanGaps: fillGaps,
        showLine: true,
        borderDash: [8, 5],
        borderWidth: 1.2,
        segment: {
          borderColor: (ctx) => lineControl(ctx, borderColorRGBA, data.length),
        },
        backgroundColor: backgroundColorRGBA,
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
      for (let i = 0; i < points.length - 3; i += 3) {
        const bezierPoints = points.slice(i, i + 4)
        const bezier = new Bezier(bezierPoints)
        const lut = bezier.getLUT(10)
        bezierSegments.push(...lut)
      }
      const colorRGBA = rgba(traceData.color)
      const backgroundColorRGBA = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, 0.7)`
      const borderColorRGBA = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, 0.6)`
      return {
        label: trace + " (bezier)",
        data: bezierSegments,
        isControlPoint: false,
        showLine: true,
        tension: 0.3,
        pointRadius: 0,
        backgroundColor: backgroundColorRGBA,
        borderColor: borderColorRGBA,
      }
    })

  return { datasets }
}