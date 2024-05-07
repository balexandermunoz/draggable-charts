import numpy as np
import pandas as pd
import streamlit as st

from draggable_charts import line_chart

st.header("Line chart")
initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, np.nan, 36, 49, 64, 81, 200],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -50, -100]
})

plot_options = {
    "title": "My Plot", # Default: No title
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
    'labels': {"Col1": "Custom label", "Col2": "Custom 2"},  # default: {}
    "point_radius": [3, 5, 2], # default: [3]
    "border_dash": [(0, 0), (5, 5)], # default: [(0, 0)]

}
new_data = line_chart(data=initial_data, options=plot_options, key="my_chart")
new_data
