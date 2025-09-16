"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, EyeOff, User2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SocialButtons } from "./social-buttons"

type Props = {
  mode: "signin" | "signup"
  onSubmit?: (data: Record<string, string>) => void
}

export function AuthCard({ mode, onSubmit }: Props) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, signup } = useAuth()
  const router = useRouter()

  const title = mode === "signin" ? "Sign In" : "Sign Up"
  const submitLabel = mode === "signin" ? "Sign In" : "Create Account"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const formData = Object.fromEntries(fd) as Record<string, string>

    try {
      let accessToken = ""
      let refreshToken = ""
      if (mode === "signup") {
        // Validate password confirmation
        if (formData.password !== formData.confirm) {
          setError("Passwords do not match")
          return
        }

        const tokens = await signup(
          formData.email,
          formData.password,
          `${formData.firstName} ${formData.lastName}`
        )
        accessToken = tokens.accessToken
        refreshToken = tokens.refreshToken
      } else {
        const tokens = await login(formData.email, formData.password)
        accessToken = tokens.accessToken
        refreshToken = tokens.refreshToken
      }

      // Call the original onSubmit if provided
      onSubmit?.(formData)

      // Redirect to OmajuChat callback with tokens so it can set cookies
      const callbackUrl = `http://localhost:3000/auth/callback?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`
      window.location.href = callbackUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-8 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>
        <ThemeToggle />
      </div>

      <Card className="border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border/60">
              <User2 className="h-5 w-5 text-cyan-400" />
            </div>
            <CardTitle className="text-pretty text-2xl font-semibold">{title}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Welcome back. Continue where you left off."
              : "Create your account to save transcriptions."}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === "signin" && (
                <div className="mt-1">
                  <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-cyan-500">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-500 disabled:opacity-50"
            >
              {loading ? "Please wait..." : submitLabel}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <SocialButtons />

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <Link href="/sign-up" className="font-medium text-cyan-500 hover:text-cyan-400">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-cyan-500 hover:text-cyan-400">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
{/* 
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Tip: Your voice, neatly structured. <span className="text-yellow-500">Low‑latency</span> •{" "}
        <span className="text-cyan-400">Real‑time</span>
      </div> */}
    </div>
  )
}
