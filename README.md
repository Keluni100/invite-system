# 🚀 Team Management System

A complete team management platform with invitation system, built with Next.js, FastAPI, and SQLite. Features role-based access control, email invitations, and real-time member management.

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

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with automatic token refresh
- Role-based access control (Admin/Member)
- Secure invitation token system
- Input validation and sanitization

### 📧 Invitation System
- Email invitations with secure token-based acceptance
- Custom invitation acceptance page with registration
- Automatic team member onboarding
- Built-in invitation testing tools

### 👥 Team Management
- Real-time member list updates
- Role management (promote/demote members)
- Member removal capabilities
- Pending invitation tracking

### 📊 Dashboard Features
- Role-based dashboard views
- Team statistics and member counts
- API connectivity testing
- Invitation workflow testing tools

### 🛠️ Developer Tools
- Built-in API tester for debugging
- Invitation workflow tester
- Real-time error handling and feedback
- Comprehensive logging

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

version 2 backend updates: I have re-engineered the email delivery system to serve as a reliable foundation for the new guardian consent workflow. The technical implementation prioritises deterministic behaviour and operational clarity, which are essential for a process of this nature.

The system now establishes connectivity through a deliberate protocol. It first verifies basic network reachability to the mail servers before attempting authentication. This produces specific, actionable error states. Connection issues are distinguished from credential problems, which allows for precise troubleshooting. Aggressive timeouts are enforced at each stage of the handshake to prevent indefinite hangs and ensure the application remains responsive.

I have integrated a suite of diagnostic utilities into the codebase. These tools allow for rapid verification of the entire delivery stack, from DNS resolution and port accessibility to SSL negotiation and credential validation. This transforms potential delivery failures from opaque issues into diagnosable events, providing the operational transparency required for a critical communication path.

The configuration management has been standardised. Environment variables are now loaded and validated at application startup using a structured settings class. File paths are handled in a platform-agnostic manner. This approach ensures the system fails immediately on invalid configuration, which is the correct point of failure, rather than during a live transaction.

These technical enhancements directly support the transition to an active consent model. The system's reliability and observability form the necessary groundwork for the next phase of development. The immediate next steps involve constructing the data model to associate guardians with invitees within a single account and tailoring the email templates to deliver distinct, role-appropriate messages to each party. The core delivery mechanism upon which this consent flow depends is now operational and robust.
