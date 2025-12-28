"use client"

import { useState } from "react"
import { startOfToday } from "date-fns"
import { BookingsCalendar } from "./BookingsCalendar"
import { DayBookings } from "./DayBookings"
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types"

interface BookingsCalendarViewProps {
  bookings: USER_BOOKINGS_QUERYResult
}

export function BookingsCalendarView({ bookings }: BookingsCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(320px, 400px)_1fr]">
      <div>
        <BookingsCalendar 
          bookings={bookings}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      <div>
        <DayBookings 
          bookings={bookings}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  )
}