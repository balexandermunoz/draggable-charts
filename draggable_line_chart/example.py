import streamlit as st
import pandas as pd
from draggable_line_chart import draggable_line_chart

st.subheader("Draggable Plot!")
initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]
}).to_dict()

new_data = draggable_line_chart("My Plot", initial_data, colors=None, key="foo")
new_data
