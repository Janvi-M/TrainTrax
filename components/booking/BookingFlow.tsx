import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Train } from "lucide-react";
import { BookingDetails, RouteResult } from "@/lib/types";
import ReactFlow, { Background, Controls, MiniMap, Edge, Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

const cities = ["Mumbai", "Chennai", "Bangalore", "Delhi", "Hyderabad", "Jaipur", "Shimla", "Ahmedabad"];

// Define trains with source and destination
const trains = [
  {
    id: 1,
    name: "Rajdhani Express",
    source: "Mumbai",
    destination: "Delhi",
    time: "10:00 AM",
    station: "Mumbai Central"
  },
  {
    id: 2,
    name: "Satabdi Express",
    source: "Chennai",
    destination: "Bangalore",
    time: "05:00 PM",
    station: "Chennai Central"
  },
  {
    id: 3,
    name: "Humsafar Express",
    source: "Delhi",
    destination: "Jaipur",
    time: "11:00 PM",
    station: "Delhi Junction"
  },
  {
    id: 4,
    name: "Garib-Rath Express",
    source: "Hyderabad",
    destination: "Bangalore",
    time: "07:00 AM",
    station: "Hyderabad Deccan"
  },
  {
    id: 5,
    name: "Duronto Express",
    source: "Mumbai",
    destination: "Ahmedabad",
    time: "06:00 AM",
    station: "Mumbai Central"
  },
  {
    id: 6,
    name: "Double Decker",
    source: "Jaipur",
    destination: "Delhi",
    time: "09:00 AM",
    station: "Jaipur Junction"
  },
  {
    id: 7,
    name: "Shatabdi Express",
    source: "Delhi",
    destination: "Shimla",
    time: "08:00 AM",
    station: "Delhi Junction"
  },
  {
    id: 8,
    name: "Intercity Express",
    source: "Bangalore",
    destination: "Chennai",
    time: "03:00 PM",
    station: "Bangalore City"
  },
  {
    id: 9,
    name: "Jan Shatabdi",
    source: "Ahmedabad",
    destination: "Mumbai",
    time: "02:00 PM",
    station: "Ahmedabad Junction"
  },
  {
    id: 10,
    name: "Himalayan Queen",
    source: "Delhi",
    destination: "Shimla",
    time: "06:00 AM",
    station: "Delhi Junction"
  },
];

// Circular layout for 8 cities
const RADIUS = 200;
const CENTER_X = 350;
const CENTER_Y = 200;
const cityPositions = cities.map((_, idx, arr) => {
  const angle = (2 * Math.PI * idx) / arr.length;
  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle),
  };
});

function getGraphElements(routes, bestRoute) {
  // Nodes for all cities
  const nodes: Node[] = cities.map((city, idx) => ({
    id: city,
    data: { label: city },
    position: cityPositions[idx],
    style: {
      background: bestRoute && bestRoute.path.includes(city)
        ? '#d1fae5'
        : '#f3f4f6',
      border: bestRoute && bestRoute.path[0] === city
        ? '2px solid #2563eb'
        : bestRoute && bestRoute.path[bestRoute.path.length - 1] === city
        ? '2px solid #dc2626'
        : '1px solid #d1d5db',
      borderRadius: 8,
      fontWeight: 'bold',
      color: '#111827',
      fontSize: 16,
      width: 100,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  // Edges for all connections
  const edges: Edge[] = [];
  // Add all connections (undirected)
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      if (i !== j) {
        edges.push({
          id: `${cities[i]}-${cities[j]}`,
          source: cities[i],
          target: cities[j],
          style: { stroke: '#d1d5db', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5db' },
        });
      }
    }
  }

  // Highlight best route
  if (bestRoute) {
    for (let i = 0; i < bestRoute.path.length - 1; i++) {
      const from = bestRoute.path[i];
      const to = bestRoute.path[i + 1];
      edges.push({
        id: `best-${from}-${to}`,
        source: from,
        target: to,
        animated: true,
        style: { stroke: '#22c55e', strokeWidth: 4 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
        label: 'Best',
        labelStyle: { fill: '#22c55e', fontWeight: 700 },
      });
    }
  }

  // Highlight alternative routes
  routes.filter(r => !r.best).forEach((route, idx) => {
    for (let i = 0; i < route.path.length - 1; i++) {
      const from = route.path[i];
      const to = route.path[i + 1];
      edges.push({
        id: `alt-${idx}-${from}-${to}`,
        source: from,
        target: to,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: '4 2' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        label: 'Alt',
        labelStyle: { fill: '#3b82f6', fontWeight: 600 },
      });
    }
  });

  return { nodes, edges };
}

type Props = {
  onBack: () => void;
};

export default function BookingFlow({ onBack }: Props) {
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<Partial<BookingDetails>>({});
  const [availableRoutes, setAvailableRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const findRoutes = async () => {
    if (!bookingDetails.source || !bookingDetails.destination) return;
    try {
      const response = await fetch("/api/routes/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: bookingDetails.source,
          destination: bookingDetails.destination,
        }),
      });
      const routes = await response.json();
      setAvailableRoutes(routes);
      setBookingStep(3);
    } catch (error) {
      alert("Failed to find routes!");
    }
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setBookingStep(6);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚂 Book Your Journey</h1>
          <p className="text-gray-600">Powered by Dijkstra's Algorithm for Optimal Routes</p>
          <Button onClick={onBack} variant="outline" className="mt-2">
            Back to Home
          </Button>
        </div>
        {bookingStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={bookingDetails.name || ""}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setBookingDetails({ ...bookingDetails, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={bookingDetails.age || ""}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, age: Number.parseInt(e.target.value) })}
                  placeholder="Enter your age"
                />
              </div>
              <Button
                onClick={() => setBookingStep(2)}
                className="w-full"
                disabled={!bookingDetails.name || !bookingDetails.gender || !bookingDetails.age}
              >
                Next
              </Button>
            </CardContent>
          </Card>
        )}
        {bookingStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Journey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="source">Source City</Label>
                <Select onValueChange={(value) => setBookingDetails({ ...bookingDetails, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="destination">Destination City</Label>
                <Select onValueChange={(value) => setBookingDetails({ ...bookingDetails, destination: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={findRoutes}
                className="w-full"
                disabled={
                  !bookingDetails.source ||
                  !bookingDetails.destination ||
                  bookingDetails.source === bookingDetails.destination
                }
              >
                Find Routes
              </Button>
            </CardContent>
          </Card>
        )}
        {bookingStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Graph Visualization */}
              {availableRoutes.length > 0 && (
                <div style={{ height: 400, background: '#fff', borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px #e5e7eb' }}>
                  <ReactFlow
                    nodes={getGraphElements(availableRoutes, availableRoutes.find(r => r.best)).nodes}
                    edges={getGraphElements(availableRoutes, availableRoutes.find(r => r.best)).edges}
                    fitView
                    panOnDrag
                    zoomOnScroll
                    minZoom={0.5}
                    maxZoom={2}
                  >
                    <MiniMap nodeColor={n => n.style?.background || '#f3f4f6'} />
                    <Controls />
                    <Background color="#f3f4f6" gap={16} />
                  </ReactFlow>
                </div>
              )}
              {availableRoutes.length === 0 ? (
                <div>No routes found. Please try different cities.</div>
              ) : (
                availableRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 mb-2 cursor-pointer ${selectedRoute === route ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{route.path.join(" → ")}</span>
                      {route.best && (
                        <Badge className="ml-2" variant="default">Best Route</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.time} hrs</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ₹{route.price}</span>
                      <span className="flex items-center gap-1"><Train className="h-4 w-4" /> {route.distance} km</span>
                    </div>
                  </div>
                ))
              )}
              <Button
                onClick={() => setBookingStep(4)}
                className="w-full"
                disabled={!selectedRoute}
              >
                Next
              </Button>
            </CardContent>
          </Card>
        )}
        {bookingStep === 4 && selectedRoute && (
          <Card>
            <CardHeader>
              <CardTitle>Select Train</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const src = selectedRoute.path[0];
                const dest = selectedRoute.path[selectedRoute.path.length - 1];
                let availableTrains = trains.filter(
                  (train) => train.source === src && train.destination === dest
                );
                if (availableTrains.length === 0) {
                  availableTrains = [
                    {
                      id: 999,
                      name: "Generic Express",
                      source: src,
                      destination: dest,
                      time: "09:00 AM",
                      station: `${src} Main Station`,
                    },
                  ];
                }
                return availableTrains.map((train) => (
                  <div
                    key={train.id}
                    className={`border rounded-lg p-4 mb-2 cursor-pointer ${bookingDetails.selectedTrain?.id === train.id ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                    onClick={() => setBookingDetails({ ...bookingDetails, selectedTrain: train, route: selectedRoute })}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{train.name}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {train.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {train.station}</span>
                    </div>
                  </div>
                ));
              })()}
              <Button
                onClick={() => setBookingStep(5)}
                className="w-full"
                disabled={!bookingDetails.selectedTrain}
              >
                Next
              </Button>
            </CardContent>
          </Card>
        )}
        {bookingStep === 5 && selectedRoute && bookingDetails.selectedTrain && (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge>Route</Badge>
                  <span>{selectedRoute.path.join(" → ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Train</Badge>
                  <span>{bookingDetails.selectedTrain.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Amount</Badge>
                  <span>₹{selectedRoute.price}</span>
                </div>
              </div>
              <Button
                onClick={processPayment}
                className="w-full"
                disabled={paymentProcessing}
              >
                {paymentProcessing ? "Processing..." : "Pay & Book"}
              </Button>
            </CardContent>
          </Card>
        )}
        {bookingStep === 6 && selectedRoute && bookingDetails.selectedTrain && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Confirmed!</CardTitle>
              <CardDescription>Your ticket has been booked successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Passenger:</strong> {bookingDetails.name}
                </div>
                <div>
                  <strong>Gender:</strong> {bookingDetails.gender}
                </div>
                <div>
                  <strong>Age:</strong> {bookingDetails.age}
                </div>
                <div>
                  <strong>Train:</strong> {bookingDetails.selectedTrain.name}
                </div>
                <div>
                  <strong>Route:</strong> {selectedRoute.path.join(" → ")}
                </div>
                <div>
                  <strong>Departure:</strong> {bookingDetails.selectedTrain.time}
                </div>
                <div>
                  <strong>Station:</strong> {bookingDetails.selectedTrain.station}
                </div>
                <div>
                  <strong>Amount Paid:</strong> ₹{selectedRoute.price}
                </div>
              </div>
              <Button
                onClick={() => {
                  setBookingStep(1);
                  setBookingDetails({});
                  setSelectedRoute(null);
                  setAvailableRoutes([]);
                }}
                className="w-full mt-4"
              >
                Book Another Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 