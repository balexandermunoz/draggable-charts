import numpy as np
import pandas as pd
import streamlit as st

from draggable_charts import line_chart, scatter_chart

st.subheader("Line chart with options!")
initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, np.nan, 36, 49, 64, 81, 200],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -50, -100]
})

plot_options = {
    "title": "My Plot",
    "colors": ['#1f77b4', '#ff7f0e', '#2ca02c'],
    "x_label": "X Axis",  # Default: No text
    "y_label": "Y Axis",  # Default: No text
    "x_grid": True,  # default: True
    "y_grid": True,  # default: True
    'legend_position': 'right',  # default: 'top'
    'legend_align': 'start',  # default: 'center'
    'tension': 0,  # default: 0.3
    'fill_gaps': True,  # default: False
    'fixed_lines': ["Col3"],  # default: []
}
new_data = line_chart(data=initial_data, options=plot_options, key="my_chart")
new_data

st.header("Line chart with series and all default")
series_data = pd.Series([1, 2, 3, 4, 5, np.nan, 7, 8, 9, 10])
new_series_data = line_chart(data=series_data)
new_series_data

st.subheader("Scatter chart")
x_num = [1, 2, 3, 4, 5]
y = ["R", "G", "H"]
scatter_data = {
    "trace 1": {"x": x_num, "y": [1, 4, 9, 16, 25]},
    "trace 2": {"x": x_num, "y": [1, 8, 27, 64, 125]},
    "trace 3": {"x": x_num, "y": [1, 16, 81, 256, 625]},
}
new_scatter_data = scatter_chart(data=scatter_data)
#new_scatter_data

x_cat = ["A", "B", "C", "D", "E"]
y_cat = ["R", "G", "H", "I", "J"]
scatter_data = {
    "trace 1": {"x": x_cat, "y": ["R", "R", "H", "H", "J"]},
    "trace 2": {"x": x_cat, "y": ["R", "G", "H", "I", "J"]},
    "trace 3": {"x": x_cat, "y": ["G", "G", "G", "G", "G"]},
}
new_scatter_data = scatter_chart(data=scatter_data, options={"x_labels": x_cat, "y_labels": y_cat})
#new_scatter_data


scatter_data = {
    "trace 1": {"x": x_cat, "y": [1, 4, 9, 16, 25]},
    "trace 2": {"x": x_cat, "y": [1, 8, 27, 64, 125]},
    "trace 3": {"x": x_cat, "y": [1, 16, 81, 256, 625]},
}
new_scatter_data = scatter_chart(data=scatter_data, options={"x_labels": x_cat})
#new_scatter_data