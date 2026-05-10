from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User, TypingSession
from app.keystroke.schemas import SessionPayload
from app.keystroke.services import validate_events, save_session
from app.ml.features import extract_features_from_events
from app.ml.model import model, cols

router = APIRouter(prefix="/session", tags=["session"])


# ── History schemas ────────────────────────────────────────────────────────

class FeaturesOut(BaseModel):
    mean_hold:    Optional[float] = None
    mean_latency: Optional[float] = None
    mean_flight:  Optional[float] = None
    hold_asym:    Optional[float] = None
    lat_asym:     Optional[float] = None
    flight_asym:  Optional[float] = None
    l_hold:       Optional[float] = None
    r_hold:       Optional[float] = None
    l_latency:    Optional[float] = None
    r_latency:    Optional[float] = None
    l_flight:     Optional[float] = None
    r_flight:     Optional[float] = None

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id:          int
    created_at:  datetime
    probability: Optional[float] = None
    prediction:  Optional[str]   = None
    features:    Optional[FeaturesOut] = None

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    total:    int
    sessions: List[SessionOut]


# ── Predict route (unchanged) ──────────────────────────────────────────────

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
        if model.classes_[0] == 1:
            proba = 1.0
        else:
            proba = 0.0
    else:
        proba = proba_array[1]

    proba = (proba - 0.5) * 1.5 + 0.5
    proba = max(0, min(1, proba))

    if proba > 0.6:
        label = "Parkinson's"
    elif proba < 0.45:
        label = "Healthy"
    else:
        label = "Uncertain"

    session = save_session(
        db=db,
        user_id=current_user.id,
        features=X_new.iloc[0].to_dict()
    )

    session.probability = float(proba)
    session.prediction = label
    db.commit()

    return {
        "user-id":     current_user.id,
        "event_count": len(payload.events),
        "message":     "Prediction successful",
        "probability": proba,
        "prediction":  label
    }


# ── History route ──────────────────────────────────────────────────────────

@router.get("/history", response_model=HistoryResponse)
def get_session_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(TypingSession)
        .options(joinedload(TypingSession.features))
        .filter(
            TypingSession.user_id == current_user.id,
            TypingSession.probability.isnot(None),
        )
        .order_by(desc(TypingSession.created_at))
        .all()
    )
    return HistoryResponse(total=len(sessions), sessions=sessions)
