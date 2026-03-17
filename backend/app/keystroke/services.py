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

def save_session(db: Session, user_id: int, features: dict) -> TypingSession:
    # Create the session row first
    session = TypingSession(
        user_id    = user_id,
        probability = None,   # ML pipeline will fill this later
        prediction  = None
    )
    db.add(session)
    db.flush()  # gets the session.id without full commit

    # Create the features row linked to this session
    session_features = SessionFeatures(
        session_id   = session.id,
        **features
    )
    db.add(session_features)
    db.commit()
    db.refresh(session)
    return session