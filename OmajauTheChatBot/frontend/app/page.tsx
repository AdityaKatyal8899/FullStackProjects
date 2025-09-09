'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-cyan-400">Speech</span> <span className="text-yellow-500">to Text</span></h1>
      <p className="text-lg text-muted-foreground mb-8">Sign in or sign up to get started with instant transcription.</p>
      <div className="flex gap-4">
        <Link href="/sign-in" className="px-6 py-2 font-semibold leading-8 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition">
          Sign In
        </Link>
        <Link href="/sign-up" className="px-6 py-2 bg-gray-200 font-semibold leading-8 text-gray-800 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
