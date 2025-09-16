'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<{ accessToken: string; refreshToken: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ accessToken: string; refreshToken: string }>;
  loginWithToken: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing tokens on mount
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    if (savedAccessToken && savedRefreshToken) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      fetchUserProfile(savedAccessToken, savedRefreshToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string, refToken: string) => {
    try {
      const response = await authAPI.getProfile(authToken);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Try to refresh token if profile fetch fails
      try {
        const refreshResponse = await authAPI.refreshToken(refToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry profile fetch with new token
        const retryResponse = await authAPI.getProfile(newAccessToken);
        setUser(retryResponse.data.user);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.signin({ email, password });
      if (response.data) {
        const { user: userData, tokens } = response.data;
        
        setUser(userData);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      }
    } catch (error) {
      throw error;
    }
    throw new Error('Invalid login response');
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.signup({ email, password, name });
      if (response.data) {
        const { user: userData, tokens } = response.data;
        
        setUser(userData);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      }
    } catch (error) {
      throw error;
    }
    throw new Error('Invalid signup response');
  };

  const loginWithToken = async (authToken: string, refToken: string) => {
    try {
      setAccessToken(authToken);
      setRefreshToken(refToken);
      localStorage.setItem('accessToken', authToken);
      localStorage.setItem('refreshToken', refToken);
      await fetchUserProfile(authToken, refToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authAPI.logout(accessToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken,
      refreshToken, 
      login, 
      signup, 
      loginWithToken,
      logout, 
      loading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
