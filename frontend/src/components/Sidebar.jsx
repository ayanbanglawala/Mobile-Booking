"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  const userNavItems = [
    { path: "/", icon: "📊", label: "Dashboard" },
    { path: "/bookings", icon: "📱", label: "Bookings" },
    { path: "/inventory", icon: "📦", label: "Inventory" },
    { path: "/cards", icon: "💳", label: "Cards" },
    { path: "/platforms", icon: "🛒", label: "Platforms" },
  ]

  const adminNavItems = [
    { path: "/admin", icon: "👨‍💼", label: "Admin Dashboard" },
    { path: "/bookings", icon: "📱", label: "All Bookings" },
    { path: "/admin/inventory", icon: "📋", label: "Admin Inventory" },
    { path: "/admin/dealers", icon: "🤝", label: "Dealers" },
    { path: "/admin/users", icon: "👥", label: "Users" },
    { path: "/admin/wallet", icon: "💰", label: "Wallet" }, // New Wallet link
    { path: "/cards", icon: "💳", label: "Cards" },
    { path: "/platforms", icon: "🛒", label: "Platforms" },
  ]

  const navItems = user?.role === "admin" ? adminNavItems : userNavItems

  if (!user) return null

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">MB</div>
          <div className="sidebar-title">Mobile Booking</div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map((item) => (
              <div key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white text-gray-800 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>
    </>
  )
}

export default Sidebar
