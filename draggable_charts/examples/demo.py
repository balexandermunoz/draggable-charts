import numpy as np
import pandas as pd
import streamlit as st

from draggable_charts import line_chart, scatter_chart, bezier_chart, cubic_bezier_chart

st.title("📊 Draggable Charts - Demo")

st.markdown("""
This demo showcases the various chart types and customization options available.
**Try dragging the points** to see the interactive features in action!
""")

# ============================================================================
# LINE CHARTS
# ============================================================================
st.header("📈 Line Charts")

st.subheader("1️⃣ Fully Customized Line Chart")
st.write("Drag the points vertically. Notice all the customization options in use.")

initial_data = pd.DataFrame({
    "index": [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, np.nan, 36, 49, 64, 81, 200],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -50, -100]
})
initial_data = initial_data.set_index("index")
initial_data.index = initial_data.index.astype(str)
initial_data = initial_data.mul(1000000)

plot_options = {
    "title": "Customized Line Chart", # Default: No title
    "colors": ['#1f77b4', '#ff7f0e', '#2ca02c'],
    "x_label": "X Axis",  # Default: No text
    "y_label": "Y Axis",  # Default: No text
    "x_grid": True,  # default: True
    "y_grid": True,  # default: True
    'legend_position': 'right',  # default: 'top'
    'legend_align': 'start',  # default: 'center'
    'tension': 0,  # default: 0.3
    'fill_gaps': True,  # default: False
    'fixed_lines': ["Col3"],  # default: [] (Col3 cannot be dragged)
    'labels': {"Col1": "Custom label", "Col2": "Custom 2"},  # default: {}
    'hide_legends': ["Custom 2"],  # default: [] (hides Custom 2 from legend)
    "point_radius": [3, 5, 2], # default: [3]
    "border_dash": [(0, 0), (5, 5)], # default: [(0, 0)] (Col2 is dashed)
    "x_format": None, # default ".2~s". Check https://d3js.org/d3-format#locale_format
    "y_format": ".2~s", # default ".2~s" (formats large numbers)
}
new_data = line_chart(data=initial_data, options=plot_options, key="custom_line_chart")

with st.expander("Show updated data"):
    st.write(new_data)

st.subheader("2️⃣ Simple Line Chart (Default Options)")
st.write("Minimal configuration - just pass the data!")

series_data = pd.Series([1, 2, 3, 4, 5, np.nan, 7, 8, 9, 10])
new_series_data = line_chart(data=series_data, key="simple_line_chart")

with st.expander("Show updated data"):
    st.write(new_series_data)

st.subheader("3️⃣ Line Chart with Time Scale (x_type='time')")
st.write("Numeric values on X-axis converted to dates (e.g., 2025.5 → 2025/07/02)")

time_data = pd.DataFrame({
    "index": [2020.0, 2020.5, 2021.0, 2021.5, 2022.0, 2022.5, 2023.0, 2023.5, 2024.0],
    "Temperature": [15, 25, 18, 28, 17, 26, 19, 27, 20],
})
time_data = time_data.set_index("index")
time_data.index = time_data.index.astype(float)

time_options = {
    "title": "Temperature Over Time",
    "x_type": "time",  # Converts numeric to dates
    "x_label": "Date",
    "y_label": "Temperature (°C)",
    "colors": ['#ff7f0e'],
    "tension": 0.3,
}
new_time_data = line_chart(data=time_data, options=time_options, key="time_line_chart")

with st.expander("Show updated data"):
    st.write(new_time_data)

st.subheader("4️⃣ Line Chart with Shaded Area (Confidence Intervals)")
st.write("Drag the main line - min/max bounds move together!")

shade_data = pd.DataFrame({
    "index": [2020, 2021, 2022, 2023, 2024, 2025],
    "Forecast": [10, 15, 22, 30, 40, 52],
    "Forecast_min": [8, 12, 18, 25, 34, 45],
    "Forecast_max": [12, 18, 26, 35, 46, 59],
})
shade_data = shade_data.set_index("index")
shade_data.index = shade_data.index.astype(str)

shade_options = {
    "title": "Forecast with Confidence Interval",
    "colors": ['#9467bd', '#9467bd', '#9467bd'],
    "x_label": "Year",
    "y_label": "Value",
    "tension": 0.3,
    'fixed_lines': ["Forecast_min", "Forecast_max"],  # Can't drag bounds independently
    'labels': {"Forecast": "Forecast", "Forecast_min": "Min", "Forecast_max": "Max"},
    "point_radius": [3, 0, 0],  # Hide points on min/max
    "border_dash": [(0, 0), (5, 5), (5, 5)],  # Dashed min/max
    "shade_between": {
        "Forecast": {
            "min": "Forecast_min",
            "max": "Forecast_max",
            "color": "#9467bd",
            "alpha": 0.2
        }
    }
}
new_shade_data = line_chart(data=shade_data, options=shade_options, key="shade_line_chart")

with st.expander("Show updated data"):
    st.write(new_shade_data)

st.divider()

# ============================================================================
# SCATTER CHARTS
# ============================================================================
st.header("📊 Scatter Charts")
st.subheader("1️⃣ Numerical Scatter Chart")
st.write("Drag the dots to anywhere in 2D space.")

x_num = [1, 2, 3, 4, 5]
scatter_data = {
    "trace 1": {"x": x_num, "y": [1, 4, 9, 16, 25]},
    "trace 2": {"x": x_num, "y": [1, 8, 27, 64, 125]},
    "trace 3": {"x": x_num, "y": [1, 16, 81, 256, 625]},
}
new_scatter_data = scatter_chart(data=scatter_data, key="num_scatter_chart")

with st.expander("Show updated data"):
    st.write(new_scatter_data)

st.subheader("2️⃣ Categorical Scatter Chart")
st.write("Drag points from one category to another.")

x_cat = ["A", "B", "C", "D", "E"]
y_cat = ["R", "G", "H", "I", "J"]
scatter_data = {
    "trace 1": {"x": x_cat, "y": ["R", "R", "H", "H", "J"]},
    "trace 2": {"x": x_cat, "y": ["R", "G", "H", "I", "J"]},
    "trace 3": {"x": x_cat, "y": ["G", "G", "G", "G", "G"]},
}
new_scatter_data = scatter_chart(
    data=scatter_data,
    options={"x_labels": x_cat, "y_labels": y_cat, "show_line": False},
    key="cat_scatter_chart"
)

with st.expander("Show updated data"):
    st.write(new_scatter_data)

st.subheader("3️⃣ Mixed (Categorical X + Numerical Y)")
st.write("Drag continuous values in Y and discrete categories in X.")

scatter_data = {
    "trace 1": {"x": x_cat, "y": [1, 4, 9, 16, 25]},
    "trace 2": {"x": x_cat, "y": [1, 8, 27, 64, 125]},
    "trace 3": {"x": x_cat, "y": [1, 16, 81, 256, 625]},
}
new_scatter_data = scatter_chart(
    data=scatter_data,
    options={"x_labels": x_cat, "show_line": True,
             "tension": 0, "fixed_lines": ["trace 1"]},
    key="mixed_scatter_chart"
)

with st.expander("Show updated data"):
    st.write(new_scatter_data)

st.subheader("4️⃣ Scatter Chart with Shaded Area")
st.write("Scatter chart with connected lines and confidence bounds. Drag the main trajectory!")

t = np.linspace(0, 5, 10)
x_traj = t * 3
y_traj = 20 * t - 2 * t**2

scatter_shade_data = {
    "Trajectory": {"x": x_traj.tolist(), "y": y_traj.tolist()},
    "Trajectory_min": {"x": (x_traj - 1).tolist(), "y": (y_traj - 3).tolist()},
    "Trajectory_max": {"x": (x_traj + 1).tolist(), "y": (y_traj + 3).tolist()},
}

scatter_shade_options = {
    "title": "Trajectory with Uncertainty",
    "colors": ['#2ca02c', '#2ca02c', '#2ca02c'],
    "show_line": True,
    "tension": 0.3,
    "fixed_lines": ["Trajectory_min", "Trajectory_max"],
    "point_radius": [4, 0, 0],
    "border_dash": [(0, 0), (5, 5), (5, 5)],
    "shade_between": {
        "Trajectory": {
            "min": "Trajectory_min",
            "max": "Trajectory_max",
            "color": "#2ca02c",
            "alpha": 0.25
        }
    }
}
new_scatter_shade_data = scatter_chart(data=scatter_shade_data, options=scatter_shade_options, key="shade_scatter_chart")

with st.expander("Show updated data"):
    st.write(new_scatter_shade_data)

st.divider()

# ============================================================================
# BEZIER CHARTS
# ============================================================================
st.header("🎨 Bezier Charts")

st.subheader("1️⃣ Quadratic Bezier Chart")
st.write("Drag the blue control points to adjust the curve shape.")

bezier_data = {
    "Control Points": {"x": [1, 2, 3, 4, 5], "y": [1, -8, 10, 16, -25]},
    "Fixed Line": {"x": [1, 2, 3, 4, 5], "y": [1, 8, 27, 64, 125]},
}
new_bezier_data = bezier_chart(bezier_data, t=0.5, options={
    "fixed_lines": ["Fixed Line"],
    "colors": ['blue', 'red'],
    "title": "Quadratic Bezier Curve"
}, key="bezier_chart")

with st.expander("Show updated data"):
    st.write(new_bezier_data)

st.subheader("2️⃣ Cubic Bezier Chart")
st.write("4 control points create smooth cubic curves. Drag the blue points!")

cubic_data = {
    "Control Points": {"x": [1, 2, 3, 4], "y": [-1, -5, 10, -10]},
    "Reference": {"x": [1, 2, 3, 4], "y": [-1, -5, 10, -10]},
}
new_cubic_data = cubic_bezier_chart(
    cubic_data,
    options={
        "title": "Cubic Bezier Curve",
        "fixed_lines": ["Reference"],
        "colors": ['blue', 'red'],
        "border_dash": [(10, 2), (5, 10)],
        "point_radius": [3, 0],
        "labels": {"Control Points": "Adjustable", "Reference": "Fixed", "Reference (bezier)": "Bezier Curve"}
    },
    key="cubic_bezier_chart"
)

with st.expander("Show updated data"):
    st.write(new_cubic_data)

st.subheader("3️⃣ Cubic Bezier with Time Scale")
st.write("Control points with dates on X-axis (x_type='time').")

cubic_time_data = {
    "Adjustable": {"x": [2020.0, 2020.5, 2021.5, 2022.0], "y": [10, 25, 40, 15]},
    "Fixed": {"x": [2020.0, 2020.5, 2021.5, 2022.0], "y": [5, 15, 30, 20]},
}
new_cubic_time_data = cubic_bezier_chart(
    cubic_time_data,
    options={
        "title": "Timeline Bezier Curve",
        "x_type": "time",
        "x_label": "Date",
        "y_label": "Value",
        "fixed_lines": ["Fixed"],
        "colors": ['#e377c2', '#8c564b'],
    },
    key="cubic_time_bezier_chart"
)

with st.expander("Show updated data"):
    st.write(new_cubic_time_data)

st.divider()

st.success("""
### 🎉 Demo Complete!
You've seen all the major features:
- ✅ Line charts with customization
- ✅ Time scale (x_type='time')
- ✅ Shaded areas (shade_between)
- ✅ Scatter charts (numerical, categorical, mixed)
- ✅ Bezier curves (quadratic and cubic)
- ✅ Fixed lines, custom labels, dashed borders, and more!

Check out the individual example files for more details on each feature.
""")
