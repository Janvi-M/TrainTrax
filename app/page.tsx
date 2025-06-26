"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Train, Shield, User } from "lucide-react"
import AdminPanel from "@/components/admin/AdminPanel"
import { BookingDetails, RouteResult } from "@/lib/types"
import BookingFlow from "@/components/booking/BookingFlow"

const cities = ["Mumbai", "Chennai", "Bangalore", "Delhi", "Hyderabad", "Jaipur", "Shimla", "Ahmedabad"]

const trains = [
  { id: 1, name: "Rajdhani Express", time: "10:00 AM", station: "Sealdah Station" },
  { id: 2, name: "Satabdi Express", time: "05:00 PM", station: "Howrah Station" },
  { id: 3, name: "Humsafar Express", time: "11:00 PM", station: "Kolkata Chitpur Station" },
  { id: 4, name: "Garib-Rath Express", time: "05:00 PM", station: "Sealdah Station" },
  { id: 5, name: "Duronto Express", time: "07:00 AM", station: "Santraganchi Station" },
]

export default function RailwaySystem() {
  const [mode, setMode] = useState<"customer" | "admin" | null>(null)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  const handleAdminLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      })
      if (response.ok) {
        setIsAdminAuthenticated(true)
      } else {
        alert("Invalid password!")
      }
    } catch (error) {
      alert("Login failed!")
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">🚂 Railway Reservation System</CardTitle>
            <CardDescription>Enhanced with Dijkstra's Algorithm & Secure Authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setMode("customer")} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <User className="mr-2 h-4 w-4" />
              Customer Portal
            </Button>
            <Button
              onClick={() => {
                setMode("admin");
                setIsAdminAuthenticated(false);
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "admin" && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-800">
              <Shield className="inline mr-2 h-5 w-5" />
              Admin Authentication
            </CardTitle>
            <CardDescription>Secure login with bcrypt password hashing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAdminLogin} className="flex-1">
                Login
              </Button>
              <Button onClick={() => setMode(null)} variant="outline">
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "admin" && isAdminAuthenticated) {
    return <AdminPanel onBack={() => setMode(null)} />
  }

  // Customer Portal
  return <BookingFlow onBack={() => setMode(null)} />;
}
