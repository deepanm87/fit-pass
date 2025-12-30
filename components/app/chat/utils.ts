import type { UIMessage } from "ai"
import type { ToolCallPart } from "./types"

export function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return ""
  }
  return message.parts
    .filter(part => part.type === "text")
    .map(part => (part as { 
      type: "text"
      text: string
    }).text)
    .join("\n")
}

export function getToolParts(message: UIMessage): ToolCallPart[] {
  if (!message.parts || message.parts.length === 0) {
    return []
  }
  return message.parts
    .filter(part => part.type.startsWith("tool-"))
    .map(part => {
      const p = part as Record<string, unknown>
      return {
        type: p.type as string,
        toolName: p.toolName as string | undefined,
        toolCallId: p.toolCallId as string | undefined,
        state: p.state as ToolCallPart["state"],
        input: p.input as Record<string, unknown> | undefined,
        args: p.args as Record<string, unknown> | undefined,
        output: p.output as ToolCallPart["output"],
        result: p.result as ToolCallPart["result"]
      }
    })
}