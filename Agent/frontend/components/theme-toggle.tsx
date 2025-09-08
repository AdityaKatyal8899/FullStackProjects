"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const toggle = () => {
    const next = (resolvedTheme || theme) === "dark" ? "white" : "dark"
    setTheme(next)
    try {
      const root = document.documentElement
      if (next === "dark") root.classList.add("dark")
      else root.classList.remove("dark")
    } catch {}
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Toggle theme" className="shrink-0 bg-transparent">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="shrink-0 bg-transparent"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
