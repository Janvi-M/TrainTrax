import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const cities = ["Mumbai", "Chennai", "Bangalore", "Delhi", "Hyderabad", "Jaipur", "Shimla", "Ahmedabad"]

function AdminPanel({ onBack }: { onBack: () => void }) {
  const [graphMatrix, setGraphMatrix] = useState<number[][]>([])
  const [loading, setLoading] = useState(false)

  const loadMatrix = async () => {
    try {
      const response = await fetch("/api/admin/graph")
      const data = await response.json()
      setGraphMatrix(data.matrix)
    } catch (error) {
      alert("Failed to load matrix!")
    }
  }

  const updateMatrix = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix: graphMatrix }),
      })
      if (response.ok) {
        alert("Graph matrix updated successfully!")
      } else {
        alert("Failed to update matrix!")
      }
    } catch (error) {
      alert("Error updating matrix!")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🛡️ Admin Panel</h1>
          <p className="text-gray-600">Secure administration</p>
          <Button onClick={onBack} variant="outline" className="mt-2">
            Back to Home
          </Button>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Railway Network Graph</CardTitle>
              <CardDescription>Modify the adjacency matrix for the railway network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadMatrix}>Load Current Matrix</Button>
              {graphMatrix.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Adjacency Matrix (8x8 - representing distances between cities)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 text-xs"></th>
                          {cities.map((city, i) => (
                            <th key={i} className="border border-gray-300 p-2 text-xs">
                              {city.slice(0, 3)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {graphMatrix.map((row, i) => (
                          <tr key={i}>
                            <td className="border border-gray-300 p-2 text-xs font-medium">{cities[i].slice(0, 3)}</td>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-gray-300 p-1">
                                <Input
                                  type="number"
                                  value={cell}
                                  onChange={(e) => {
                                    const newMatrix = [...graphMatrix]
                                    newMatrix[i][j] = Number.parseInt(e.target.value) || 0
                                    setGraphMatrix(newMatrix)
                                  }}
                                  className="w-16 h-8 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button onClick={updateMatrix} disabled={loading} className="mt-4">
                    {loading ? "Updating..." : "Update Matrix"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel; 