"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) return

    const hasOnboarded = user.publicMetadata?.hasOnboarded as boolean | undefined

    // If user has already onboarded but is on onboarding routes, send them home
    if (hasOnboarded && pathname?.startsWith("/onboarding")) {
      router.push("/")
      return
    }

    // Allow studio routes without forcing onboarding
    if (pathname?.startsWith("/studio")) return

    // If user hasn't onboarded and isn't already on the onboarding flow, push them there
    if (!hasOnboarded && !pathname?.startsWith("/onboarding")) {
      router.push("/onboarding")
    }
  }, [isLoaded, user, pathname, router])

  return (
    <>
      {children}
    </>
  )
}