from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.core.database import get_db
from app.core.security import create_invitation_token, verify_invitation_token, get_password_hash
from app.models.user import User
from app.models.team import Team
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate, InvitationResponse, AcceptInvitation
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, get_current_admin_user
from app.services.email import email_service
from app.core.config import settings

router = APIRouter()


@router.post("/invite", response_model=InvitationResponse)
async def invite_member(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Send a team invitation (Admin only)"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invitation_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if invitation already exists and is not expired
    existing_invitation = db.query(Invitation).filter(
        Invitation.email == invitation_data.email,
        Invitation.team_id == invitation_data.team_id,
        Invitation.is_used == False,
        Invitation.expires_at > datetime.utcnow()
    ).first()
    
    if existing_invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active invitation already exists for this email"
        )
    
    # Get team information
    team = db.query(Team).filter(Team.id == invitation_data.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Create invitation token
    invitation_token = create_invitation_token(
        invitation_data.email,
        str(invitation_data.team_id),
        invitation_data.role
    )
    
    # Create invitation record
    db_invitation = Invitation(
        email=invitation_data.email,
        role=invitation_data.role,
        team_id=invitation_data.team_id,
        token=invitation_token,
        expires_at=datetime.utcnow() + timedelta(days=7),
        invited_by=current_user.id
    )
    
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    
    # Create invitation link
    frontend_url = "http://localhost:3000"  # You can make this configurable
    invitation_link = f"{frontend_url}/auth/accept-invitation/{invitation_token}"
    
    # Send email invitation
    try:
        email_sent, message = await email_service.send_team_invitation(
            to_email=invitation_data.email,
            inviter_name=f"{current_user.first_name} {current_user.last_name}",
            team_name=team.name,
            invitation_link=invitation_link,
            role=invitation_data.role
        )
        
        if email_sent:
            print(f"✅ Email sent successfully to {invitation_data.email}: {message}")
        else:
            print(f"⚠️ Warning: Failed to send email to {invitation_data.email}: {message}")
    
    except Exception as e:
        print(f"⚠️ Warning: Email service error: {str(e)}")
    
    return InvitationResponse.model_validate(db_invitation)


@router.get("/invitations", response_model=List[InvitationResponse])
async def get_pending_invitations(
    team_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get pending invitations for a team (Admin only)"""
    
    invitations = db.query(Invitation).filter(
        Invitation.team_id == team_id,
        Invitation.is_used == False,
        Invitation.expires_at > datetime.utcnow()
    ).all()
    
    return [InvitationResponse.model_validate(inv) for inv in invitations]


@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    acceptance_data: AcceptInvitation,
    db: Session = Depends(get_db)
):
    """Accept a team invitation and create user account"""
    
    # Verify invitation token
    try:
        payload = verify_invitation_token(token)
        email = payload.get("email")
        team_id = payload.get("team_id")
        role = payload.get("role")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invitation token"
        )
    
    # Check if invitation exists and is still valid
    invitation = db.query(Invitation).filter(
        Invitation.token == token,
        Invitation.is_used == False,
        Invitation.expires_at > datetime.utcnow()
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation not found or has expired"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(acceptance_data.password)
    new_user = User(
        email=email,
        password_hash=hashed_password,
        first_name=acceptance_data.first_name,
        last_name=acceptance_data.last_name,
        role=role,
        team_id=int(team_id)
    )
    
    db.add(new_user)
    
    # Mark invitation as used
    invitation.is_used = True
    invitation.accepted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Invitation accepted successfully",
        "user": UserResponse.model_validate(new_user)
    }


@router.get("/members", response_model=List[UserResponse])
async def get_team_members(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team members"""
    
    # Verify user is part of the team
    if current_user.team_id != team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this team's members"
        )
    
    members = db.query(User).filter(
        User.team_id == team_id,
        User.is_active == True
    ).all()
    
    return [UserResponse.model_validate(member) for member in members]


@router.get("/members-with-invitations")
async def get_team_members_with_invitations(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team members and pending invitations with status"""
    
    # Verify user is part of the team
    if current_user.team_id != team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this team's members"
        )
    
    # Get active members
    members = db.query(User).filter(
        User.team_id == team_id,
        User.is_active == True
    ).all()
    
    # Get pending invitations
    pending_invitations = db.query(Invitation).filter(
        Invitation.team_id == team_id,
        Invitation.is_used == False,
        Invitation.expires_at > datetime.utcnow()
    ).all()
    
    # Format response
    result = []
    
    # Add active members
    for member in members:
        result.append({
            "id": member.id,
            "email": member.email,
            "first_name": member.first_name,
            "last_name": member.last_name,
            "role": member.role,
            "status": "active",
            "type": "member",
            "joined_at": member.created_at,
            "invitation_id": None
        })
    
    # Add pending invitations
    for invitation in pending_invitations:
        result.append({
            "id": None,
            "email": invitation.email,
            "first_name": None,
            "last_name": None,
            "role": invitation.role,
            "status": "pending",
            "type": "invitation",
            "joined_at": None,
            "invitation_id": invitation.id,
            "invited_at": invitation.created_at,
            "expires_at": invitation.expires_at
        })
    
    return {
        "team_id": team_id,
        "members_and_invitations": result,
        "total_members": len(members),
        "pending_invitations": len(pending_invitations)
    }


@router.put("/members/{member_id}/role", response_model=UserResponse)
async def update_member_role(
    member_id: int,
    role_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a team member's role (Admin only)"""
    
    new_role = role_data.get("role")
    if new_role not in ["admin", "member"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin' or 'member'"
        )
    
    member = db.query(User).filter(User.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Verify both users are in the same team
    if member.team_id != current_user.team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this member"
        )
    
    # Prevent self-demotion if user is the only admin
    if member.id == current_user.id and new_role != "admin":
        admin_count = db.query(User).filter(
            User.team_id == current_user.team_id,
            User.role == "admin",
            User.is_active == True
        ).count()
        
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the last admin of the team"
            )
    
    member.role = new_role
    db.commit()
    db.refresh(member)
    
    return UserResponse.model_validate(member)


@router.delete("/members/{member_id}")
async def remove_member(
    member_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Remove a team member (Admin only)"""
    
    member = db.query(User).filter(User.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # Verify both users are in the same team
    if member.team_id != current_user.team_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this member"
        )
    
    # Prevent self-removal if user is the only admin
    if member.id == current_user.id:
        admin_count = db.query(User).filter(
            User.team_id == current_user.team_id,
            User.role == "admin",
            User.is_active == True
        ).count()
        
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last admin of the team"
            )
    
    # Instead of deleting, deactivate the user
    member.is_active = False
    member.team_id = None
    db.commit()
    
    return {"message": "Member removed successfully"}