export function createOptions(options) {
    return {
      responsive: true,
      animation: {
        duration: 0,
      },
      tooltips: {
        mode: "nearest",
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          event.native.target.style.cursor = "crosshair"
        } else {
          event.native.target.style.cursor = "default"
        }
      },
      plugins: {
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: "x",
          },
          pan: {
            enabled: false,
          },
        },
        title: {
          display: true,
          text: options.title,
        },
        legend: {
          onHover: (event, legendItem, legend) => {
            if (legendItem) {
              event.native.target.style.cursor = "pointer"
            } else {
              event.native.target.style.cursor = "default"
            }
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: options.x_label,
          },
          grid: {
            display: options.x_grid
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: options.y_label,
          },
          grid: {
            display: options.y_grid
          },
        },
      },
    }
  }
