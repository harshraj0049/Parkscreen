import pandas as pd
import numpy as np

def extract_features_from_events(events):
    hold = [e.hold for e in events]
    latency = [e.latency for e in events]
    flight = [e.flight for e in events]

    # safety
    if len(hold) == 0:
        raise ValueError("No keystroke data")

    mean_hold = np.mean(hold)
    mean_latency = np.mean(latency) if latency else 0
    mean_flight = np.mean(flight) if flight else 0

    features = {
        "mean_hold": mean_hold,
        "std_hold": np.std(hold),

        "mean_latency": mean_latency,
        "std_latency": np.std(latency) if latency else 0,

        "mean_flight": mean_flight,
        "std_flight": np.std(flight) if flight else 0,

        "max_hold": np.max(hold),
        "min_hold": np.min(hold),

        "max_latency": np.max(latency) if latency else 0,
        "min_latency": np.min(latency) if latency else 0,

        "typing_speed": len(hold) / sum(hold) if sum(hold) > 0 else 0,

        "pause_count": sum(1 for f in flight if f > 0.5),

        "cv_hold": (np.std(hold) / mean_hold) if mean_hold != 0 else 0,
        "cv_latency": (np.std(latency) / mean_latency) if mean_latency != 0 else 0,
        "cv_flight": (np.std(flight) / mean_flight) if mean_flight != 0 else 0,
    }

    return pd.DataFrame([features])