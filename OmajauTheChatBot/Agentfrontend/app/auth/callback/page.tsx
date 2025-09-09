"use client"
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const refreshToken = searchParams.get('refresh')
      const provider = searchParams.get('provider')

      if (token && refreshToken) {
        try {
          await login(token, refreshToken)
          router.push('/') // Redirect to chat interface
        } catch (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/error?message=Authentication failed')
        }
      } else {
        router.push('/auth/error?message=Missing authentication tokens')
      }
    }

    handleCallback()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  )
}
