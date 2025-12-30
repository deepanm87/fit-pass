"use client"

import { useClient } from "@sanity/sdk-react"

const API_VERSION = "2024-11-12"

export function useSanityClient() {
  return useClient({ apiVersion: API_VERSION})
}