import streamlit as st

from draggable_charts import cubic_bezier_chart

st.header("Cubic Bezier")
data = {
    "trace 1": {"x": [2000.5, 2001, 2002, 2003], "y": [-1, -5, 10, -10]},
    "trace 2": {"x": [2000.5, 2001, 2002, 2003], "y": [1, 8, 27, 5]},
}
new_data = cubic_bezier_chart(
    data,
    options={
        "x_type": "time",
        "fixed_lines": ["trace 2"],
    }
)
new_data
