import { ClerkProvider } from "@clerk/nextjs"
import { SanityLive } from "@/sanity/lib/live"
import { AppHeader } from "@/components/app/layout/AppHeader"

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <AppHeader />
      {children}
      <SanityLive />
    </ClerkProvider>
  )
}