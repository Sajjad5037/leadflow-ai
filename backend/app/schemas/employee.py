from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class EmployeeCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: str = Field(default='Sales Agent', min_length=1, max_length=100)
    is_active: bool = Field(default=True)

    @field_validator('name')
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field is required.')
        return cleaned

    @field_validator('role')
    @classmethod
    def validate_role(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field is required.')
        return cleaned

    @property
    def normalized_email(self) -> str:
        return self.email.lower().strip()


class EmployeeUpdateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = Field(default=None)
    role: str | None = Field(default=None, min_length=1, max_length=100)
    is_active: bool | None = Field(default=None)

    @field_validator('name', 'role')
    @classmethod
    def validate_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field cannot be empty.')
        return cleaned


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class EmployeeListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
