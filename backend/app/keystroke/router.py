from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User
from app.keystroke.schemas import SessionPayload
from app.keystroke.services import validate_events
from app.ml.features import extract_features_from_events
from app.ml.model import model, feature_cols
from app.keystroke.services import save_session

router = APIRouter(prefix="/session", tags=["session"])

@router.post("/predict")
def predict_session(
    payload: SessionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not validate_events(payload.events):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Need at least 100 events with both hands represented"
        )

    X_new = extract_features_from_events(payload.events)

    for col in feature_cols:
        if col not in X_new.columns:
            X_new[col] = None
    X_new = X_new[feature_cols]

    prob = float(model.predict_proba(X_new)[0, 1])
    pred = int(model.predict(X_new)[0])

    label = "Parkinson" if pred == 1 else "Control"

    session = save_session(
        db=db,
        user_id=current_user.id,
        features=X_new.iloc[0].to_dict()
    )

    session.probability = prob
    session.prediction = label
    db.commit()

    return {
        "user-id": current_user.id,
        "event_count": len(payload.events),
        "message": "Prediction successful",
        "probability": prob,
        "prediction": label
    }