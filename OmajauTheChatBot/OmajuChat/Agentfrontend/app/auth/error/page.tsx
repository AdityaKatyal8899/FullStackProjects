"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('Authentication failed')

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setErrorMessage(message)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Authentication Error</h1>
          <p className="text-gray-400 mb-6">{errorMessage}</p>
          <Button 
            onClick={() => window.location.href = 'https://omaju-signup.vercel.app/'}
            className="w-full bg-cyan-500 hover:bg-cyan-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
