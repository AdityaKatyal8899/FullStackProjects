"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import type * as React from "react"

type Props = {
  onGoogle?: () => void
  onGithub?: () => void
}

export function SocialButtons({ onGoogle, onGithub }: Props) {
  const handleGoogleAuth = () => {
    if (onGoogle) {
      onGoogle();
    } else {
      window.location.href = `http://localhost:5001/api/auth/google`;
    }
  };

  const handleGithubAuth = () => {
    if (onGithub) {
      onGithub();
    } else {
      window.location.href = `http://localhost:5001/api/auth/github`;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full border-border/60 bg-background/60 hover:bg-accent/50"
        onClick={handleGoogleAuth}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full border-border/60 bg-background/60 hover:bg-accent/50"
        onClick={handleGithubAuth}
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>
    </div>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.6 3 14.5 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.8-.1-1H12z"
      />
    </svg>
  )
}
