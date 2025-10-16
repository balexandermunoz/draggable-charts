import numpy as np
import pandas as pd
import streamlit as st

from draggable_charts import line_chart, scatter_chart

st.title("Shaded Areas Between Lines")

st.markdown("""
This example demonstrates how to create shaded areas between min and max lines,
commonly used for confidence intervals, forecast bounds, or uncertainty visualization.

### How it works:
- Define a central line (e.g., "Forecast")
- Define min and max boundary lines (e.g., "Forecast_min", "Forecast_max")
- Use the `shade_between` option to specify the configuration

### Configuration:
```python
"shade_between": {
    "Forecast": {           # The target/central line
        "min": "Forecast_min",   # Name of the min boundary line
        "max": "Forecast_max",   # Name of the max boundary line
        "color": "#1f77b4",      # Color of the shaded area
        "alpha": 0.2             # Transparency (0.0 = transparent, 1.0 = opaque)
    }
}
```

### Tips:
- Use the same color for all three lines for a cohesive look
- Set `point_radius` to 0 for min/max lines to hide their points
- Use `border_dash` to make min/max lines dashed
- Add min/max lines to `fixed_lines` to prevent independent dragging
- Drag the central line to move all three lines together
""")

st.divider()

# ============================================================================
# LINE CHART EXAMPLE
# ============================================================================
st.header("📈 Line Chart Example")

st.markdown("""
A simple forecast with confidence intervals using a line chart.
""")

# Create data with a central line and min/max bounds
line_data = pd.DataFrame({
    "index": [2020 + i for i in range(1, 11)],
    "Forecast": [10, 12, 15, 18, 22, 26, 30, 35, 40, 45],
    "Forecast_min": [8, 10, 12, 15, 18, 21, 25, 29, 33, 37],
    "Forecast_max": [12, 14, 18, 21, 26, 31, 35, 41, 47, 53],
})
line_data = line_data.set_index("index")
line_data.index = line_data.index.astype(str)

line_options = {
    "title": "Forecast with Confidence Interval",
    "colors": ['#1f77b4', '#1f77b4', '#1f77b4'],  # Same color for all three lines
    "x_label": "Year",
    "y_label": "Value",
    "x_grid": True,
    "y_grid": True,
    'legend_position': 'top',
    'legend_align': 'center',
    'tension': 0.3,
    'fill_gaps': False,
    'fixed_lines': ["Forecast_min", "Forecast_max"],  # Prevent min/max lines from being dragged independently
    'labels': {
        "Forecast": "Forecast",
        "Forecast_min": "Min",
        "Forecast_max": "Max"
    },
    "point_radius": [3, 0, 0],  # Only show points on the main forecast line
    "border_dash": [(0, 0), (5, 5), (5, 5)],  # Dashed lines for min/max
    "shade_between": {
        "Forecast": {
            "min": "Forecast_min",
            "max": "Forecast_max",
            "color": "#1f77b4",
            "alpha": 0.2
        }
    }
}

new_line_data = line_chart(data=line_data, options=line_options, key="shade_line_chart")

with st.expander("Show Line Chart Data"):
    st.write(new_line_data)

st.divider()

# ============================================================================
# SCATTER CHART EXAMPLE
# ============================================================================
st.header("📊 Scatter Chart Example")

st.markdown("""
A projectile trajectory with uncertainty bounds using a scatter chart with connected lines.
**Note:** For scatter charts, you need to set `show_line: True` to connect the points.
""")

# Create scatter data with a central trajectory and min/max bounds
# Simulating a projectile motion with uncertainty
t = np.linspace(0, 10, 20)
x_central = t * 5
y_central = 50 * t - 4.9 * t**2

# Add some uncertainty bounds
x_min = x_central - 2
y_min = y_central - 5
x_max = x_central + 2
y_max = y_central + 5

scatter_data = {
    "Trajectory": {
        "x": x_central.tolist(),
        "y": y_central.tolist()
    },
    "Trajectory_min": {
        "x": x_min.tolist(),
        "y": y_min.tolist()
    },
    "Trajectory_max": {
        "x": x_max.tolist(),
        "y": y_max.tolist()
    }
}

scatter_options = {
    "title": "Projectile Trajectory with Uncertainty Bounds",
    "colors": ['#2ca02c', '#2ca02c', '#2ca02c'],  # Same green color for all three lines
    "x_label": "Horizontal Distance (m)",
    "y_label": "Height (m)",
    "x_grid": True,
    "y_grid": True,
    'legend_position': 'top',
    'legend_align': 'center',
    'tension': 0.3,
    'show_line': True,  # Important: connect scatter points with lines
    'fill_gaps': False,
    'fixed_lines': ["Trajectory_min", "Trajectory_max"],  # Prevent min/max lines from being dragged independently
    'labels': {
        "Trajectory": "Mean Trajectory",
        "Trajectory_min": "Lower Bound",
        "Trajectory_max": "Upper Bound"
    },
    "point_radius": [4, 0, 0],  # Only show points on the main trajectory
    "border_dash": [(0, 0), (5, 5), (5, 5)],  # Dashed lines for min/max
    "shade_between": {
        "Trajectory": {
            "min": "Trajectory_min",
            "max": "Trajectory_max",
            "color": "#2ca02c",
            "alpha": 0.25
        }
    }
}

new_scatter_data = scatter_chart(data=scatter_data, options=scatter_options, key="shade_scatter_chart")

with st.expander("Show Scatter Chart Data"):
    st.write(new_scatter_data)

st.divider()

st.success("""
**💡 Try it yourself!** 
Drag the points on the central lines (Forecast or Mean Trajectory). 
Notice how the min and max bounds move together, maintaining the interval width.
""")

