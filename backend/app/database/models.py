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

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("typing_sessions.id"), nullable=False)

    mean_hold    = Column(Float)
    std_hold     = Column(Float)

    mean_latency = Column(Float)
    std_latency  = Column(Float)

    mean_flight  = Column(Float)
    std_flight   = Column(Float)

    max_hold     = Column(Float)
    min_hold     = Column(Float)

    max_latency  = Column(Float)
    min_latency  = Column(Float)

    typing_speed = Column(Float)
    pause_count  = Column(Float)

    cv_hold      = Column(Float)
    cv_latency   = Column(Float)
    cv_flight    = Column(Float)

    session = relationship("TypingSession", back_populates="features")