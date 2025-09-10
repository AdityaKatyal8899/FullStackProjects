const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}/api`
  : 'http://localhost:5001/api'; // fallback for local dev

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  isEmailVerified?: boolean;
  username?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authAPI = {
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // include session cookies
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    return data;
  },

  signin: async (credentials: SigninData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // include session cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signin failed');
    return data;
  },

  getProfile: async (token: string): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get profile');
    return data;
  },

  // OAuth redirects
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  loginWithGithub: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ success: boolean; data: { tokens: { accessToken: string; refreshToken: string } } }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Token refresh failed');
    return data;
  },

  // Logout
  logout: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Logout failed');
    return data;
  },

  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Health check failed');
    return data;
  },
};
