from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_teams")
    members = relationship("User", foreign_keys="User.team_id", back_populates="team")
    invitations = relationship("Invitation", back_populates="team")
    activity_logs = relationship("ActivityLog", back_populates="team")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"