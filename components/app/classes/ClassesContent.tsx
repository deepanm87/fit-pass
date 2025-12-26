"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import { format, isToday, isTomorrow } from "date-fns"
import { SessionCard } from "./SessionCard"
import type { FILTERED_SESSIONS_QUERYResult } from "@/sanity.types"

type Session = FILTERED_SESSIONS_QUERYResult[number] & { distance: number }

interface ClassesContentProps {
  groupedSessions: [string, Session[]][]
  bookedSessionIds: string[]
}

function formatTableLabel(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return "Today"
  }
  if (isTomorrow(date)) {
    return "Tomorrow"
  }
  return format(date, "EEE d")
}

function formatDayHeader(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return "Today"
  }
  if (isTomorrow(date)) {
    return "Tomorrow"
  }
  return format(date, "EEE, MMM d")
}

export function ClassesContent({
  groupedSessions,
  bookedSessionIds
}: ClassesContentProps) {
  const bookedSet = new Set(bookedSessionIds)
  const dayKeys = groupedSessions.map(([dateKey]) => dateKey)
  const [activeDay, setActiveDay] = useState<string>(dayKeys[0] || "")
  const isScrollingFromClick = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const scrollToDay = useCallback((dateKey: string) => {
    const element = document.getElementById(`day-${dateKey}`)
    if (element) {
      isScrollingFromClick.current = true
      setActiveDay(dateKey)

      element.scrollIntoView({ behavior: "smooth", block: "start" })

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingFromClick.current = false
      }, 1000)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingFromClick.current) {
        return
      }

      const isAtBottom = 
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - 100

      if (isAtBottom && dayKeys.length > 0) {
        setActiveDay(dayKeys[dayKeys.length - 1])
        return
      }

      for (const dateKey of dayKeys) {
        const element = document.getElementById(`day-${dateKey}`)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveDay(dateKey)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [dayKeys])

  if (groupedSessions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No upcoming classes found in your area</p>
        <p className="mt-2 text-sm">
          Try increasing your search radius in your profile.
        </p>
      </div>
    )
  }

  const totalSessions = groupedSessions.reduce(
    (acc, [, sessions]) => acc + sessions.length,
    0
  )

  return (
    <div className="@container">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upcoming Classes</h1>
        <p className="text-muted-foreground">{totalSessions} classes nearby</p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {[...dayKeys].map(dateKey => {
            const sessionsForDay = groupedSessions.find(
              ([key]) => key === dateKey
            )?.[1]
            const count = sessionsForDay?.length || 0
            const isActive = activeDay === dateKey

            return (
              <button
                key={dataKey}
                type="button"
                onClick={() => scrollToDay(dateKey)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "hover:bg-accent"
                  }`}
              >
                {formatTableLabel(dateKey)}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {groupedSessions.map(([dateKey, sessions]) => (
        <section
          key={dateKey}
          id={`day-${dateKey}`}
          className="mb-10 scroll-mt-24"
        >
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {formatDayHeader(dateKey)}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
              {sessions.length} {sessions.length === 1 ? "class" : "classes"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 @[480px]:grid-cols-2 @[480px]:gap-6 @[800px]:grid-cols-3">
            {sessions.map(session => (
              <SessionCard 
                key={session._id}
                session={session}
                isBooked={bookedSet.has(session._id)}
                distance={session.distance}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

