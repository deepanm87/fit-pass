"use client"

import { User, Bot } from "lucide-react"
import { MessageContent } from "./MessageContent"

interface MessageBubbleProps {
  role: string
  content: string
  closeChat: () => void
}

export function MessageBubble({
  role,
  content,
  closeChat
}: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary" : "bg-primary/10"
          }`}
      >
        {isUser ? (
          <User className="size-4 text-primary-foreground" />
        ) : (
          <Bot className="size-4 text-primary" />
        )}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
          }`}
      >
        <MessageContent 
          content={content}
          closeChat={closeChat}
          isUser={isUser}
        />
      </div>
    </div>
  )
}