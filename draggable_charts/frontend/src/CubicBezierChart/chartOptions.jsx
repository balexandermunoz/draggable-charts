export function createOptions(options, theme) {
  return {
    responsive: true,
    indexAxis: "x",
    animation: {
      duration: 0,
    },
    onHover: createHoverOptions(),
    plugins: {
      tooltip: {
        filter: function (tooltipItem) {
          return !tooltipItem.dataset.label.includes("bezier")
        },
      },
      zoom: createZoomOptions(),
      title: createTitleOptions(options),
      legend: createLegendOptions(options),
    },
    scales: createScalesOptions(options, theme),
  }
}

function createHoverOptions() {
  return (event, chartElement) => {
    if (chartElement.length > 0) {
      event.native.target.style.cursor = "crosshair"
    } else {
      event.native.target.style.cursor = "default"
    }
  }
}

function createZoomOptions() {
  return {
    zoom: {
      wheel: {
        enabled: true,
      },
      mode: "y",
    },
    pan: {
      enabled: true,
    },
    limits: {
      x: { min: "original", max: "original" },
      y: { min: "original", max: "original" },
    },
  }
}

function createTitleOptions(options) {
  return {
    display: true,
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

function createScalesOptions(options, theme) {
  const xScaleOptions = {
    display: true,
    type: options.x_type,
    title: {
      display: true,
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
    type: options.y_type,
    title: {
      display: true,
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
