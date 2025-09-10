"use client"
import { ChatInterface } from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackendStatus } from "@/components/backend-status"
import { Navigation } from "@/components/navigation"
import { UserProfileSidebar } from "@/components/user-profile-sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>("")
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to signup page if not authenticated
      window.location.href = 'https://omaju-signup.vercel.app/'
      return
    }
  }, [isAuthenticated, isLoading, router])

  // Generate or restore session ID
  useEffect(() => {
    if (isAuthenticated) {
      const existingSession = localStorage.getItem("session_id")
      if (existingSession) {
        setSessionId(existingSession)
      } else {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
        localStorage.setItem("session_id", newSessionId)
        setSessionId(newSessionId)
      }
    }
  }, [isAuthenticated])

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>
  if (!isAuthenticated) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Redirecting...</div>
  if (!sessionId) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>

  return (
    <main className="flex flex-col h-screen w-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/95 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-4">
          <span className="inline-block h-3 w-3 rounded-full bg-cyan-500 animate-pulse" />
          <h1 className="text-xl font-semibold tracking-tight">Omaju Chat Assistant</h1>
          <Navigation />
        </div>
        <div className="flex items-center gap-2">
          <BackendStatus />
          <ThemeToggle />
          <UserProfileSidebar />
        </div>
      </header>

      {/* Chat Interface occupies full remaining height */}
      <div className="flex-1">
        <ChatInterface sessionId={sessionId} />
      </div>
    </main>
  )
}
