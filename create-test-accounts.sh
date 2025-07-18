#!/bin/bash

echo "🧪 Creating Test Accounts for Role Testing"
echo "=========================================="

# Get admin token
echo "📋 Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "testpass123"}' \
  | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token. Make sure admin@example.com exists."
  exit 1
fi

echo "✅ Admin token obtained"

# Create member invitation
echo "📧 Creating member invitation..."
MEMBER_TOKEN=$(curl -s -X POST "http://localhost:8000/team/invite" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "member@test.com", "role": "member", "team_id": 1}' \
  | jq -r '.token')

if [ "$MEMBER_TOKEN" = "null" ] || [ -z "$MEMBER_TOKEN" ]; then
  echo "❌ Failed to create member invitation"
  exit 1
fi

echo "✅ Member invitation created"

# Accept member invitation
echo "👤 Accepting member invitation..."
curl -s -X POST "http://localhost:8000/team/accept-invitation/$MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test", "last_name": "Member", "password": "testpass123"}' \
  > /dev/null

echo "✅ Member account created"

# Create admin invitation
echo "📧 Creating admin invitation..."
ADMIN2_TOKEN=$(curl -s -X POST "http://localhost:8000/team/invite" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin2@test.com", "role": "admin", "team_id": 1}' \
  | jq -r '.token')

if [ "$ADMIN2_TOKEN" = "null" ] || [ -z "$ADMIN2_TOKEN" ]; then
  echo "❌ Failed to create admin invitation"
  exit 1
fi

echo "✅ Admin invitation created"

# Accept admin invitation
echo "👤 Accepting admin invitation..."
curl -s -X POST "http://localhost:8000/team/accept-invitation/$ADMIN2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test", "last_name": "Admin", "password": "testpass123"}' \
  > /dev/null

echo "✅ Admin account created"

echo ""
echo "🎉 Test accounts created successfully!"
echo "====================================="
echo ""
echo "Login Credentials:"
echo "📧 Original Admin: admin@example.com / testpass123 (admin)"
echo "👤 Test Member:    member@test.com / testpass123 (member)"
echo "👑 Test Admin:     admin2@test.com / testpass123 (admin)"
echo ""
echo "🧪 Test with these accounts at: http://localhost:3001/auth/login"
echo ""
echo "Expected behavior:"
echo "✅ Admin accounts: Can see invite form and manage members"
echo "✅ Member account: Can see member list but no invite form"
echo "❌ Member account: Cannot edit/remove members"