"use client"

import { useAuth } from "../contexts/AuthContext"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

const Layout = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
