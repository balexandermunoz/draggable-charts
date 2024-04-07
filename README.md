# streamlit-custom-component

Streamlit component that displays a line chart with draggable points. Users can click and drag points on the chart to adjust their values. The updated data of the chart is returned.",

## Installation instructions

```sh
pip install draggable-line-chart
```

## Usage instructions

```python
import streamlit as st
import pandas as pd
from draggable_line_chart import draggable_line_chart

st.subheader("Draggable Plot!")
initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]
}).to_dict()
colors = ['#1f77b4', '#ff7f0e', '#2ca02c']
new_data = draggable_line_chart("My Plot", initial_data, colors=colors, key="foo")
new_data
```