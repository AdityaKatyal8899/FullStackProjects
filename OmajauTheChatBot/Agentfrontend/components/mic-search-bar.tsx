"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"

type MicSearchBarProps = {
  placeholder?: string
  onSubmitText?: (text: string) => void
  onMicHoldStart?: () => void
  onMicHoldEnd?: () => void
}

export function MicSearchBar({
  placeholder = "Ask or dictate…",
  onSubmitText,
  onMicHoldStart,
  onMicHoldEnd,
}: MicSearchBarProps) {
  const [value, setValue] = React.useState("")
  const [recording, setRecording] = React.useState(false)
  const micBtnRef = React.useRef<HTMLButtonElement | null>(null)
  const holdTimerRef = React.useRef<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitText?.(value)
  }

  const startHold = () => {
    setRecording(true)
    onMicHoldStart?.()
  }

  const endHold = () => {
    setRecording(false)
    onMicHoldEnd?.()
  }

  const onMouseDown = () => {
    holdTimerRef.current = window.setTimeout(startHold, 100)
  }
  const onMouseUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (recording) endHold()
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      startHold()
    }
  }
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      endHold()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex w-full items-center gap-2 rounded-full border bg-background px-5 py-4">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 rounded-full"
          aria-label="Search or dictate"
        />
        <div className="flex items-center justify-center gap-1 pr-1">
          <Button type="submit" variant="secondary" className="hidden sm:inline-flex p-2 text-xl rounded-full">
            ⬆️
          </Button>
          <Button
            ref={micBtnRef}
            type="button"
            size="icon"
            aria-pressed={recording}
            aria-label={recording ? "Stop recording" : "Hold to record"}
            className={cn(
              "transition-colors text-2xl rounded-full",
              recording
                ? "bg-amber-400 text-black hover:bg-amber-400/90"
                : "bg-cyan-500 text-black hover:bg-cyan-500/90",
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={(e) => {
              e.preventDefault()
              startHold()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              endHold()
            }}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{recording ? "Stop" : "Mic"}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
