"use client"

import { useAuth } from "../contexts/AuthContext"
import Sidebar from "./Sidebar"

const Layout = ({ children }) => {
  const { user } = useAuth()

  if (!user) {
    return children
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

export default Layout
