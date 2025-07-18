from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserResponse


class TeamBase(BaseModel):
    name: str


class TeamCreate(TeamBase):
    pass


class TeamResponse(TeamBase):
    id: int
    created_by: int
    created_at: datetime
    is_active: bool
    members: Optional[List[UserResponse]] = None

    class Config:
        from_attributes = True