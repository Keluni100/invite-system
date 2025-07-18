from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class InvitationBase(BaseModel):
    email: EmailStr
    role: str = "member"


class InvitationCreate(InvitationBase):
    team_id: int


class InvitationResponse(InvitationBase):
    id: int
    team_id: int
    token: str
    expires_at: datetime
    is_used: bool
    invited_by: int
    accepted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AcceptInvitation(BaseModel):
    password: str
    first_name: str
    last_name: str