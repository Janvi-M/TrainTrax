import { type NextRequest, NextResponse } from "next/server"

// Default railway network adjacency matrix (8x8)
// Represents distances between cities: Mumbai, Chennai, Bangalore, Delhi, Hyderabad, Jaipur, Shimla, Ahmedabad
let railwayGraph = [
  [0, 1338, 981, 1153, 711, 947, 1425, 524],
  [1338, 0, 346, 2180, 625, 1862, 2458, 1862],
  [981, 346, 0, 2111, 575, 1793, 2389, 1793],
  [1153, 2180, 2111, 0, 1273, 281, 343, 934],
  [711, 625, 575, 1273, 0, 1054, 1630, 1054],
  [947, 1862, 1793, 281, 1054, 0, 624, 655],
  [1425, 2458, 2389, 343, 1630, 624, 0, 1279],
  [524, 1862, 1793, 934, 1054, 655, 1279, 0],
]

export async function GET() {
  return NextResponse.json({ matrix: railwayGraph })
}

export async function POST(request: NextRequest) {
  try {
    const { matrix } = await request.json()

    if (!matrix || !Array.isArray(matrix) || matrix.length !== 8) {
      return NextResponse.json({ error: "Invalid matrix format" }, { status: 400 })
    }

    // Validate matrix dimensions and values
    for (let i = 0; i < 8; i++) {
      if (!Array.isArray(matrix[i]) || matrix[i].length !== 8) {
        return NextResponse.json({ error: "Matrix must be 8x8" }, { status: 400 })
      }
      for (let j = 0; j < 8; j++) {
        if (typeof matrix[i][j] !== "number" || matrix[i][j] < 0) {
          return NextResponse.json({ error: "Matrix values must be non-negative numbers" }, { status: 400 })
        }
      }
    }

    railwayGraph = matrix
    return NextResponse.json({ success: true, message: "Graph updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
