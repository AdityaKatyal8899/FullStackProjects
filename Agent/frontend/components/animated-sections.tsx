"use client"

import * as React from "react"

export function AnimatedSections({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let ctx: { revert: () => void } | null = null
    ;(async () => {
      const gsap = (await import("gsap")).default
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>(".reveal")
        items.forEach((el) => {
          gsap.fromTo(
            el,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            },
          )
        })
      })
    })()

    return () => {
      if (ctx) ctx.revert()
    }
  }, [])

  return <>{children}</>
}
