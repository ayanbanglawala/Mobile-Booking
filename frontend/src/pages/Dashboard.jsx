"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  const userStats = [
    { label: "Total Bookings", value: stats.totalBookings || 0, icon: "📱" },
    { label: "Mobiles Delivered", value: stats.mobilesDelivered || 0, icon: "📦" },
    { label: "Given to Admin", value: stats.mobilesGivenToAdmin || 0, icon: "👨‍💼" },
    { label: "Assigned to Dealers", value: stats.mobilesAssignedToDealers || 0, icon: "🤝" },
    { label: "Payment Pending", value: stats.paymentPending || 0, icon: "💰" },
  ]

  const adminStats = [
    { label: "Total Bookings", value: stats.totalBookings || 0, icon: "📱" },
    { label: "Mobiles Delivered", value: stats.mobilesDelivered || 0, icon: "📦" },
    { label: "With Admin", value: stats.mobilesWithAdmin || 0, icon: "👨‍💼" },
    { label: "Assigned to Dealers", value: stats.mobilesAssignedToDealers || 0, icon: "🤝" },
    { label: "Dealer Payment Pending", value: stats.dealerPaymentPending || 0, icon: "⏳" },
    { label: "User Payment Pending", value: stats.userPaymentPending || 0, icon: "💰" },
  ]

  const displayStats = user.role === "admin" ? adminStats : userStats

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Welcome back, {user.username}! 👋</h1>
        <p className="page-subtitle">Here's what's happening with your mobile booking system today.</p>
      </div>

      <div className="dashboard-grid">
        {displayStats.map((stat, index) => (
          <div key={stat.label} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="stat-number">{stat.value}</div>
            <div className="stat-label">
              <span style={{ marginRight: "8px" }}>{stat.icon}</span>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          {user.role === "user" ? (
            <>
              <a href="/bookings" className="btn btn-primary">
                📱 New Booking
              </a>
              <a href="/inventory" className="btn btn-secondary">
                📦 View Inventory
              </a>
              <a href="/cards" className="btn btn-success">
                💳 Manage Cards
              </a>
              <a href="/platforms" className="btn btn-warning">
                🛒 Manage Platforms
              </a>
            </>
          ) : (
            <>
              <a href="/admin/inventory" className="btn btn-primary">
                📋 Admin Inventory
              </a>
              <a href="/admin/dealers" className="btn btn-secondary">
                🤝 Manage Dealers
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
