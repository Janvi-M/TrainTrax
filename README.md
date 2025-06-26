# 🚄 TrainTrax

A modern, full-stack **Railway Reservation System** built with **Next.js**, **React**, and **TypeScript**. This project showcases a modular architecture with **Dijkstra's algorithm** for optimal route finding, secure admin authentication, and an interactive graph-based railway network.

---

## 🌟 Features

- 🚉 **Book train journeys** between major Indian cities
- 🛡️ **Secure Admin Portal** for network management
- 📍 **Optimal Route Calculation** using Dijkstra's algorithm
- 🔁 **Alternative Routes** for flexibility and comparison
- 🧠 **Dynamic Train Filtering** based on selected routes
- 🚨 **Fallback Train** ensures booking even when no direct train is available
- 🌐 **Interactive Network Visualization** using `react-flow-renderer`
- ⚙️ **Modular Codebase** with clean separation of logic and UI components

---

## 🗂️ Project Structure

```
app/
  api/
    admin/
      login/         # Admin login API (hardcoded password)
      graph/         # Get/Update railway graph adjacency matrix
    routes/
      find/          # Dijkstra + alternative route API
  components/
    admin/           # Admin dashboard for graph editing
    booking/         # Booking UI for customers
    ui/              # Shared UI components (Button, Card, etc.)
  lib/
    graph.ts         # Dijkstra algorithm, city list, and utilities
    types.ts         # Shared TypeScript types
public/              # Static assets
README.md            # Project overview (this file)
```

---

## 🧑‍💻 Codebase Overview

### 🖥️ Frontend (React / Next.js)

- `app/page.tsx`: Entry point with navigation to **Customer** and **Admin** portals.
- `components/booking/BookingFlow.tsx`: Handles user input, route fetching, train selection, and booking confirmation.
- `components/admin/AdminPanel.tsx`: Enables admin to edit the railway graph.
- `components/ui/`: Contains reusable UI components for consistent styling.

### 🛠️ Backend (API Routes)

- `api/routes/find/route.ts`: Calculates shortest and alternative paths using Dijkstra's algorithm.
- `api/admin/login/route.ts`: Handles admin authentication (uses hardcoded password `admin123` for demo).
- `api/admin/graph/route.ts`: Allows admin to view and update the network graph.

### 🧠 Core Logic (`lib/graph.ts`)

- `cities`: List of supported cities.
- `defaultRailwayGraph`: Initial adjacency matrix representing city-to-city distances.
- `dijkstra()`: Computes the shortest path.
- `findAlternativeRoutes()`: Generates up to two alternative paths by excluding key edges from the best route.

### 📝 TypeScript Types (`lib/types.ts`)

- `RouteResult`: Describes a train route (path, distance, time, cost, type).
- `BookingDetails`: Captures booking data (user info, train, route).

---

## 🔁 Booking Flow (How It Works)

1. **User inputs** personal details and selects source & destination cities.
2. **API returns** best route + up to two alternatives using Dijkstra's algorithm.
3. **Frontend displays** the routes both as a list and as an interactive graph.
4. **User selects a train**, filtered by the chosen route (with fallback if needed).
5. **Payment is simulated**, and a confirmation is displayed.

---

## 🔐 Admin Panel

1. **Login** using password: `admin123`.
2. **Visualize and edit** the adjacency matrix (distance graph between cities).
3. **Changes reflect** across all route-finding logic.

---

## 🚀 Getting Started

### 📦 Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### 🏃‍♂️ Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Technical Highlights

| Feature                   | Details                                                                 |
|-------------------------- |-------------------------------------------------------------------------|
| 🧮 Dijkstra's Algorithm   | Modular and reusable implementation in `lib/graph.ts`                   |
| 🧭 Alternative Routes     | Up to two fallback routes using edge removal                            |
| 🌐 Interactive Visualization | `react-flow-renderer` used to show the full railway network           |
| 🚊 Train Filtering        | Only trains available for selected routes are shown                     |
| 🚨 Fallback Booking       | A backup train ensures no route is unbookable                           |
| 🧱 Modular Design         | Clean separation between logic, UI, and API                             |
| 🔒 Authentication         | Basic demo login for admin panel (expandable to secure auth)            |




