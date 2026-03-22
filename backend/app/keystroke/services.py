from sqlalchemy.orm import Session
from app.database.models import User
from app.database.models import TypingSession, SessionFeatures

def validate_events(events: list) -> bool:
    # Must have at least 100 events
    if len(events) < 100:
        return False
    # Must have both hands represented
    hands = {e.hand for e in events}
    if len(hands) < 2:
        return False
    return True

def save_session(db, user_id: int, features: dict):
    session = TypingSession(user_id=user_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    # ✅ Only keep fields that exist in DB
    allowed_fields = {
    "mean_hold",
    "std_hold",

    "mean_latency",
    "std_latency",

    "mean_flight",
    "std_flight",

    "max_hold",
    "min_hold",

    "max_latency",
    "min_latency",

    "typing_speed",
    "pause_count",

    "cv_hold",
    "cv_latency",
    "cv_flight",
}

    filtered_features = {
        k: v for k, v in features.items() if k in allowed_fields
    }

    session_features = SessionFeatures(
        session_id=session.id,
        **filtered_features
    )

    db.add(session_features)
    db.commit()

    return session