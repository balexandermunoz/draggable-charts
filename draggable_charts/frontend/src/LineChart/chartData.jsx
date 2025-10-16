export function createChartData(data, options) {
  const xLabels = Object.keys(data[Object.keys(data)[0]].data)
  const datasets = Object.entries(data).map(([colName, colData], index) => {
    const dataset = {
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
      fill: false,
    }
    
    // Check if this line should have shading
    if (options.shade_between) {
      Object.entries(options.shade_between).forEach(([targetLine, config]) => {
        // If this is the max line, fill down to the min line
        if (colName === config.max) {
          const minIndex = Object.keys(data).indexOf(config.min)
          if (minIndex !== -1) {
            dataset.fill = minIndex
            dataset.backgroundColor = hexToRgba(config.color || colData.color, config.alpha || 0.2)
            dataset.borderColor = colData.color
          }
        }
      })
    }
    
    return dataset
  })

  return {
    labels: xLabels,
    datasets: datasets,
  }
}

// Helper function to convert hex color to rgba
function hexToRgba(hex, alpha) {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
