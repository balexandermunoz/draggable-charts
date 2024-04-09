export function createOptions(options, theme) {
  return {
    responsive: true,
    animation: {
      duration: 0,
    },
    tooltips: {
      mode: "nearest",
    },
    onHover: createHoverOptions(),
    plugins: {
      zoom: createZoomOptions(),
      title: createTitleOptions(options),
      legend: createLegendOptions(),
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
      mode: "xy",
    },
    pan: {
      enabled: false,
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

function createLegendOptions() {
  return {
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
  return {
    x: {
      display: true,
      title: {
        display: true,
        text: options.x_label,
      },
      grid: {
        display: options.x_grid,
        color: theme.fadedText05,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: options.y_label,
      },
      grid: {
        display: options.y_grid,
        color: theme.fadedText05,
      },
    },
  }
}
