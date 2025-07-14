"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom" // Import Link for navigation

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [walletBalance, setWalletBalance] = useState(0) // New state for wallet balance
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchWalletBalance() // Fetch wallet balance on mount
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

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wallet")
      setWalletBalance(response.data.balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      setWalletBalance(0) // Default to 0 if error
    }
  }

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>
  }

  return (
    <div className="container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">👨‍💼 Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your mobile booking system.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card animate-slide-up" style={{ animationDelay: `0s` }}>
          <div className="stat-number">₹{walletBalance.toLocaleString()}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>💰</span>
            Wallet Balance
          </div>
          <Link to="/admin/wallet" className="btn btn-secondary mt-4 w-full">
            View Wallet
          </Link>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.1s` }}>
          <div className="stat-number">{stats.totalBookings || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>📱</span>
            Total Bookings
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.2s` }}>
          <div className="stat-number">{stats.mobilesDelivered || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>📦</span>
            Mobiles Delivered
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.3s` }}>
          <div className="stat-number">{stats.mobilesWithAdmin || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>👨‍💼</span>
            Mobiles with Admin
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.4s` }}>
          <div className="stat-number">{stats.mobilesAssignedToDealers || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>🤝</span>
            Assigned to Dealers
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.5s` }}>
          <div className="stat-number">{stats.dealerPaymentPending || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>⏳</span>
            Dealer Payment Pending
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: `0.6s` }}>
          <div className="stat-number">{stats.userPaymentPending || 0}</div>
          <div className="stat-label">
            <span style={{ marginRight: "8px" }}>💰</span>
            User Payment Pending
          </div>
        </div>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Link to="/admin/inventory" className="btn btn-primary">
            📋 Admin Inventory
          </Link>
          <Link to="/admin/dealers" className="btn btn-secondary">
            🤝 Manage Dealers
          </Link>
          <Link to="/admin/users" className="btn btn-success">
            👥 Manage Users
          </Link>
          <Link to="/admin/wallet" className="btn btn-warning">
            💰 Manage Wallet
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
