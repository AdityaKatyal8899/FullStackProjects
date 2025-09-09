// app/sign-up/page.tsx (server component ✅)
import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"

export const metadata: Metadata = {
  title: "Sign Up • To Talk to Omaju",
}

export default function SignUpPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto flex min-h-dvh max-w-2xl items-center justify-center">
        <div className="w-full">
          <header className="hidden px-4 sm:block">
            <h1 className="p-6 text-balance text-center text-3xl font-semibold">
              Create your account <span className="text-cyan-400">for</span>{" "}
              <span className="text-yellow-500">Instant Notes</span>
            </h1>
          </header>
          <AuthCard mode="signup" />
        </div>
      </section>
    </main>
  )
}
