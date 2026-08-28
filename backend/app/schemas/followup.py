from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FollowupCreateRequest(BaseModel):
    lead_id: int
    channel: str = Field(..., min_length=1, max_length=50)
    scheduled_at: datetime
    attempt_number: int = Field(default=1, ge=1)


class FollowupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    channel: str
    scheduled_at: datetime
    status: str
    attempt_number: int
    sent_at: datetime | None = None
    created_at: datetime