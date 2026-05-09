from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class KeystrokeEvent(BaseModel):
    hold:    float
    latency: float
    flight:  float
    hand:    Literal["L", "R"]


class SessionPayload(BaseModel):
    events: list[KeystrokeEvent]


class SessionFeatureSchema(BaseModel):
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


class SessionSummary(BaseModel):
    id:          int
    created_at:  datetime
    probability: Optional[float] = None
    prediction:  Optional[str]   = None
    features:    Optional[SessionFeatureSchema] = None

    class Config:
        from_attributes = True