"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Wallet, Bell, Search, Menu, X } from 'lucide-react'
import axios from "axios"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [walletBalance, setWalletBalance] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchWalletBalance()
      const interval = setInterval(fetchWalletBalance, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/wallet")
      setWalletBalance(response.data.balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center ml-2 lg:ml-0 min-w-0">
              <Link to="/" className="flex items-center min-w-0">
                <div className="bg-blue-600 text-white rounded-lg p-2 flex-shrink-0">
                  <span className="font-bold text-sm sm:text-lg">MB</span>
                </div>
                <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block truncate">
                  Mobile Booking
                </span>
              </Link>
            </div>
          </div>


          {/* Right side - Wallet, Notifications, User */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* Wallet Balance (Admin only) */}
            {user.role === "admin" && (
              <Link
                to="/admin/wallet"
                className="hidden sm:flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
              >
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-semibold truncate">₹{walletBalance.toLocaleString()}</span>
              </Link>
            )}


            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex-shrink-0"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            

            {/* Admin Wallet Balance (Mobile) */}
            {user.role === "admin" && (
              <Link
                to="/admin/wallet"
                className="flex items-center space-x-3 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wallet className="h-5 w-5" />
                <span className="font-semibold">₹{walletBalance.toLocaleString()}</span>
              </Link>
            )}

            {/* Navigation Links */}
            <div className="space-y-1 pt-2">
              {user.role === "admin" ? (
                <>
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/admin"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/bookings"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/bookings"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Bookings
                  </Link>
                  <Link
                    to="/admin/inventory"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/admin/inventory"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Inventory
                  </Link>
                  <Link
                    to="/admin/dealers"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/admin/dealers"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dealers
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/admin/users"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/wallet"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/admin/wallet"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wallet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/bookings"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/bookings"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/inventory"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/inventory"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inventory
                  </Link>
                </>
              )}
              <Link
                to="/cards"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === "/cards"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Cards
              </Link>
              <Link
                to="/platforms"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === "/platforms"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Platforms
              </Link>
            </div>

            {/* Mobile User Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3 py-2">
                <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.username}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
