"use client"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return null
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">Mobile Booking System</div>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive("/") ? "active" : ""}>
              Dashboard
            </Link>
          </li>
          {user.role === "user" && (
            <>
              <li>
                <Link to="/bookings" className={isActive("/bookings") ? "active" : ""}>
                  Bookings
                </Link>
              </li>
              <li>
                <Link to="/inventory" className={isActive("/inventory") ? "active" : ""}>
                  Inventory
                </Link>
              </li>
              <li>
                <Link to="/cards" className={isActive("/cards") ? "active" : ""}>
                  Cards
                </Link>
              </li>
              <li>
                <Link to="/platforms" className={isActive("/platforms") ? "active" : ""}>
                  Platforms
                </Link>
              </li>
            </>
          )}
          {user.role === "admin" && (
            <>
              <li>
                <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
                  Admin
                </Link>
              </li>
              <li>
                <Link to="/admin/inventory" className={isActive("/admin/inventory") ? "active" : ""}>
                  Inventory
                </Link>
              </li>
              <li>
                <Link to="/admin/dealers" className={isActive("/admin/dealers") ? "active" : ""}>
                  Dealers
                </Link>
              </li>
            </>
          )}
          <li>
            <span style={{ marginRight: "10px" }}>Welcome, {user.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
