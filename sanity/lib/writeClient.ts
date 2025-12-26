import { createClient } from "next-sanity"

import { apiVersion, dataset, projectId } from "../env"

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

if (!writeClient.config().token) {
  console.warn("Sanity write client requires SANITY_API_TOKEN environment variable")
}