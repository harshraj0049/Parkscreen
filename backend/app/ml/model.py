import joblib
import os

BASE_DIR = os.path.dirname(__file__)

MODEL_PATH = os.path.join(BASE_DIR, "parkinson_keystroke_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "features_columns.pkl")

model = joblib.load(MODEL_PATH)
feature_cols = joblib.load(FEATURES_PATH)