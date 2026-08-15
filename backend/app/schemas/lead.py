from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LeadCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=3, max_length=50)
    message: str = Field(..., min_length=20, max_length=5000)
    source: str = Field(default='website', min_length=1, max_length=100)

    @field_validator('name', 'company')
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field is required.')
        return cleaned

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        digits = ''.join(ch for ch in cleaned if ch.isdigit())
        if len(digits) < 10:
            raise ValueError('Phone number must contain at least 10 digits.')
        return cleaned

    @field_validator('message')
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 20:
            raise ValueError('Message must be at least 20 characters long.')
        return cleaned

    @property
    def normalized_email(self) -> str:
        return self.email.lower().strip()

    @property
    def normalized_phone(self) -> str:
        digits = ''.join(ch for ch in self.phone.strip() if ch.isdigit())
        if len(digits) == 10:
            return f'({digits[:3]}) {digits[3:6]}-{digits[6:]} '
        return ' '.join(self.phone.strip().split())


class LeadCreateResponse(BaseModel):
    lead_id: int
    status: str


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    company: str
    email: str
    phone: str
    business_problem: str
    source: str
    status: str
    created_at: datetime
    updated_at: datetime
