from sqlalchemy import Column, Integer, String, DateTime, func, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id          = Column(Integer, primary_key=True, index=True)
    email       = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    sessions      = relationship("TypingSession", back_populates="user")

class TypingSession(Base):
    __tablename__ = "typing_sessions"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    probability = Column(Float, nullable=True)    # filled after ML prediction
    prediction  = Column(String, nullable=True)   # "Control" or "Parkinson"

    user        = relationship("User", back_populates="sessions")
    features    = relationship("SessionFeatures", back_populates="session", uselist=False)


class SessionFeatures(Base):
    __tablename__ = "session_features"

    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(Integer, ForeignKey("typing_sessions.id"), nullable=False)

    # Aggregated features
    mean_hold    = Column(Float)
    mean_latency = Column(Float)
    mean_flight  = Column(Float)
    hold_asym    = Column(Float)
    lat_asym     = Column(Float)
    flight_asym  = Column(Float)

    # Per-hand features
    l_hold       = Column(Float)
    r_hold       = Column(Float)
    l_latency    = Column(Float)
    r_latency    = Column(Float)
    l_flight     = Column(Float)
    r_flight     = Column(Float)

    session      = relationship("TypingSession", back_populates="features")