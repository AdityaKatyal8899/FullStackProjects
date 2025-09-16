"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, refreshToken: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    
    if (storedToken) {
      // Verify token with backend
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const setCookie = (name: string, value: string, days: number) => {
    try {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      const expires = `; expires=${date.toUTCString()}`
      document.cookie = `${name}=${value}; path=/; SameSite=Lax;${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}${expires}`
    } catch (_) {
      // no-op in non-browser
    }
  }

  const deleteCookie = (name: string) => {
    try {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax;${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}`
    } catch (_) {
      // no-op
    }
  }

  const verifyToken = async (accessToken: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
        setToken(accessToken)
        // keep cookie fresh if missing
        setCookie('accessToken', accessToken, 1)
      } else {
        // Token is invalid, try to refresh
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          await refreshAccessToken(refreshToken)
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const { accessToken, refreshToken: newRefreshToken } = data.data.tokens
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        setCookie('accessToken', accessToken, 1)
        setCookie('refreshToken', newRefreshToken, 30)
        
        await verifyToken(accessToken)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setCookie('accessToken', accessToken, 1)
    setCookie('refreshToken', refreshToken, 30)
    
    await verifyToken(accessToken)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('session_id')
    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    setUser(null)
    setToken(null)
    
    // Redirect to signup page
    window.location.href = 'http://localhost:3001'
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
