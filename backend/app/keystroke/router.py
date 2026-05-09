from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User, TypingSession
from app.keystroke.schemas import SessionPayload, SessionSummary
from app.keystroke.services import validate_events, compute_features, run_prediction, save_session

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

    features = compute_features(payload.events)
    probability, prediction = run_prediction(features)
    session = save_session(
        db=db,
        user_id=current_user.id,
        features=features,
        probability=probability,
        prediction=prediction,
    )

    return {
        "session_id":  session.id,
        "probability": probability,
        "prediction":  prediction,
        "keystrokes":  len(payload.events),
        "features":    features,
    }


# ── History routes ────────────────────────────────────────────────────────────

router_sessions = APIRouter(prefix="/sessions", tags=["sessions"])


@router_sessions.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(TypingSession)
        .filter(TypingSession.user_id == current_user.id)
        .order_by(TypingSession.created_at.desc())
        .all()
    )
    return {
        "sessions": [
            {
                "id":          s.id,
                "created_at":  s.created_at.isoformat() if s.created_at else None,
                "probability": s.probability,
                "prediction":  s.prediction,
                "features": {
                    "mean_hold":    s.features.mean_hold    if s.features else None,
                    "mean_latency": s.features.mean_latency if s.features else None,
                    "mean_flight":  s.features.mean_flight  if s.features else None,
                    "hold_asym":    s.features.hold_asym    if s.features else None,
                    "lat_asym":     s.features.lat_asym     if s.features else None,
                    "flight_asym":  s.features.flight_asym  if s.features else None,
                } if s.features else None,
            }
            for s in sessions
        ]
    }


@router_sessions.get("/{session_id}")
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(TypingSession)
        .filter(
            TypingSession.id == session_id,
            TypingSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id":          session.id,
        "created_at":  session.created_at.isoformat() if session.created_at else None,
        "probability": session.probability,
        "prediction":  session.prediction,
        "features": {
            "mean_hold":    session.features.mean_hold    if session.features else None,
            "mean_latency": session.features.mean_latency if session.features else None,
            "mean_flight":  session.features.mean_flight  if session.features else None,
            "hold_asym":    session.features.hold_asym    if session.features else None,
            "lat_asym":     session.features.lat_asym     if session.features else None,
            "flight_asym":  session.features.flight_asym  if session.features else None,
        } if session.features else None,
    }