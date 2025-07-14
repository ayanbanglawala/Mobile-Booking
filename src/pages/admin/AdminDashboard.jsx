"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import {
  Smartphone,
  Package,
  Users,
  HandCoins,
  Clock,
  TrendingUp,
  Wallet,
  ArrowRight,
  BarChart3,
  Settings,
} from "lucide-react"

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchWalletBalance()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/inventory/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/wallet")
      setWalletBalance(response.data.balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      setWalletBalance(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statsData = [
    {
      label: "Wallet Balance",
      value: `₹${walletBalance.toLocaleString()}`,
      icon: Wallet,
      color: "bg-green-500",
      link: "/admin/wallet",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: Smartphone,
      color: "bg-blue-500",
    },
    {
      label: "Mobiles Delivered",
      value: stats.mobilesDelivered || 0,
      icon: Package,
      color: "bg-green-500",
    },
    {
      label: "Mobiles with Admin",
      value: stats.mobilesWithAdmin || 0,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Assigned to Dealers",
      value: stats.mobilesAssignedToDealers || 0,
      icon: HandCoins,
      color: "bg-orange-500",
    },
    {
      label: "Dealer Payment Pending",
      value: stats.dealerPaymentPending || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "User Payment Pending",
      value: stats.userPaymentPending || 0,
      icon: TrendingUp,
      color: "bg-red-500",
    },
  ]

  const quickActions = [
    {
      label: "Admin Inventory",
      href: "/admin/inventory",
      icon: Package,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Manage mobile inventory",
    },
    {
      label: "Manage Dealers",
      href: "/admin/dealers",
      icon: HandCoins,
      color: "bg-green-600 hover:bg-green-700",
      description: "View and manage dealers",
    },
    {
      label: "Manage Users",
      href: "/admin/users",
      icon: Users,
      color: "bg-purple-600 hover:bg-purple-700",
      description: "User management system",
    },
    {
      label: "Manage Wallet",
      href: "/admin/wallet",
      icon: Wallet,
      color: "bg-orange-600 hover:bg-orange-700",
      description: "Financial management",
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Overview of your mobile booking system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              const content = (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                  </div>
                  {stat.link && (
                    <div className="mt-4">
                      <div className="text-blue-600 text-sm font-medium flex items-center">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              )

              return stat.link ? (
                <Link key={index} to={stat.link}>
                  {content}
                </Link>
              ) : (
                <div key={index}>{content}</div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    className={`${action.color} text-white rounded-lg p-3 sm:p-4 transition-colors duration-200 group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">{action.label}</h3>
                      <p className="text-xs sm:text-sm opacity-90">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">System Overview</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-gray-900">₹{walletBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-gray-900">{stats.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Payments</span>
                  <span className="font-semibold text-red-600">{stats.userPaymentPending || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">System Settings</h3>
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm text-gray-700">User Management</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  to="/admin/dealers"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm text-gray-700">Dealer Settings</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  to="/admin/wallet"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm text-gray-700">Financial Settings</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
