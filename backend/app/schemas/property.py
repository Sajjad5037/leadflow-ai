from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PROPERTY_TYPES = {'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'HOUSE', 'OTHER'}
PROPERTY_STATUSES = {'AVAILABLE', 'RESERVED', 'SOLD', 'OFF_MARKET'}


class PropertyCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    property_type: str = Field(..., min_length=1, max_length=50)
    status: str = Field(default='AVAILABLE', min_length=1, max_length=50)
    price: Decimal = Field(..., ge=0)
    currency: str = Field(default='PKR', min_length=1, max_length=10)
    location: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(default=None)
    size_value: Decimal | None = Field(default=None, ge=0)
    size_unit: str | None = Field(default=None, max_length=20)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    is_featured: bool = Field(default=False)

    @field_validator('title', 'description', 'location')
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field is required.')
        return cleaned

    @field_validator('property_type')
    @classmethod
    def validate_property_type(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if cleaned not in PROPERTY_TYPES:
            raise ValueError(f'property_type must be one of: {", ".join(sorted(PROPERTY_TYPES))}.')
        return cleaned

    @field_validator('status')
    @classmethod
    def validate_status(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if cleaned not in PROPERTY_STATUSES:
            raise ValueError(f'status must be one of: {", ".join(sorted(PROPERTY_STATUSES))}.')
        return cleaned

    @field_validator('currency', 'size_unit')
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None

    @field_validator('address')
    @classmethod
    def validate_address(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None


class PropertyUpdateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    property_type: str | None = Field(default=None, min_length=1, max_length=50)
    status: str | None = Field(default=None, min_length=1, max_length=50)
    price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=1, max_length=10)
    location: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None)
    size_value: Decimal | None = Field(default=None, ge=0)
    size_unit: str | None = Field(default=None, max_length=20)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    is_featured: bool | None = Field(default=None)

    @field_validator('title', 'description', 'location')
    @classmethod
    def validate_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('This field cannot be empty.')
        return cleaned

    @field_validator('property_type')
    @classmethod
    def validate_property_type(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip().upper()
        if cleaned not in PROPERTY_TYPES:
            raise ValueError(f'property_type must be one of: {", ".join(sorted(PROPERTY_TYPES))}.')
        return cleaned

    @field_validator('status')
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip().upper()
        if cleaned not in PROPERTY_STATUSES:
            raise ValueError(f'status must be one of: {", ".join(sorted(PROPERTY_STATUSES))}.')
        return cleaned

    @field_validator('currency', 'size_unit', 'address')
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None


class PropertyStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    status: str = Field(..., min_length=1, max_length=50)

    @field_validator('status')
    @classmethod
    def validate_status(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if cleaned not in PROPERTY_STATUSES:
            raise ValueError(f'status must be one of: {", ".join(sorted(PROPERTY_STATUSES))}.')
        return cleaned


class PropertyImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    display_order: int
    is_primary: bool


class PropertyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    property_type: str
    status: str
    price: Decimal
    currency: str
    location: str
    address: str | None = None
    size_value: Decimal | None = None
    size_unit: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    is_featured: bool
    images: list[PropertyImageResponse] = []
    created_at: datetime
    updated_at: datetime


class PropertyListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    property_type: str
    status: str
    price: Decimal
    currency: str
    location: str
    address: str | None = None
    size_value: Decimal | None = None
    size_unit: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    is_featured: bool
    images: list[PropertyImageResponse] = []
    created_at: datetime
    updated_at: datetime
