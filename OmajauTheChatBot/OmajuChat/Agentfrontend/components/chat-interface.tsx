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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchMessages() {
      const conversation = await getConversationHistory(sessionId)
      if (conversation?.messages) setMessages(conversation.messages)
    }
    fetchMessages()
  }, [sessionId])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const assistantMsg: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      const res = await sendChatMessage({ session_id: sessionId, message: userMsg.content })

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].content = res.response
        return updated
      })

    } catch (err) {
      console.error("Chat error:", err)
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong.", timestamp: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="w-screen h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0d1b2a" }}
    >
      <div
        className="flex flex-col w-full max-w-3xl rounded-xl shadow-xl"
        style={{ backgroundColor: "#1b263b", height: "auto" }}
      >
        {/* Chat Messages */}
        <div className="flex flex-col space-y-3 p-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 text-cyan-400 font-semibold">Omaju:</div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[70%] break-words ${
                  msg.role === "user"
                    ? "bg-cyan-600 text-white self-end"
                    : "bg-[#2a3a55] text-gray-100 self-start"
                }`}
              >
                {msg.content || (isLoading && msg.role === "assistant" ? (
                  <span className="animate-pulse text-gray-400">Omaju is typing...</span>
                ) : null)}
              </div>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex border-t border-gray-700 p-3" style={{ backgroundColor: "#273657" }}>
          <input
            type="text"
            className="flex-1 rounded-lg px-4 py-2 text-white focus:outline-none bg-[#1e2a44]"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            className="ml-3 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2 rounded-lg font-semibold transition"
            onClick={handleSend}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
