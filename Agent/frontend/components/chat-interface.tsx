"use client"
import { useEffect, useRef, useState } from "react"
import { sendChatMessage, getConversationHistory } from "@/lib/api"

interface ChatInterfaceProps {
  sessionId: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversation messages on mount
  useEffect(() => {
    async function fetchMessages() {
      const conversation = await getConversationHistory(sessionId)
      if (conversation?.messages) setMessages(conversation.messages)
    }
    fetchMessages()
  }, [sessionId])

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")

    try {
      const res = await sendChatMessage({ session_id: sessionId, message: userMsg.content })
      const assistantMsg: Message = {
        role: "assistant",
        content: res.response,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error("Chat error:", err)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-3xl h-[75vh] bg-gray-900 rounded-xl shadow-xl mx-auto overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Show name for assistant */}
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 text-cyan-400 font-semibold">Omaju:</div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[70%] break-words ${
                msg.role === "user" ? "bg-cyan-600 text-white self-end" : "bg-gray-800 text-gray-100 self-start"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex border-t border-gray-700 p-3 bg-gray-800">
        <input
          type="text"
          className="flex-1 bg-gray-900 rounded-lg px-4 py-2 text-white focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="ml-3 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2 rounded-lg font-semibold transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  )
}
