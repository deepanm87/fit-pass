"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/lib/hooks/useDebounce"

interface ClassSearchProps {
  className?: string
  placeholder?: string
}

export function ClassSearch({
  className,
  placeholder = "Search classes or instructors..."
}: ClassSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 300)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const currentQ = searchParams.get("q") || ""

    if (debouncedQuery === currentQ) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (debouncedQuery) {
      params.set("q", debouncedQuery)
    } else {
      params.delete("q")
    }

    const newUrl = params.toString() ? `${params.toString()}` : ""
    router.push(`/classes${newUrl}`, { scroll: false })
  }, [debouncedQuery, router, searchParams])

  const handleClear = useCallback(() => {
    setQuery("")
  }, [])

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input 
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border bg-background pl-11 pr-11 text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}