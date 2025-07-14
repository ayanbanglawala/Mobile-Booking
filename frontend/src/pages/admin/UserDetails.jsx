"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const UserDetails = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`)
      setUser(response.data.user)
      setBookings(response.data.bookings)
    } catch (error) {
      toast.error("Error fetching user details")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status })
      toast.success("Status updated successfully! ✅")
      fetchUserDetails()
    } catch (error) {
      toast.error("Error updating status")
    }
  }

  const getStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status.replace("_", " ")}</span>
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading user details...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>User not found</h3>
          <Link to="/admin/users" className="btn btn-primary">
            ← Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <Link to="/admin/users" className="btn btn-secondary">
          ← Back to Users
        </Link>
      </div>

      <div className="page-header animate-fade-in">
        <h1 className="page-title">👤 {user.username}</h1>
        <p className="page-subtitle">User details and booking history</p>
      </div>

      {/* User Info Card */}
      <div className="card animate-slide-up" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">User Information</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <strong>Username:</strong> {user.username}
          </div>
          <div>
            <strong>Role:</strong>{" "}
            <span className={`status-badge ${user.role === "admin" ? "status-delivered" : "status-pending"}`}>
              {user.role}
            </span>
          </div>
          <div>
            <strong>Total Bookings:</strong> {bookings.length}
          </div>
          <div>
            <strong>Total Amount:</strong> ₹
            {bookings.reduce((sum, booking) => sum + booking.bookingPrice, 0).toLocaleString()}
          </div>
          <div>
            <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Bookings Card */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">User Bookings ({bookings.length})</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mobile Model</th>
                <th>Booking Price</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>{booking.mobileModel}</td>
                  <td>₹{booking.bookingPrice.toLocaleString()}</td>
                  <td>{booking.platform}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(booking._id, "delivered")}
                          className="btn btn-success"
                          style={{ padding: "6px 10px", fontSize: "11px" }}
                        >
                          ✅ Mark Delivered
                        </button>
                      )}
                      {booking.status === "delivered" && (
                        <button
                          onClick={() => handleStatusChange(booking._id, "given_to_admin")}
                          className="btn btn-warning"
                          style={{ padding: "6px 10px", fontSize: "11px" }}
                        >
                          👨‍💼 Give to Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>This user hasn't made any bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDetails
