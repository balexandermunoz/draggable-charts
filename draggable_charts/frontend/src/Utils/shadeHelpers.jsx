/**
 * Helper functions for handling shade_between functionality
 * These functions manage synchronized movement of min/max lines with their central line
 */

/**
 * Finds and stores original values for min/max lines when dragging starts
 * @param {Object} chart - Chart.js chart instance
 * @param {string} datasetLabel - Label of the dataset being dragged
 * @param {number} pointIndex - Index of the point being dragged
 * @param {Object} options - Chart options containing shade_between configuration
 * @param {Object} labels - Chart labels (for line charts) or null (for scatter charts)
 * @returns {Object} Original values for min/max lines
 */
export function storeOriginalShadeValues(chart, datasetLabel, pointIndex, options, labels = null) {
  const result = {
    hasShade: false,
    minValues: null,
    maxValues: null,
  }

  const shadeBetween = options.shade_between
  if (!shadeBetween) {
    return result
  }

  Object.entries(shadeBetween).forEach(([targetLine, config]) => {
    if (datasetLabel === targetLine) {
      result.hasShade = true

      // Find and store the original min values
      const minDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.min
      )
      if (minDatasetIndex !== -1) {
        if (labels) {
          // Line chart - uses labels
          const xLabel = labels[pointIndex]
          result.minValues = {
            y: chart.data.datasets[minDatasetIndex].data[xLabel]
          }
        } else {
          // Scatter chart - uses x/y coordinates
          result.minValues = {
            x: chart.data.datasets[minDatasetIndex].data[pointIndex].x,
            y: chart.data.datasets[minDatasetIndex].data[pointIndex].y
          }
        }
      }

      // Find and store the original max values
      const maxDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.max
      )
      if (maxDatasetIndex !== -1) {
        if (labels) {
          // Line chart - uses labels
          const xLabel = labels[pointIndex]
          result.maxValues = {
            y: chart.data.datasets[maxDatasetIndex].data[xLabel]
          }
        } else {
          // Scatter chart - uses x/y coordinates
          result.maxValues = {
            x: chart.data.datasets[maxDatasetIndex].data[pointIndex].x,
            y: chart.data.datasets[maxDatasetIndex].data[pointIndex].y
          }
        }
      }
    }
  })

  return result
}

/**
 * Updates min/max lines based on the delta movement of the central line (Line Chart)
 * @param {Object} chart - Chart.js chart instance
 * @param {string} datasetLabel - Label of the dataset being dragged
 * @param {number} pointIndex - Index of the point being dragged
 * @param {number} deltaY - Change in Y value
 * @param {Object} options - Chart options containing shade_between configuration
 * @param {Array} labels - Chart labels
 * @param {Object} originalMinValue - Original min Y value
 * @param {Object} originalMaxValue - Original max Y value
 */
export function updateShadeLines(chart, datasetLabel, pointIndex, deltaY, options, labels, originalMinValue, originalMaxValue) {
  const shadeBetween = options.shade_between
  if (!shadeBetween) {
    return
  }

  const xLabel = labels[pointIndex]

  Object.entries(shadeBetween).forEach(([targetLine, config]) => {
    if (datasetLabel === targetLine) {
      // Update the min line by applying delta to the original min value
      const minDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.min
      )
      if (minDatasetIndex !== -1 && originalMinValue !== null) {
        chart.data.datasets[minDatasetIndex].data[xLabel] = originalMinValue.y + deltaY
      }

      // Update the max line by applying delta to the original max value
      const maxDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.max
      )
      if (maxDatasetIndex !== -1 && originalMaxValue !== null) {
        chart.data.datasets[maxDatasetIndex].data[xLabel] = originalMaxValue.y + deltaY
      }
    }
  })
}

/**
 * Updates min/max lines based on the delta movement of the central line (Scatter Chart)
 * @param {Object} chart - Chart.js chart instance
 * @param {string} datasetLabel - Label of the dataset being dragged
 * @param {number} pointIndex - Index of the point being dragged
 * @param {number} deltaX - Change in X value
 * @param {number} deltaY - Change in Y value
 * @param {Object} options - Chart options containing shade_between configuration
 * @param {Object} originalMinValues - Original min X and Y values
 * @param {Object} originalMaxValues - Original max X and Y values
 */
export function updateShadeScatter(chart, datasetLabel, pointIndex, deltaX, deltaY, options, originalMinValues, originalMaxValues) {
  const shadeBetween = options.shade_between
  if (!shadeBetween) {
    return
  }

  Object.entries(shadeBetween).forEach(([targetLine, config]) => {
    if (datasetLabel === targetLine) {
      // Update the min line by applying deltas to the original min values
      const minDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.min
      )
      if (minDatasetIndex !== -1 && originalMinValues !== null) {
        chart.data.datasets[minDatasetIndex].data[pointIndex].x = originalMinValues.x + deltaX
        chart.data.datasets[minDatasetIndex].data[pointIndex].y = originalMinValues.y + deltaY
      }

      // Update the max line by applying deltas to the original max values
      const maxDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.max
      )
      if (maxDatasetIndex !== -1 && originalMaxValues !== null) {
        chart.data.datasets[maxDatasetIndex].data[pointIndex].x = originalMaxValues.x + deltaX
        chart.data.datasets[maxDatasetIndex].data[pointIndex].y = originalMaxValues.y + deltaY
      }
    }
  })
}

/**
 * Saves the updated values for min/max lines to original data (Line Chart)
 * @param {Object} chart - Chart.js chart instance
 * @param {string} datasetLabel - Label of the dataset being dragged
 * @param {number} pointIndex - Index of the point being dragged
 * @param {Object} options - Chart options containing shade_between configuration
 * @param {Array} labels - Chart labels
 * @param {Object} originalData - Original data object to update
 */
export function saveShadeData(chart, datasetLabel, pointIndex, options, labels, originalData) {
  const shadeBetween = options.shade_between
  if (!shadeBetween) {
    return
  }

  const xLabel = labels[pointIndex]

  Object.entries(shadeBetween).forEach(([targetLine, config]) => {
    if (datasetLabel === targetLine) {
      // Update the min line data
      const minDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.min
      )
      if (minDatasetIndex !== -1) {
        const minYValue = chart.data.datasets[minDatasetIndex].data[xLabel]
        originalData[config.min]["data"][xLabel] = minYValue
      }

      // Update the max line data
      const maxDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.max
      )
      if (maxDatasetIndex !== -1) {
        const maxYValue = chart.data.datasets[maxDatasetIndex].data[xLabel]
        originalData[config.max]["data"][xLabel] = maxYValue
      }
    }
  })
}

/**
 * Saves the updated values for min/max lines to original data (Scatter Chart)
 * @param {Object} chart - Chart.js chart instance
 * @param {string} datasetLabel - Label of the dataset being dragged
 * @param {number} pointIndex - Index of the point being dragged
 * @param {Object} options - Chart options containing shade_between configuration
 * @param {Object} originalData - Original data object to update
 */
export function saveShadeScatterData(chart, datasetLabel, pointIndex, options, originalData) {
  const shadeBetween = options.shade_between
  if (!shadeBetween) {
    return
  }

  Object.entries(shadeBetween).forEach(([targetLine, config]) => {
    if (datasetLabel === targetLine) {
      // Update the min line data
      const minDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.min
      )
      if (minDatasetIndex !== -1) {
        const minXValue = chart.data.datasets[minDatasetIndex].data[pointIndex].x
        const minYValue = chart.data.datasets[minDatasetIndex].data[pointIndex].y
        originalData[config.min]["x"][pointIndex] = minXValue
        originalData[config.min]["y"][pointIndex] = minYValue
      }

      // Update the max line data
      const maxDatasetIndex = chart.data.datasets.findIndex(
        ds => ds.label === config.max
      )
      if (maxDatasetIndex !== -1) {
        const maxXValue = chart.data.datasets[maxDatasetIndex].data[pointIndex].x
        const maxYValue = chart.data.datasets[maxDatasetIndex].data[pointIndex].y
        originalData[config.max]["x"][pointIndex] = maxXValue
        originalData[config.max]["y"][pointIndex] = maxYValue
      }
    }
  })
}
