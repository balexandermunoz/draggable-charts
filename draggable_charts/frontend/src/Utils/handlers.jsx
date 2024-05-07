export function calculateNewYValue(position, chartArea, yAxis, type="linear") {
  if (type === "category") {
    const categories = yAxis.getLabels()
    const categoryIndex = Math.round(
      map(position.y, chartArea.top, chartArea.bottom, 0, categories.length - 1)
    )
    return categories[categoryIndex]
  } else {
    return map(
      position.y,
      chartArea.bottom,
      chartArea.top,
      yAxis.min,
      yAxis.max
    )
  }
}

export function calculateNewXValue(position, chartArea, xAxis, type="linear") {
  if (type === "category") {
    const categories = xAxis.getLabels()
    const categoryIndex = Math.round(
      map(position.x, chartArea.left, chartArea.right, 0, categories.length - 1)
    )
    return categories[categoryIndex]
  } else {
    return map(
      position.x,
      chartArea.left,
      chartArea.right,
      xAxis.min,
      xAxis.max
    )
  }
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
}
