"use client"
import React, { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function UserProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Mock user for testing
  const user = {
    name: "Aditya Katyal",
    email: "aditya@example.com",
    avatar: "", // put URL if you want
    provider: "email",
  }
  const isAuthenticated = true // toggle this to test

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    alert("Logged out!") // replace with your logout function
    setIsOpen(false)
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <>
      {/* Avatar icon */}
      {isAuthenticated && user && (
        <div className="fixed top-4 right-4 z-50">
          <Avatar
            className="h-12 w-12 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-cyan-500 text-white font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Sidebar with backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              ref={sidebarRef}
              className="fixed top-0 right-0 h-full w-72 bg-gray-900 border-l border-gray-700 shadow-2xl rounded-l-2xl z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-6 overflow-hidden">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-cyan-500 text-white font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{user.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-400">
                      {user.provider === "email" ? "Email" : user.provider === "google" ? "Google" : "GitHub"}
                    </span>
                  </div>
                </div>

                {/* Menu */}
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded">
                    <User className="h-5 w-5 shrink-0" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded">
                    <Settings className="h-5 w-5 shrink-0" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-red-400 border border-red-400/20 hover:bg-red-400/10 hover:text-red-300 p-2 rounded mt-4"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
