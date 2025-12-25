import { ClerkProvider } from "@clerk/nextjs"
import { SanityLive } from "@/sanity/lib/live"

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      {children}
      <SanityLive />
    </ClerkProvider>
  )
}