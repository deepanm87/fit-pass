"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import {
  useIsChatOpen,
  useChatActions
} from "@/lib/store/chat-store-provider"

export function ChatButton() {
  const { isSignedIn, isLoaded } = useUser()
  const isOpen = useIsChatOpen()
  const { toggleChat } = useChatActions()

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    return null
  }

  if (isOpen) {
    return null
  }

  return (
    <Button
      onClick={toggleChat}
      size="icon"
      className="fixed bottom-4 right-4 z-40 size-14 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105"
      aria-label="Open AI Assistant"
    >
      <MessageCircle className="size-6" />
    </Button>
  )
}