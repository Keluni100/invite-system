# Team Management Frontend

A modern React/Next.js frontend for the team management system with invite functionality.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000

## 🔧 Environment Setup

Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Features

- **Authentication System:** Login/Register with JWT tokens
- **Dashboard:** Role-based dashboard (Admin/Member views)
- **Team Management:** View team members and pending invitations
- **Invite System:** Send email invitations to new team members
- **Role Management:** Update member roles (Admin only)
- **Real-time Updates:** Live member list updates

## 🧪 Test the System

### Step 1: Create an Admin Account
1. Go to http://localhost:3001
2. Click "Sign up" 
3. Register with:
   - Email: `admin@example.com`
   - Password: `password123`
   - First Name: `Admin`
   - Last Name: `User`

### Step 2: Test Invite Functionality
1. Login as admin
2. Use the "Invite Team Member" form
3. Enter an email (e.g., `member@example.com`)
4. Select role (Member/Admin)
5. Click "Send Invitation"

### Step 3: Check API Connection
- Use the "API Connection Tester" at the bottom of the dashboard
- Click "Test API Connection" to verify backend connectivity

## 🏗️ Architecture

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard page
├── components/         # React components
│   ├── auth/          # Authentication forms
│   ├── team/          # Team management components
│   └── debug/         # Debug/testing components
├── lib/               # Utilities and API client
├── store/             # Zustand state management
└── types/             # TypeScript type definitions
```

## 🔑 Key Components

- **API Client:** Axios-based client with automatic token refresh
- **State Management:** Zustand stores for auth and team data
- **Error Handling:** Centralized error handling with user-friendly messages
- **Security:** JWT token management with localStorage fallback

## 🚨 Troubleshooting

### Network Error Issues
1. Ensure backend is running on port 8000
2. Check CORS settings in backend
3. Verify API URL in environment variables

### Authentication Issues
1. Clear localStorage: `localStorage.clear()`
2. Check token expiration
3. Verify backend auth endpoints

### Missing Data
1. Use API Tester to diagnose connectivity
2. Check browser network tab for failed requests
3. Verify backend database has test data

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Icons:** Heroicons

---

**Status:** ✅ Fixed and working!
- Network errors resolved
- Complete invite system implemented
- Dashboard with member management
- Role-based access control
- Real-time member list updates