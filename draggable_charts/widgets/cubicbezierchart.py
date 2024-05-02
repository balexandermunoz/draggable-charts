from typing import Any, Callable, Literal

import numpy as np

from ..utils import component, get_func_name, register
from ..utils.options import set_options, include_colors


def cubic_bezier_chart(
    data: dict,
    options: dict = None,
    on_change: Callable = None,
    args: tuple[Any, ...] = None,
    kwargs: dict[str, Any] = None,
    key: str = None
) -> dict:
    register(key, on_change, args, kwargs)
    _validate_scatter_data(data, options)
    data = add_control_points(data, options)
    data, options = set_options(data, options)
    default_data = {k: v for k, v in data.items() if k not in options["fixed_lines"]}
    return component(id=get_func_name(), kw=locals(), default=default_data, key=key)


def _validate_scatter_data(data: dict, options: dict) -> None:
    # Check if data is a dictionary
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary.")

    # If x is categorical, check if labels are specified
    if options.get('x_type') == 'category' and not options.get('x_labels'):
        raise ValueError(
            "For categorical data in X, you must specify the labels in the options.")

    # If y is categorical, check if labels are specified
    if options.get('y_type') == 'category' and not options.get('y_labels'):
        raise ValueError(
            "For categorical data in Y, you must specify the labels in the options.")

    # Check if each trace is a dictionary with 'x' and 'y' keys
    for trace_name, trace_data in data.items():
        if trace_name not in options["fixed_lines"] and len(trace_data['x']) < 2:
            raise ValueError(
                f"Each interactive trace must have at least two points. Got: {trace_data}")
            
        if not isinstance(trace_data, dict) or 'x' not in trace_data or 'y' not in trace_data:
            raise ValueError(
                f"Each trace must be a dictionary with 'x' and 'y' keys. Got: {trace_data}")

        if not isinstance(trace_data['x'], list) or not isinstance(trace_data['y'], list):
            raise ValueError(
                f"Both 'x' and 'y' must be lists. Got: x: {type(trace_data['x'])} y: {type(trace_data['y'])}")

        if len(trace_data['x']) != len(trace_data['y']):
            raise ValueError(
                f"'x' and 'y' must be lists of the same length. Got: x={trace_data['x']}, y={trace_data['y']}")


def add_control_points(data: dict, options: dict) -> dict:
    for trace_name, trace_data in data.items():
        if trace_name in options["fixed_lines"]:
            continue
        
        new_trace_data = {'x': [], 'y': []}
        if len(trace_data['x']) == 2:
            # If there are only two points, add two intermediate points
            x1, x2 = trace_data['x']
            y1, y2 = trace_data['y']
            new_trace_data['x'] = [x1, x1 + (x2 - x1) / 3, x1 + 2 * (x2 - x1) / 3, x2]
            new_trace_data['y'] = [y1, y1 + (y2 - y1) / 3, y1 + 2 * (y2 - y1) / 3, y2]
        
        else:
            P1, P2 = calculate_control_points(trace_data)
            for i in range(len(trace_data['x']) - 1):
                new_trace_data['x'].append(trace_data['x'][i])
                new_trace_data['x'].append(P1[i][0])
                new_trace_data['x'].append(P2[i][0])
                
                new_trace_data['y'].append(trace_data['y'][i])
                new_trace_data['y'].append(P1[i][1])
                new_trace_data['y'].append(P2[i][1])
            new_trace_data['x'].append(trace_data['x'][-1])
            new_trace_data['y'].append(trace_data['y'][-1])
        data[trace_name] = new_trace_data
    return data


def calculate_control_points(trace_data: dict) -> list:
    """See:
    https://www.particleincell.com/2012/bezier-splines/
    Second last eq has a typo, it's P2_i = 2*K_(i+1) - P1_(i+1)
    """
    n = len(trace_data['x']) - 1 # N. of segments

    # Create matrix A (Ax + b = 0)
    A = create_tri_diagonal_matrix(n)

    # Create vector b (each component contains bx and by)
    K = np.array(list(zip(trace_data['x'], trace_data['y'])))

    b = np.array(
        [(K[0][0] + 2 * K[1][0], K[0][1] + 2 * K[1][1])]
        + [(4 * K[i][0] + 2 * K[i+1][0], 4 * K[i][1] + 2 * K[i+1][1]) for i in range(1, n - 1)]
        + [(8 * K[n-1][0] + K[n][0], 8 * K[n-1][1] + K[n][1])]
    )
    
    # Solve the system:
    P1 = np.linalg.solve(A, b)
    
    # Compute P2:
    # P2_i = ( 2*K_(i+1) - P1_(i+1) ),  for i = 0, ..., n-1
    # P2_(n-1) = (1/2) * (K_(n-1) + P1_(n-1) )
    P2 = 2 * K[1:-1] - P1[1:]
    P2 = np.concatenate( (P2, [(1/2)*(K[-1] + P1[-1])] ))
    return P1, P2
    

def create_tri_diagonal_matrix(n):
    """This function creates the A matrix to find the control points of the cubic bezier curve.
    See "The Matrix" Section in:
    https://exploringswift.com/blog/Drawing-Smooth-Cubic-Bezier-Curve-through-prescribed-points-using-Swift
    """
    A = np.zeros((n, n))
    # Main diagonal
    A += np.diag([2] + [4]*(n-2) + [7], k=0)
    # Upper diagonal
    A += np.diag([1]*(n-1), k=1)
    # Lower diagonal
    A += np.diag([1]*(n-2) + [2], k=-1)
    return A
