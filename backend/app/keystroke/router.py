from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User
from app.keystroke.schemas import SessionPayload
from app.keystroke.services import validate_events, save_session
from app.ml.features import extract_features_from_events
from app.ml.model import model, cols

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

    X_new = X_new.reindex(columns=cols, fill_value=0)

    pred = model.predict(X_new)[0]
    proba_array = model.predict_proba(X_new)[0]

    if len(proba_array) == 1:
    # only one class in model
        if model.classes_[0] == 1:
            proba = 1.0
        else:
            proba = 0.0
    else:
        proba = proba_array[1]

    proba = (proba - 0.5) * 1.5 + 0.5
    proba = max(0, min(1, proba))

    if proba > 0.6:
        label = "Parkinson’s"
    elif proba < 0.45:
        label = "Healthy"
    else:
        label = "Uncertain"

    session = save_session(
        db=db,
        user_id=current_user.id,
        features=X_new.iloc[0].to_dict()
    )

    session.probability = proba
    session.prediction = label
    db.commit()

    return {
        "user-id": current_user.id,
        "event_count": len(payload.events),
        "message": "Prediction successful",
        "probability": proba,
        "prediction": label
    }