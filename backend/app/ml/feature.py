import pandas as pd
import numpy as np

def mean_safe(s):
    return s.mean() if not s.empty else np.nan

def extract_features_from_events(events):
    df = pd.DataFrame([{
        "HoldTime": e.hold,
        "LatencyTime": e.latency,
        "FlightTime": e.flight,
        "Hand": e.hand
    } for e in events])

    left = df[df["Hand"] == "L"]
    right = df[df["Hand"] == "R"]

    mean_hold = df["HoldTime"].mean()
    std_hold = df["HoldTime"].std()

    mean_lat = df["LatencyTime"].mean()
    std_lat = df["LatencyTime"].std()

    mean_flt = df["FlightTime"].mean()
    std_flt = df["FlightTime"].std()

    l_hold = mean_safe(left["HoldTime"])
    r_hold = mean_safe(right["HoldTime"])
    l_lat = mean_safe(left["LatencyTime"])
    r_lat = mean_safe(right["LatencyTime"])
    l_flt = mean_safe(left["FlightTime"])
    r_flt = mean_safe(right["FlightTime"])

    hold_asym = abs(l_hold - r_hold) if pd.notna(l_hold) and pd.notna(r_hold) else np.nan
    lat_asym = abs(l_lat - r_lat) if pd.notna(l_lat) and pd.notna(r_lat) else np.nan
    flt_asym = abs(l_flt - r_flt) if pd.notna(l_flt) and pd.notna(r_flt) else np.nan

    return pd.DataFrame([{
        "mean_hold": mean_hold,
        "std_hold": std_hold,
        "mean_latency": mean_lat,
        "std_latency": std_lat,
        "mean_flight": mean_flt,
        "std_flight": std_flt,
        "l_hold": l_hold,
        "r_hold": r_hold,
        "l_latency": l_lat,
        "r_latency": r_lat,
        "l_flight": l_flt,
        "r_flight": r_flt,
        "hold_asym": hold_asym,
        "lat_asym": lat_asym,
        "flight_asym": flt_asym
    }])