from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


def blank_to_none(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


class ContactBase(BaseModel):
    first_name: str
    last_name: str = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("first_name")
    @classmethod
    def name_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("first_name cannot be blank")
        return value.strip()

    @field_validator("last_name")
    @classmethod
    def normalize_last_name(cls, value: str) -> str:
        return value.strip()

    @field_validator("email", "phone", "address", "company", "notes")
    @classmethod
    def normalize_optional_text(cls, value: Optional[str]) -> Optional[str]:
        return blank_to_none(value)


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("first_name")
    @classmethod
    def update_name_not_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        if not value.strip():
            raise ValueError("first_name cannot be blank")
        return value.strip()

    @field_validator("last_name", "email", "phone", "address", "company", "notes")
    @classmethod
    def update_normalize_optional_text(cls, value: Optional[str]) -> Optional[str]:
        return blank_to_none(value)


class ContactOut(ContactBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MergeRequest(BaseModel):
    source_id: str
    target_id: str
    overrides: Optional[ContactUpdate] = None


class SearchParams(BaseModel):
    q: str
