# AgentSignUp Backend

A robust Node.js backend authentication system with Express.js, MongoDB, JWT tokens, and OAuth integration for Google and GitHub.

## Features

- **Multiple Authentication Methods**:
  - Email/Password signup and login
  - Google OAuth2 integration
  - GitHub OAuth2 integration

- **Security Features**:
  - JWT access and refresh tokens
  - Password hashing with bcrypt
  - Account lockout after failed attempts
  - Rate limiting
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers

- **Database Design**:
  - Separate MongoDB collections for different auth providers
  - EmailUser, GoogleUser, GithubUser collections
  - Helper functions to find users across collections

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - MongoDB connection string
   - JWT secrets (change the default ones!)
   - Google OAuth credentials
   - GitHub OAuth credentials

## Environment Variables

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/agent-signup

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-2024

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## OAuth Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5000/api/auth/google/callback` to authorized redirect URIs

### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:5000/api/auth/github/callback`

## Running the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Email/password registration | No |
| POST | `/api/auth/signin` | Email/password login | No |
| POST | `/api/auth/refresh-token` | Refresh JWT tokens | No |
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| GET | `/api/auth/github` | Initiate GitHub OAuth | No |
| GET | `/api/auth/github/callback` | GitHub OAuth callback | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/health` | Health check | No |

### Request/Response Examples

#### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Signin
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

#### Protected Routes
```bash
GET /api/auth/profile
Authorization: Bearer your-access-token-here
```

## Database Collections

### EmailUser
- email (unique)
- password (hashed)
- name
- avatar
- isEmailVerified
- loginAttempts
- lockUntil
- Common fields (isActive, lastLogin, createdAt, updatedAt)

### GoogleUser
- email (unique)
- googleId (unique)
- name
- avatar
- provider: 'google'
- Common fields

### GithubUser
- email (unique)
- githubId (unique)
- name
- username
- avatar
- provider: 'github'
- Common fields

## Security Features

- **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and number
- **Account Lockout**: 5 failed attempts locks account for 2 hours
- **Rate Limiting**: 
  - Global: 100 requests per 15 minutes
  - Auth routes: 10 requests per 15 minutes
  - Sensitive routes: 5 requests per 15 minutes
- **Input Sanitization**: Removes HTML/script tags
- **CORS**: Configured for frontend origins
- **JWT**: Short-lived access tokens (15 minutes) with refresh tokens (7 days)

## Error Handling

All API responses follow a consistent JSON format:

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Development

The backend is structured as follows:

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Passport OAuth strategies
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   ├── auth.js           # JWT middleware
│   └── validation.js     # Input validation
├── models/
│   └── User.js           # User schemas and helpers
├── routes/
│   └── auth.js           # Authentication routes
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies
├── README.md             # Documentation
└── server.js             # Main server file
```

## Production Deployment

1. Change JWT secrets in production
2. Use a production MongoDB instance
3. Set NODE_ENV=production
4. Configure proper CORS origins
5. Use HTTPS for OAuth callbacks
6. Consider using a reverse proxy (nginx)
7. Set up proper logging and monitoring

## Troubleshooting

- **MongoDB Connection Issues**: Ensure MongoDB is running and connection string is correct
- **OAuth Errors**: Verify client IDs, secrets, and callback URLs
- **CORS Issues**: Check frontend URL in CORS configuration
- **Token Issues**: Ensure JWT secrets are set and consistent
