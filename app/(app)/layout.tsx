import { ClerkProvider } from "@clerk/nextjs"
import { OnboardingGuard } from "@/components/app/onboarding/OnboardingGuard"
import { SanityLive } from "@/sanity/lib/live"
import { AppHeader } from "@/components/app/layout/AppHeader"

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <OnboardingGuard>
        <AppHeader />
        {children}
      </OnboardingGuard>     
      <SanityLive />
    </ClerkProvider>
  )
}