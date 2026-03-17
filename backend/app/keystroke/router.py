from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.database.models import User
from app.keystroke.schemas import SessionPayload
from app.keystroke.services import validate_events

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

    # Pass to feature pipeline (BE-2 will implement this)
    # For now return the raw counts so we can test
    return {
        "user_id":     current_user.id,
        "event_count": len(payload.events),
        "message":     "Session received — prediction pipeline coming soon"
    }