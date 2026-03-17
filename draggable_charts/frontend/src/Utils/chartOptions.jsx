import { Chart } from "chart.js"
import { format as d3Format } from "https://cdn.skypack.dev/d3-format@3"

export function createOptions(options, theme, zoomOptionsOverride = null) {
  return {
    responsive: true,
    indexAxis: "x",
    animation: {
      duration: 0,
    },
    onHover: createHoverOptions(options),
    plugins: {
      zoom: createZoomOptions(zoomOptionsOverride),
      title: createTitleOptions(options),
      legend: createLegendOptions(options),
      tooltip: createTooltipOptions(options, theme),
      filler: {
        propagate: false,
      },
    },
    scales: createScalesOptions(options, theme),
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }
}

function createHoverOptions(options) {
  return (event, chartElement) => {
    let cursorStyle = "default"
    if (chartElement.length > 0) {
      const datasets = event.chart.data.datasets
      const label = datasets[chartElement[0].datasetIndex].label
      cursorStyle = determineCursorStyle(label, options)
    }
    event.native.target.style.cursor = cursorStyle
  }
}

function determineCursorStyle(label, options) {
  if (options.fixed_lines.includes(label)) {
    return "default"
  }
  return "crosshair"
}

function createZoomOptions(zoomOptionsOverride = null) {
  const defaultZoomOptions = {
    zoom: {
      wheel: {
        enabled: true,
      },
      mode: "xy",
    },
    pan: {
      enabled: true,
    },
    limits: {
      x: { min: "original", max: "original" },
      y: { min: "original", max: "original" },
    },
  }

  if (!zoomOptionsOverride) {
    return defaultZoomOptions
  }

  return {
    ...defaultZoomOptions,
    ...zoomOptionsOverride,
    zoom: {
      ...defaultZoomOptions.zoom,
      ...(zoomOptionsOverride.zoom || {}),
    },
    pan: {
      ...defaultZoomOptions.pan,
      ...(zoomOptionsOverride.pan || {}),
    },
    limits: {
      ...defaultZoomOptions.limits,
      ...(zoomOptionsOverride.limits || {}),
    },
  }
}

function createTitleOptions(options) {
  return {
    display: Boolean(options.title),
    text: options.title,
  }
}

function createLegendOptions(options) {
  return {
    display: options.legend,
    position: options.legend_position,
    align: options.legend_align,
    labels: {
      boxWidth: 16,
      boxHeight: 8,
      padding: 8,
      filter: function (legendItem, chartData) {
        if (options.hide_legends.includes(legendItem.text)) {
          return false
        }
        return true
      },
      generateLabels: function (chart) {
        const labels =
          Chart.defaults.plugins.legend.labels.generateLabels(chart)
        labels.forEach((label) => {
          if (options.labels.hasOwnProperty(label.text)) {
            label.text = options.labels[label.text]
          }
          if (
            options.labels.hasOwnProperty(label.text.replace(" (bezier)", ""))
          ) {
            label.text =
              options.labels[label.text.replace(" (bezier)", "")] + " (bezier)"
          }
        })
        return labels
      },
    },
    onHover: (event, legendItem, legend) => {
      if (legendItem) {
        event.native.target.style.cursor = "pointer"
      } else {
        event.native.target.style.cursor = "default"
      }
    },
  }
}

function convertNumericToDate(numericValue) {
  const year = Math.floor(numericValue)
  const decimal = numericValue - year
  
  // Calculate day of year from decimal (0.0 = Jan 1, 1.0 = Dec 31 next year)
  const daysInYear = isLeapYear(year) ? 366 : 365
  const dayOfYear = Math.floor(decimal * daysInYear) + 1
  
  // Convert day of year to month/day
  const date = new Date(year, 0) // January 1st of the year
  date.setDate(dayOfYear)
  
  // Format as YYYY/MM/DD
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}/${month}/${day}`
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

function formatTickValue(val, format, isTimeScale = false) {
  if (isTimeScale) {
    return convertNumericToDate(val)
  }
  if (format) {
    return d3Format(format)(val)
  }
  return this.getLabelForValue(val)
}

function createScalesOptions(options, theme) {
  const xScaleOptions = {
    display: true,
    type: options.x_type === "time" ? "linear" : options.x_type,
    ticks: {
      callback: function (val, index) {
        const isTimeScale = options.x_type === "time"
        const shouldFormat = options.x_type === "linear" && options.x_format
        return formatTickValue.call(this, val, shouldFormat, isTimeScale)
      },
    },
    title: {
      display: Boolean(options.x_label),
      text: options.x_label,
    },
    grid: {
      display: options.x_grid,
      color: theme.fadedText05,
    },
  }

  if (options.x_labels) {
    xScaleOptions.min = options.x_labels[0]
    xScaleOptions.max = options.x_labels[options.x_labels.length - 1]
  }

  const yScaleOptions = {
    display: true,
    type: options.y_type === "time" ? "linear" : options.y_type,
    ticks: {
      callback: function (val, index) {
        const isTimeScale = options.y_type === "time"
        const shouldFormat = options.y_type === "linear" && options.y_format
        return formatTickValue.call(this, val, shouldFormat, isTimeScale)
      },
    },
    title: {
      display: Boolean(options.y_label),
      text: options.y_label,
    },
    grid: {
      display: options.y_grid,
      color: theme.fadedText05,
    },
  }

  if (options.y_labels) {
    yScaleOptions.labels = options.y_labels
    yScaleOptions.min = options.y_labels[0]
    yScaleOptions.max = options.y_labels[options.y_labels.length - 1]
  }

  return {
    x: xScaleOptions,
    y: yScaleOptions,
  }
}

function createTooltipOptions(options, theme) {
  return {
    filter: function (data) {
      const pointRadius = data.dataset.pointRadius
      return pointRadius !== 0
    },
    callbacks: {
      title: function (data) {
        if (data.length === 0) {
          return ""
        }
        const label = data[0].dataset.label
        if (options.labels.hasOwnProperty(label)) {
          return `${options.labels[label]}`
        }
        return `${label}`
      },
      label: function (event) {
        if (!event.formattedValue.includes(", ")) {
          // Line chart
          let Xvalue = event.label
          let Yvalue = event.formattedValue
          
          // Convert to date format if using time scales
          if (options.x_type === "time") {
            Xvalue = convertNumericToDate(event.parsed.x)
          }
          if (options.y_type === "time") {
            Yvalue = convertNumericToDate(event.parsed.y)
          }
          
          return `${Xvalue}, ${Yvalue}`
        }
        
        // Scatter chart
        let [Xvalue, Yvalue] = event.formattedValue.slice(1, -1).split(", ")
        
        // Convert to date format if using time scales
        if (options.x_type === "time") {
          Xvalue = convertNumericToDate(event.parsed.x)
        }
        if (options.y_type === "time") {
          Yvalue = convertNumericToDate(event.parsed.y)
        }
        
        return `${Xvalue}, ${Yvalue}`
      },
    },
  }
}
