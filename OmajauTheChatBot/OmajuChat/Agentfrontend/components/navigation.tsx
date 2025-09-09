"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/chat", label: "Chat", icon: "💬" }
  ]

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-10 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-cyan-500 text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <span>{item.icon}</span>
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
