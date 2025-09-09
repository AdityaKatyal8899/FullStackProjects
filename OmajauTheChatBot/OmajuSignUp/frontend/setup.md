# Setup Instructions

Follow these steps to set up the complete authentication system with frontend and backend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or Atlas)
- npm or yarn

## Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key for JWT tokens
# - PORT: Backend port (default: 5000)
# - FRONTEND_URL: Frontend URL for CORS (default: http://localhost:3000)
```

**Example .env file for backend:**
```env
MONGO_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Frontend Setup

```bash
# Navigate back to project root
cd ..

# Create frontend environment file
cp env.local.example .env.local
```

**Example .env.local file for frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Testing the Setup

### 1. Health Check
Visit: http://localhost:5000/health
Should return: `{"success": true, "message": "Server is running", ...}`

### 2. Frontend Test
Visit: http://localhost:3000
- Should show the welcome page with Sign In/Sign Up buttons
- Try signing up with a new account
- Try signing in with existing credentials
- After successful auth, should redirect to dashboard

### 3. API Test (Optional)
```bash
cd backend
node test-api.js
```

## Directory Structure

```
speech-to-text-signup-ui/
├── app/                    # Next.js app directory
│   ├── sign-in/           # Sign in page
│   ├── sign-up/           # Sign up page
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── hooks/                # Custom hooks
│   └── useAuth.tsx       # Authentication hook
├── lib/                  # Utilities
│   └── api.ts            # API service
├── backend/              # Authentication backend
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth and validation middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Main server file
└── README.md            # Project documentation
```

## Features

### Frontend
- ✅ Modern UI with Tailwind CSS
- ✅ Sign up with first name, last name, email, password
- ✅ Sign in with email and password
- ✅ Form validation and error handling
- ✅ Loading states and user feedback
- ✅ Protected routes
- ✅ Automatic redirects based on auth state
- ✅ Dashboard for authenticated users

### Backend
- ✅ RESTful API with Express
- ✅ JWT authentication with 7-day expiration
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ MongoDB integration with Mongoose
- ✅ Input validation with express-validator
- ✅ CORS enabled for frontend communication
- ✅ Comprehensive error handling
- ✅ Environment variable configuration

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication  
- `GET /api/auth/me` - Get user profile (protected)
- `GET /health` - Server health check

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running locally
   - Check MONGO_URI in backend/.env
   - For Atlas: verify connection string and IP whitelist

2. **CORS Errors**
   - Verify FRONTEND_URL in backend/.env
   - Ensure frontend runs on expected port (3000)

3. **JWT Errors**
   - Check JWT_SECRET is set in backend/.env
   - Verify token format in Authorization header

4. **Environment Variables**
   - Frontend vars must start with NEXT_PUBLIC_
   - Restart servers after changing .env files

### Logs to Check

- Backend console for API requests and errors
- Browser console for frontend errors
- Network tab for API call details

## Next Steps

After setup is complete, you can:

1. Customize the UI components
2. Add more user profile fields
3. Implement password reset functionality
4. Add OAuth providers (Google, GitHub)
5. Set up email verification
6. Deploy to production

## Support

If you encounter issues:
1. Check the logs in both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Test API endpoints directly with the test script
