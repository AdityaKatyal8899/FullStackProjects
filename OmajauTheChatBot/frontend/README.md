# Speech-to-Text Signup UI with Authentication Backend

A complete authentication system featuring a modern Next.js frontend with a robust Node.js/Express backend.

## 🚀 Features

### Frontend (Next.js)
- Modern, responsive UI with Tailwind CSS
- Sign up and sign in forms
- Form validation and error handling
- Beautiful animations and transitions
- Mobile-first design

### Backend (Node.js/Express)
- RESTful API with Express
- JWT-based authentication
- Password hashing with bcrypt
- MongoDB database integration
- Input validation and sanitization
- CORS enabled for frontend integration
- Comprehensive error handling

## 📁 Project Structure

```
speech-to-text-signup-ui/
├── app/                    # Next.js app directory
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── styles/                 # CSS and Tailwind styles
├── backend/                # Authentication backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth and validation middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Environment Configuration

#### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔐 Authentication API

### Endpoints

- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/signin` - User login
- **GET** `/api/auth/me` - Get user profile (protected)
- **GET** `/health` - Server health check

### Request/Response Examples

#### Signup
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Signin
```json
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

## 🎨 Frontend Integration

### API Service
Create `lib/api.ts` in your Next.js project:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  
  signin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }
};
```

### Authentication Hook
Use the provided `useAuth` hook for state management:

```typescript
import { useAuth } from '@/hooks/useAuth';

export function SignupForm() {
  const { signup } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, firstName, lastName);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with secure secrets
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured for frontend security
- **Error Sanitization**: No sensitive data leaked in production

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  createdAt: Date (auto-generated),
  lastLogin: Date (updated on signin)
}
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update `NEXT_PUBLIC_API_URL` to production backend URL

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm run test
```

### Manual Testing
1. Start both servers
2. Test signup flow
3. Test signin flow
4. Test protected routes
5. Verify JWT token storage

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Integration Guide](backend/frontend-integration.md)
- [API Endpoints Reference](backend/README.md#api-endpoints)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section in the backend README
2. Review the frontend integration guide
3. Check the console logs for error details
4. Verify environment variable configuration

## 🔄 Updates

Stay updated with the latest changes:
- Backend: Check `backend/package.json` for dependency updates
- Frontend: Check root `package.json` for dependency updates
- Security: Regularly update JWT secrets and dependencies
