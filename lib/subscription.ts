import { sanityFetch } from "@/sanity/lib/live"
import { startOfMonth, endOfMonth } from "date-fns"
import { MONTHLY_BOOKINGS_COUNT_QUERY } from "@/sanity/lib/queries/bookings"
import { auth } from "@clerk/nextjs/server"
import {
  type Tier,
  TIER_HIERARCHY,
  TIER_LIMITS,
  TIER_PRICING
} from "@/lib/constants/subscription"

export type { Tier }

export { TIER_PRICING }

export async function getUserTier(): Promise<Tier | null> {
  try {
    const { has } = await auth()

    if (has({ plan: "champion" })) {
      return "champion"
    }
    if (has({ plan: "performance"})) {
      return "performance"
    }
    if (has({ plan: "basic" })) {
      return "basic"
    }

    return null
  } catch (error) {
    console.error(`Error getting user tier: ${error}`)
    return null
  }
}

export async function getUserTierInfo(): Promise<{
  tier: Tier | null
  userId: string | null
}> {
  try {
    const { userId, has } = await auth()

    let tier: Tier | null = null
    if (has({ plan: "champion" })) {
      tier = "champion"
    } else if (has({ plan: "performance" })) {
      tier = "performance"
    } else if (has({ plan: "basic" })) {
      tier = "basic"
    }

    return { tier, userId }
  } catch {
    return { tier: null, userId: null } 
  }
}

export async function canAccessClassTier(requiredTier: Tier): Promise<boolean> {
  try {
    const { has } = await auth()

    switch (requiredTier) {
      case "basic":
        return (
          has({ plan: "basic" }) ||
          has({ plan: "performance" }) ||
          has({ plan: "champion" })
        )
      case "performance":
        return has({ plan: "performance" }) || has({ plan: "champion" })
      case "champion":
        return has({ plan: "champion" })
      default:
        return false
    }
  } catch {
    return false
  }
}

export function canAccessClass(userTier: Tier, activityTier: Tier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[activityTier]
}

export function getMonthlyLimit(tier: Tier): number {
  return TIER_LIMITS[tier]
}

export function isUnlimited(tier: Tier): boolean {
  return TIER_LIMITS[tier] === Infinity
}

export async function getRemainingBookings(userId: string): Promise<number> {
  const tier = await getUserTier()

  if (!tier) {
    return 0
  }

  if (isUnlimited(tier)) {
    return Infinity
  }

  const monthStart = startOfMonth(new Date()).toISOString()
  const monthEnd = endOfMonth(new Date()).toISOString()

  const { data: usedCount } = await sanityFetch({
    query: MONTHLY_BOOKINGS_COUNT_QUERY,
    params: {
      userId,
      monthStart,
      monthEnd
    }
  })

  const limit = getMonthlyLimit(tier)

  return Math.max(0, limit - (usedCount as number))
}

export async function getUsageStats(userId: string): Promise<{
  used: number
  limit: number
  remaining: number
  tier: Tier | null
}> {
  const tier = await getUserTier()

  if (!tier) {
    return { used: 0, limit: 0, remaining: 0, tier: null }
  }

  const monthStart = startOfMonth(new Date()).toISOString()
  const monthEnd = endOfMonth(new Date()).toISOString()

  const { data: used } = await sanityFetch({
    query: MONTHLY_BOOKINGS_COUNT_QUERY,
    params: {
      userId,
      monthStart,
      monthEnd
    }
  })

  const limit = getMonthlyLimit(tier)
  const remaining = isUnlimited(tier)
    ? Infinity
    : Math.max(0, limit - (used as number))

  return { used: used as number, limit, remaining, tier }
}