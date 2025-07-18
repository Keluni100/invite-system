# 🔒 Team Isolation & Role-Based Permissions Test Guide

## ✅ Current Implementation

The system now properly implements:

### 1. **Team Isolation**
- Users can only see members of their own team
- Each team's data is completely isolated
- API endpoints verify team membership

### 2. **Role-Based Permissions**
- **Admin**: Can invite new members, manage roles, remove members
- **Member**: Can only view team members (no invite capability)

### 3. **Registration Control**
- Only the first user can register (becomes admin)
- All other users must be invited by an admin
- No open registration after first user

## 🧪 Test Scenarios

### Scenario 1: Create First Team (Admin's Team)

1. **Clear Database** (start fresh):
   ```bash
   cd backend
   rm team_management.db
   python3 -m alembic upgrade head
   ```

2. **Register First User** (becomes admin):
   - Go to: http://localhost:3001/auth/register
   - Register as Admin:
     - First Name: Admin
     - Last Name: User
     - Email: admin@example.com
     - Password: testpass123
   - This creates "Admin's Team"

3. **Admin Dashboard**:
   - Can see invite form ✅
   - Can invite members ✅
   - Can manage team ✅

### Scenario 2: Invite Team Members

1. **As Admin, Send Invitations**:
   - Invite Member: member1@example.com (role: member)
   - Invite Admin: admin2@example.com (role: admin)

2. **Accept Invitation as Member**:
   - Use invitation link for member1@example.com
   - Create account
   - Login to dashboard
   - **Result**: 
     - ❌ No invite form visible
     - ✅ Can see team members
     - ❌ Cannot remove/edit members

3. **Accept Invitation as Admin**:
   - Use invitation link for admin2@example.com
   - Create account
   - Login to dashboard
   - **Result**:
     - ✅ Can see invite form
     - ✅ Can invite more members
     - ✅ Can manage all team members

### Scenario 3: Create Second Team (Test Isolation)

1. **Try to Register New User** (should fail):
   - Go to: http://localhost:3001/auth/register
   - Try to register: owner2@example.com
   - **Result**: ❌ "Registration is closed. Please request an invitation"

2. **Create Second Team via Database** (for testing):
   ```sql
   -- In SQLite:
   INSERT INTO teams (name, created_by) VALUES ('Team B', 999);
   INSERT INTO users (email, password_hash, first_name, last_name, role, team_id, is_active) 
   VALUES ('teamb@example.com', '$2b$12$dummy', 'Team B', 'Admin', 'admin', 2, 1);
   ```

3. **Test Isolation**:
   - Login as admin@example.com (Team A)
   - Try to access Team B data:
     ```javascript
     // In browser console:
     fetch('http://localhost:8000/team/members-with-invitations?team_id=2', {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('access_token')}`
       }
     }).then(r => r.json()).then(console.log)
     ```
   - **Result**: ❌ "Not authorized to view this team's members"

## 📋 Permission Matrix

| Action | Admin | Member |
|--------|-------|--------|
| View team members | ✅ | ✅ |
| Invite new members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| View other teams | ❌ | ❌ |

## 🔐 Security Features

### Backend Protection:
```python
# Every team endpoint checks:
if current_user.team_id != team_id:
    raise HTTPException(403, "Not authorized")

# Admin-only endpoints use:
current_user: User = Depends(get_current_admin_user)
```

### Frontend Protection:
```jsx
// Invitation form only shown to admins:
{user.role === 'admin' && (
  <InviteMemberForm />
)}

// Role management only for admins:
{canManageMembers && member.id !== user?.id && (
  <select>...</select>
)}
```

## 🚀 Quick Test Commands

### Test Team Isolation:
```bash
# Get token for Team A admin
TOKEN_A=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "testpass123"}' \
  2>/dev/null | jq -r '.access_token')

# Try to access Team B (should fail)
curl "http://localhost:8000/team/members-with-invitations?team_id=2" \
  -H "Authorization: Bearer $TOKEN_A"
# Result: 403 Forbidden
```

### Test Role Permissions:
```bash
# Login as member
TOKEN_MEMBER=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "member1@example.com", "password": "password"}' \
  2>/dev/null | jq -r '.access_token')

# Try to invite (should fail)
curl -X POST "http://localhost:8000/team/invite" \
  -H "Authorization: Bearer $TOKEN_MEMBER" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "role": "member", "team_id": 1}'
# Result: 403 Admin access required
```

## ✅ Summary

The system now correctly implements:
1. **Team Isolation**: Users only see their own team
2. **Role-Based Access**: Admins can invite, members cannot
3. **Secure Registration**: Only via invitation after first user
4. **Complete Separation**: No cross-team data access

Each invited user:
- Joins the inviter's team
- Has appropriate permissions based on role
- Cannot see or access other teams' data