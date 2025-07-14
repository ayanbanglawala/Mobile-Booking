"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LayoutDashboard, Smartphone, Package, CreditCard, Store, Users, Handshake, Wallet, BarChart3 } from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) return null

  const userNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Bookings", href: "/bookings", icon: Smartphone },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Cards", href: "/cards", icon: CreditCard },
    { name: "Platforms", href: "/platforms", icon: Store },
  ]

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
    { name: "All Bookings", href: "/bookings", icon: Smartphone },
    { name: "Admin Inventory", href: "/admin/inventory", icon: Package },
    { name: "Dealers", href: "/admin/dealers", icon: Handshake },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Wallet", href: "/admin/wallet", icon: Wallet },
    { name: "Cards", href: "/cards", icon: CreditCard },
    { name: "Platforms", href: "/platforms", icon: Store },
  ]

  const navigation = user.role === "admin" ? adminNavigation : userNavigation

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex flex-col flex-grow pt-5 pb-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
