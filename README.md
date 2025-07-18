# Enterprise Team Management System

A modern team management system with role-based access control, email invitations, and differentiated admin/member experiences.

## Architecture

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite with Alembic migrations
- **Authentication**: JWT with refresh token strategy

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── database/          # SQLite database and migrations
└── docs/             # Documentation
```

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
cd backend
alembic upgrade head
```

## Features

### Core Features
- User authentication and authorization
- Role-based access control (Admin/Member)
- Email-based team invitations
- Team member management
- Activity logging and audit trails

### Admin Features
- Send team invitations
- Manage member roles
- View team analytics
- Remove team members

### Member Features
- View team information
- Access member dashboard
- Update profile information

## Security

- JWT authentication with 15-minute access tokens
- Role-based middleware protection
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- Activity logging for audit trails

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

### Build for Production
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend
DATABASE_URL=sqlite:///./team_management.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```