import joblib
import os

BASE_DIR = os.path.dirname(__file__)

MODEL_PATH = os.path.join(BASE_DIR, "model_realtime.pkl")
COLS_PATH = os.path.join(BASE_DIR, "cols_realtime.pkl")

model = joblib.load(MODEL_PATH)
cols = joblib.load(COLS_PATH)