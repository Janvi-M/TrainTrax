import { type NextRequest, NextResponse } from "next/server"
import { dijkstra, findAlternativeRoutes, cities, defaultRailwayGraph } from "@/lib/graph"

export async function POST(request: NextRequest) {
  try {
    const { source, destination } = await request.json()
    const sourceIndex = cities.indexOf(source)
    const destinationIndex = cities.indexOf(destination)
    if (sourceIndex === -1 || destinationIndex === -1) {
      return NextResponse.json({ error: "Invalid city names" }, { status: 400 })
    }
    if (sourceIndex === destinationIndex) {
      return NextResponse.json({ error: "Source and destination cannot be the same" }, { status: 400 })
    }
    const routes = findAlternativeRoutes(defaultRailwayGraph, sourceIndex, destinationIndex)
    if (routes.length === 0) {
      return NextResponse.json({ error: "No routes found" }, { status: 404 })
    }
    return NextResponse.json(routes)
  } catch (error) {
    console.error("Route finding error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
