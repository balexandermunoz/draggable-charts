export function createOptions(options) {
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
    scales: createScalesOptions(options),
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
      mode: "x",
    },
    pan: {
      enabled: false,
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

function createScalesOptions(options) {
  return {
    x: {
      display: true,
      title: {
        display: true,
        text: options.x_label,
      },
      grid: {
        display: options.x_grid,
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
      },
    },
  }
}
