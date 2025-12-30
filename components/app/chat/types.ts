type ToolCallState = "partial-call" | "call" | "output-available" | "result"

interface SearchClassItem {
  _id: string
  name: string
  instructor: string
  duration: number
  tierLevel: "basic" | "performance" | "champion"
  category?: { name: string }
}

interface ClassSessionItem {
  id: string
  startTime: string
  spotsAvailable: number
  activity: {
    name: string
    instructor: string
    duration: number
    tierLevel: string
  }
  venue: {
    name: string
    city: string
  }
}

interface UserBookingItem {
  id: string
  status: string
  bookedAt?: string
  attendedAt?: string
  class?: string
  instructor?: string
  duration?: number
  dateTime?: string
  venue?: string
  city?: string
}

export type ToolResultItem = 
  | SearchClassItem
  | ClassSessionItem
  | UserBookingItem

export interface ToolOutput {
  classes?: SearchClassItem[]
  sessions?: ClassSessionItem[]
  venues?: Array<{ 
    _id: string
    name: string
    [key: string]: unknown
  }>
  bookings?: UserBookingItem[]
  recommendations?: SearchClassItem[]
  [key: string]: unknown
}

export interface ToolCallPart {
  type: string
  toolName?: string
  toolCallId?: string
  state?: ToolCallState
  input?: Record<string, unknown>
  args?: Record<string, unknown>
  output?: ToolOutput
  result?: ToolOutput
}