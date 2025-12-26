import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { sanityFetch } from "@/sanity/lib/live"
import {
  FILTERED_SESSIONS_QUERY,
  SEARCH_SESSIONS_QUERY
} from "@/sanity/lib/queries/sessions"
import { CATEGORIES_QUERY } from "@/sanity/lib/queries/categories"
import { VENUE_NAME_BY_ID_QUERY } from "@/sanity/lib/queries/venues"
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries"
import { ClassesContent } from "@/components/app/classes/ClassesContent"
import { ClassesMapSidebar } from "@/components/app/maps/ClassesMapSidebar"
import { ClassSearch } from "@/components/app/classes/ClassSearch"
import { ClassesFilters } from "@/components/app/classes/ClassesFilters"
import { getUserPreferences } from "@/lib/actions/profile"
import { filterSessionsByDistance, getBoundingBox } from "@/lib/utils/distance"
import Link from "next/link"
import { MapPinIcon, SearchIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  searchParams: Promise<{
    q?: string
    venue?: string
    category?: string
    tier?: string
  }>
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const {
    q: searchQuery,
    venue: venueId,
    category: categoryParam,
    tier: tierParam
  } = await searchParams
  const { userId } = await auth()

  const categoryIds = categoryParam
    ? categoryParam.split(",").filter(Boolean)
    : []
  const tierLevels = tierParam ? tierParam.split(",").filter(Boolean) : []

  const userPreferences = await getUserPreferences()

  if (!userPreferences?.location || !userPreferences?.searchRadius) {
    redirect("/onboarding")
  }

  const { location, searchRadius } = userPreferences

  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
    location.lat,
    location.lng,
    searchRadius
  )

  const sessionsQuery = searchQuery
    ? sanityFetch({
      query: SEARCH_SESSIONS_QUERY,
      params: { searchTerm: searchQuery, minLat, maxLat, minLng, maxLng }
    })
    : sanityFetch({
      query: FILTERED_SESSIONS_QUERY,
      params: {
        venueId: venueId || "",
        categoryIds,
        tierLevels,
        minLat,
        maxLat,
        minLng,
        maxLng
      }
    })

    const venueNameQuery = venueId
      ? sanityFetch({
        query: VENUE_NAME_BY_ID_QUERY,
        params: { venueId }
        })
      : Promise.resolve({ data: null })

    const [
      sessionsResult,
      categoriesResult,
      bookedSessionsResult,
      venueNameResult
    ] = await Promise.all([
      sessionsQuery,
      sanityFetch({ query: CATEGORIES_QUERY }),
      userId
        ? sanityFetch({
          query: USER_BOOKED_SESSION_IDS_QUERY,
          params: { clerkId: userId }
          })
        : Promise.resolve({ data: [] }),
      venueNameQuery
    ])

    const allSessions = sessionsResult.data
    const categories = categoriesResult.data
    const venueName = venueNameResult.data?.name || null
    const bookedIds: (string | null)[] = bookedSessionsResult.data || []
    const filteredBookedIds = bookedIds.filter((id): id is string => id !== null)
    const bookedSessionIds = new Set(filteredBookedIds)

    const activeFilterCount = 
      (venueId ? 1 : 0) + categoryIds.length + tierLevels.length

    const sessionsForFilter = allSessions
      .filter(s => s.startTime !== null)
      .map(s => ({
        ...s,
        startTime: s.startTime as string
      }))

    const sessionsWithDistance = filterSessionsByDistance(
      sessionsForFilter,
      location.lat,
      location.lng,
      searchRadius
    )

    type SessionWithDistance = (typeof sessionsWithDistance)[number]
    const groupedByDay = new Map<string, SessionWithDistance[]>()
    for (const session of sessionsWithDistance) {
      const dateKey = format(new Date(session.startTime), "yyyy-MM-dd")
      const existing = groupedByDay.get(dateKey) || []
      groupedByDay.set(dateKey, [...existing, session])
    }

    const groupedArray = Array.from(groupedByDay.entries())

    const venuesForMap = sessionsWithDistance
      .filter(s => s.venue !== null)
      .map(s => s.venue)
      .filter((v): v is NonNullable<typeof v> => v !== null)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Suspense
                fallback={
                  <div className="flex h-11 w-full items-center gap-2 rounded-full border bg-background px-4 sm:w-80 lg:w-96">
                    <SearchIcon className="size-4 text-muted-foreground" />
                    Loading search...
                  </div>
                }
              >
                <ClassSearch className="w-full sm:w-80 lg:w-96" />
              </Suspense>

              <div className="lg:hidden">
                <Suspense fallback={null}>
                  <ClassesFilters 
                    categories={categories}
                    activeFilters={{
                      venueId: venueId || null,
                      venueName,
                      categoryIds,
                      tierLevels
                    }}
                    mobileOnly
                  />
                </Suspense>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 lg:max-w-md">
              <MapPinIcon className="size-4 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                <span className="text-muted-foreground">
                  Within {searchRadius} km of
                </span>{" "}
                <span className="text-primary">{location.address}</span>
              </p>
              <Link
                href="/profile"
                className="shrink-0 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Change
              </Link>
            </div>
          </div>

          {searchQuery && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <SearchIcon className="size-3" />
                Results for &quot;{searchQuery}&quot;
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sessionsWithDistance.length}{" "}
                {sessionsWithDistance.length === 1 ? "class" : "classes"} found
              </span>
              <Link
                href="/classes"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </Link>
            </div>
          )}

          {!searchQuery && activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                {activeFilterCount}{""}
                {activeFilterCount === 1 ? "filter" : "filters"} active
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sessionsWithDistance.length}{" "}
                {sessionsWithDistance.length === 1 ? "class" : "classes"} found
              </span>
              <Link
                href="/classes"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <ClassesFilters 
            categories={categories}
            activeFilters={{
              venueId: venueId || null,
              venueName,
              categoryIds,
              tierLevels
            }}
          />

          <div className="min-w-0 flex-1">
            <ClassesContent 
              groupedSessions={groupedArray}
              bookedSessionIds={Array.from(bookedSessionIds)}
            />
          </div>

          <aside className="hidden w-[400px] shrink-0 xl:block">
            <Card className="sticky top-20 h-[calc(100vh-8rem)] overflow-hidden p-0">
              <ClassesMapSidebar 
                venues={venuesForMap}
                userLocation={{ lat: location.lat, lng: location.lng}}
              />
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}