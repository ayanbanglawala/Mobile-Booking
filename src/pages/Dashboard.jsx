"use client"

import { useState, useEffect } from "react"
import {
  Smartphone,
  Package,
  UserCheck,
  Handshake,
  DollarSign,
  Clock,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Users,
} from "lucide-react"
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
      const response = await axios.get("https://mobile-booking-backend.vercel.app/api/inventory/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const userStats = [
    {
      label: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: Smartphone,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Mobiles Delivered",
      value: stats.mobilesDelivered || 0,
      icon: Package,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Given to Admin",
      value: stats.mobilesGivenToAdmin || 0,
      icon: UserCheck,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Assigned to Dealers",
      value: stats.mobilesAssignedToDealers || 0,
      icon: Handshake,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Payment Pending",
      value: stats.paymentPending || 0,
      icon: DollarSign,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ]

  const adminStats = [
    {
      label: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: Smartphone,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Mobiles Delivered",
      value: stats.mobilesDelivered || 0,
      icon: Package,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "With Admin",
      value: stats.mobilesWithAdmin || 0,
      icon: UserCheck,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Assigned to Dealers",
      value: stats.mobilesAssignedToDealers || 0,
      icon: Handshake,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Dealer Payment Pending",
      value: stats.dealerPaymentPending || 0,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "User Payment Pending",
      value: stats.userPaymentPending || 0,
      icon: DollarSign,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ]

  const displayStats = user.role === "admin" ? adminStats : userStats

  const userQuickActions = [
    {
      title: "New Booking",
      description: "Create a new mobile booking",
      href: "/bookings",
      icon: Smartphone,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "View Inventory",
      description: "Check your mobile inventory",
      href: "/inventory",
      icon: Package,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Manage Cards",
      description: "Add or edit payment cards",
      href: "/cards",
      icon: CreditCard,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Manage Platforms",
      description: "Configure e-commerce platforms",
      href: "/platforms",
      icon: ShoppingCart,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  const adminQuickActions = [
    {
      title: "Admin Inventory",
      description: "Manage admin inventory",
      href: "/admin/inventory",
      icon: BarChart3,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Manage Dealers",
      description: "Add and manage dealers",
      href: "/admin/dealers",
      icon: Handshake,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Manage Users",
      description: "View and manage users",
      href: "/admin/users",
      icon: Users,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Wallet Management",
      description: "Track payments and wallet",
      href: "/admin/wallet",
      icon: DollarSign,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  const quickActions = user.role === "admin" ? adminQuickActions : userQuickActions

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.username}! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your mobile booking system today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <a
                  key={action.title}
                  href={action.href}
                  className={`${action.color} text-white rounded-lg p-4 transition-colors group`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <h3 className="font-medium">{action.title}</h3>
                  </div>
                  <p className="text-sm text-white/80 group-hover:text-white transition-colors">{action.description}</p>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
