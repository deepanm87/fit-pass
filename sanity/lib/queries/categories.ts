import { defineQuery } from "next-sanity"

export const CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(name asc) {
  _id,
  name,
  slug,
  description,
  icon
}`)