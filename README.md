# st-draggable-line-chart

Streamlit component that displays a line chart with draggable points. Users can click and drag points on the chart to adjust their values. The updated data of the chart is returned.

## Installation instructions

```sh
pip install draggable-line-chart
```

## Example

```python
import pandas as pd
import streamlit as st

from draggable_line_chart import draggable_line_chart

st.header("Draggable Plot!")

initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, 25, 36, 49, 64, 81, 200],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -50, -100]
})


plot_options = {
    "title": "My Plot",
    "colors": ['#1f77b4', '#ff7f0e', '#2ca02c'],
    "x_label": "X Axis",
    "y_label": "Y Axis",
}
new_data = draggable_line_chart(data=initial_data.to_dict(), options=plot_options)
new_data
```