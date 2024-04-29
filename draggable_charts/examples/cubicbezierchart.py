import streamlit as st

from draggable_charts import cubic_bezier_chart

st.header("Cubic Bezier")
data = {
    "trace 1": {"x": [1, 2], "y": [-1, -5]},
    "trace 2": {"x": [1, 2, 3], "y": [1, 8, 27]},
}
new_data = cubic_bezier_chart(
    data,
    t=0.75,
    options={
        "fixed_lines": ["trace 2"],
    }
)
new_data
