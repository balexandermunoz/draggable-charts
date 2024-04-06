import streamlit as st
import pandas as pd
from my_component import my_component

# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`

st.subheader("Component with constant args")
initial_data = pd.DataFrame({
    "Col1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Col2": [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
    "Col3": [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10]
}).to_dict()
new_data = my_component("My Plot", initial_data, colors=None, key="foo")
new_data
