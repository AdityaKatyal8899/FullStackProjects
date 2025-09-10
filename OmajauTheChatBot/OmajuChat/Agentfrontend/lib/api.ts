const API_BASE_URL = 'http://localhost:5000'

export interface ChatMessage {
  session_id: string
  message: string
  role?: 'user' | 'assistant'
}

export interface ChatResponse {
  response: string
}

export interface ConversationHistory {
  _id?: string
  session_id: string
  created_at?: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

// Send a message to the backend
export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError(401, 'Authentication token not found')
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(message),
    mode: 'cors',
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = 'https://omaju-signup.vercel.app/'
    }
    throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Get conversation history for a session
export async function getConversationHistory(sessionId: string): Promise<ConversationHistory | null> {
  const token = getAuthToken()
  if (!token) {
    throw new ApiError(401, 'Authentication token not found')
  }

  const response = await fetch(`${API_BASE_URL}/messages/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (response.status === 404) return null
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    window.location.href = 'https://omaju-signup.vercel.app/'
    return null
  }
  if (!response.ok) throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
  return response.json()
}

// Check backend health
export async function checkHealth(): Promise<{ status: string; mongodb: string; genai: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
  return response.json()
}

export { API_BASE_URL }
  