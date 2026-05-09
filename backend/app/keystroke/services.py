from sqlalchemy.orm import Session
from app.database.models import TypingSession, SessionFeatures


def validate_events(events: list) -> bool:
    if len(events) < 100:
        return False
    hands = {e.hand for e in events}
    if len(hands) < 2:
        return False
    return True


def compute_features(events: list) -> dict:
    def mean(vals):
        return sum(vals) / len(vals) if vals else 0.0

    holds     = [e.hold    for e in events]
    latencies = [e.latency for e in events if e.latency > 0]
    flights   = [e.flight  for e in events if e.flight  > 0]

    left  = [e for e in events if e.hand == 'L']
    right = [e for e in events if e.hand == 'R']

    l_hold    = mean([e.hold    for e in left])
    r_hold    = mean([e.hold    for e in right])
    l_latency = mean([e.latency for e in left  if e.latency > 0])
    r_latency = mean([e.latency for e in right if e.latency > 0])
    l_flight  = mean([e.flight  for e in left  if e.flight  > 0])
    r_flight  = mean([e.flight  for e in right if e.flight  > 0])

    return {
        'mean_hold':    round(mean(holds),     2),
        'mean_latency': round(mean(latencies), 2),
        'mean_flight':  round(mean(flights),   2),
        'hold_asym':    round(abs(l_hold    - r_hold),    2),
        'lat_asym':     round(abs(l_latency - r_latency), 2),
        'flight_asym':  round(abs(l_flight  - r_flight),  2),
        'l_hold':       round(l_hold,    2),
        'r_hold':       round(r_hold,    2),
        'l_latency':    round(l_latency, 2),
        'r_latency':    round(r_latency, 2),
        'l_flight':     round(l_flight,  2),
        'r_flight':     round(r_flight,  2),
    }


def run_prediction(features: dict) -> tuple[float, str]:
    """
    Heuristic model — replace this with your real ML model inference.
    """
    score, weights = 0.0, 0.0

    if features['mean_hold'] > 0:
        score   += min(features['mean_hold'] / 300.0, 1.0) * 0.25
        weights += 0.25

    if features['hold_asym'] > 0:
        score   += min(features['hold_asym'] / 60.0, 1.0) * 0.35
        weights += 0.35

    if features['lat_asym'] > 0:
        score   += min(features['lat_asym'] / 40.0, 1.0) * 0.25
        weights += 0.25

    if features['flight_asym'] > 0:
        score   += min(features['flight_asym'] / 60.0, 1.0) * 0.15
        weights += 0.15

    probability = round(score / weights if weights > 0 else 0.3, 4)
    prediction  = 'Parkinson' if probability >= 0.5 else 'Control'
    return probability, prediction


def save_session(db: Session, user_id: int, features: dict,
                 probability: float, prediction: str) -> TypingSession:
    session = TypingSession(
        user_id     = user_id,
        probability = probability,
        prediction  = prediction,
    )
    db.add(session)
    db.flush()

    session_features = SessionFeatures(
        session_id = session.id,
        **features,
    )
    db.add(session_features)
    db.commit()
    db.refresh(session)
    return session