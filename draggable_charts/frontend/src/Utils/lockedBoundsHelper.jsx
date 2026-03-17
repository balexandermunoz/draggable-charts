/**
 * Utility functions for managing persistent Y bounds across all chart types.
 * These functions handle expanding Y-axis limits as points are dragged outside
 * the current view, and provide methods to reset zoom bounds.
 */

/**
 * Updates the locked Y bounds to expand as needed when dragging points.
 * Bounds never shrink, only expand as new Y values are encountered.
 * @param {Object} component - The React component instance (this)
 * @param {Chart} chart - Chart.js instance
 * @param {number} newYValue - The new Y value being dragged to
 */
export const updateLockedYBounds = (component, chart, newYValue) => {
  if (!chart?.scales?.y) {
    return
  }

  const yScale = chart.scales.y
  if (!component.originalYBounds) {
    captureOriginalYBounds(component)
  }

  if (!component.lockedYBounds) {
    component.lockedYBounds = {
      min: yScale.min,
      max: yScale.max,
    }
  }

  component.lockedYBounds.min = Math.min(
    component.lockedYBounds.min,
    newYValue
  )
  component.lockedYBounds.max = Math.max(
    component.lockedYBounds.max,
    newYValue
  )

  chart.options.scales.y.min = component.lockedYBounds.min
  chart.options.scales.y.max = component.lockedYBounds.max
}

/**
 * Applies the locked Y bounds to the chart.
 * Called after Streamlit rerenders to restore persistent bounds.
 * @param {Object} component - The React component instance (this)
 */
export const applyLockedYBounds = (component) => {
  if (!component.lockedYBounds) {
    return
  }

  const chart = component.chartRef.current
  if (!chart?.options?.scales?.y) {
    return
  }

  chart.options.scales.y.min = component.lockedYBounds.min
  chart.options.scales.y.max = component.lockedYBounds.max
  chart.update("none")
}

/**
 * Captures the original Y bounds on first drag/interaction.
 * Enables reset functionality to return to initial zoom state.
 * @param {Object} component - The React component instance (this)
 */
export const captureOriginalYBounds = (component) => {
  const chart = component.chartRef.current
  if (!chart?.scales?.y) {
    return
  }

  component.originalYBounds = {
    min: chart.scales.y.min,
    max: chart.scales.y.max,
  }
}

/**
 * Creates a snapshot of original chart data for reset functionality.
 * Called once to preserve initial dataset state.
 * @param {Object} component - The React component instance (this)
 */
export const snapshotOriginalChartData = (component) => {
  const chart = component.chartRef.current
  if (!chart?.data?.datasets) {
    return
  }

  component.originalChartData = JSON.parse(
    JSON.stringify(chart.data.datasets)
  )
}
