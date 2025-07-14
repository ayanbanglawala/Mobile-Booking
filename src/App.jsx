import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Bookings from "./pages/Bookings"
import Cards from "./pages/Cards"
import Platforms from "./pages/Platforms"
import Inventory from "./pages/Inventory"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminInventory from "./pages/admin/AdminInventory"
import Dealers from "./pages/admin/Dealers"
import DealerBatches from "./pages/admin/DealerBatches"
import DealerBatchDetails from "./pages/admin/DealerBatchDetails"
import Users from "./pages/admin/Users"
import UserDetails from "./pages/admin/UserDetails"
import AdminWallet from "./pages/admin/AdminWallet" // Import new AdminWallet component

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <Cards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/platforms"
              element={
                <ProtectedRoute>
                  <Platforms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute adminOnly>
                  <AdminInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dealers"
              element={
                <ProtectedRoute adminOnly>
                  <Dealers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dealer-batches/:dealerId"
              element={
                <ProtectedRoute adminOnly>
                  <DealerBatches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dealer-batch-details/:batchId"
              element={
                <ProtectedRoute adminOnly>
                  <DealerBatchDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/user-details/:userId"
              element={
                <ProtectedRoute adminOnly>
                  <UserDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/wallet" // New route for Admin Wallet
              element={
                <ProtectedRoute adminOnly>
                  <AdminWallet />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
