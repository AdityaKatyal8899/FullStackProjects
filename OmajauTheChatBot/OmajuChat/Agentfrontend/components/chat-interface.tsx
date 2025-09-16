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
  const [errorMsg, setErrorMsg] = useState<string>("")
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      const conversation = await getConversationHistory(sessionId)
      if (conversation?.messages) setMessages(conversation.messages)
    }
    fetchMessages()
  }, [sessionId])

  // Auto-scroll to latest message whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
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
      setErrorMsg("Unable to send message. Please try again.")
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong.", timestamp: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
      // Hide error banner after a short delay
      setTimeout(() => setErrorMsg(""), 4000)
    }
  }

  return (
    <main
      className="min-h-screen w-screen flex flex-col items-center justify-start"
      style={{
        backgroundImage: "url(/mnt/data/slovenia-hilltop-3840x2160-23639.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="flex flex-col shadow-2xl rounded-xl overflow-hidden border border-white/20
        w-[92vw] sm:w-[50vw] md:w-[70vw] lg:w-[70vw] xl:w-[50vw]
        my-10"
        style={{
          // Glassmorphism container
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Error banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 rounded-md bg-red-500/15 border border-red-500/40 text-red-200 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Chat Messages: auto-expands; no inner scroll; wraps text; contained */}
        <div className="flex flex-col space-y-3 p-6 overflow-visible">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 text-cyan-300 font-semibold">Omaju:</div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[75%] break-words whitespace-pre-wrap overflow-hidden border ${
                  msg.role === "user"
                    ? "self-end text-white border-white/10"
                    : "self-start text-white border-white/10"
                }`}
                style={{
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(0, 0, 0, 0.30)'
                }}
              >
                {msg.content || (isLoading && msg.role === "assistant" ? (
                  <span className="animate-pulse text-gray-300">Omaju is typing...</span>
                ) : null)}
                <div className="mt-1 text-[10px] text-gray-200/80">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {/* Anchor for optional auto-scroll behavior */}
          <div ref={endRef} />
        </div>

        {/* Input Box fixed at the bottom of the chat box */}
        <div
          className="mt-auto flex border-t border-white/20 p-3 rounded-b-xl"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.10)' }}
        >
          <input
            type="text"
            className="flex-1 rounded-lg px-4 py-2 text-white focus:outline-none placeholder:text-gray-200/70"
            style={{ background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(8px)' }}
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            className="ml-3 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
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
