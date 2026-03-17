from pydantic import BaseModel
from typing import Literal

class KeystrokeEvent(BaseModel):
    hold:    float
    latency: float
    flight:  float
    hand:    Literal["L", "R"]

class SessionPayload(BaseModel):
    events: list[KeystrokeEvent]