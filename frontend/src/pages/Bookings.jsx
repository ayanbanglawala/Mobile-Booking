"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [cards, setCards] = useState([])
  const [dealers, setDealers] = useState([]) // New state for dealers
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const { user } = useAuth()

  // State for "Mark Payment Done" modal
  const [showUserPaymentModal, setShowUserPaymentModal] = useState(false)
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null)
  const [userPaymentAmount, setUserPaymentAmount] = useState("")

  const [formData, setFormData] = useState({
    bookingDate: "",
    mobileModel: "",
    bookingPrice: "",
    sellingPrice: "",
    platform: "",
    card: "",
    notes: "",
    // Admin-only fields for editing
    bookingAccount: "",
    dealer: "",
    bookingId: "",
    status: "",
    assignedToDealerId: "",
    dealerAmount: "",
  })

  useEffect(() => {
    fetchBookings()
    fetchPlatforms()
    fetchCards()
    if (user?.role === "admin") {
      fetchDealers() // Fetch dealers only if admin
    }
  }, [user]) // Re-run if user role changes

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/bookings")
      setBookings(response.data)
    } catch (error) {
      toast.error("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/platforms")
      setPlatforms(response.data)
    } catch (error) {
      console.error("Error fetching platforms:", error)
    }
  }

  const fetchCards = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cards")
      setCards(response.data)
    } catch (error) {
      console.error("Error fetching cards:", error)
    }
  }

  const fetchDealers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dealers")
      setDealers(response.data)
    } catch (error) {
      console.error("Error fetching dealers:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBooking) {
        // For admin, send only editable fields (as defined in backend PUT route)
        const dataToSend =
          user.role === "admin"
            ? {
                sellingPrice: formData.sellingPrice,
                notes: formData.notes,
                status: formData.status,
                bookingAccount: formData.bookingAccount,
                dealer: formData.dealer,
                bookingId: formData.bookingId,
                assignedToDealerId: formData.assignedToDealerId || null, // Ensure null if empty
                dealerAmount: formData.dealerAmount,
              }
            : formData // For user, send all form data

        await axios.put(`http://localhost:5000/api/bookings/${editingBooking._id}`, dataToSend)
        toast.success("Booking updated successfully! ✅")
      } else {
        // For new booking, always send all user-editable fields.
        // If admin is creating, it will be associated with admin's userId.
        await axios.post("http://localhost:5000/api/bookings", formData)
        toast.success("Booking created successfully! 🎉")
      }

      setShowModal(false)
      setEditingBooking(null)
      resetForm()
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving booking")
    }
  }

  const handleEdit = (booking) => {
    setEditingBooking(booking)
    setFormData({
      bookingDate: booking.bookingDate.split("T")[0],
      mobileModel: booking.mobileModel,
      bookingPrice: booking.bookingPrice,
      sellingPrice: booking.sellingPrice || "",
      platform: booking.platform,
      card: booking.card,
      notes: booking.notes || "",
      // Admin-only fields, pre-fill if they exist
      bookingAccount: booking.bookingAccount || "",
      dealer: booking.dealer || "",
      bookingId: booking.bookingId || "",
      status: booking.status,
      assignedToDealerId: booking.assignedToDealerId?._id || "",
      dealerAmount: booking.dealerAmount || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`)
        toast.success("Booking deleted successfully! 🗑️")
        fetchBookings()
      } catch (error) {
        toast.error("Error deleting booking")
      }
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      // This PATCH route is accessible by both user (for their own bookings) and admin (for any booking)
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status })
      toast.success("Status updated successfully! ✅")
      fetchBookings()
    } catch (error) {
      toast.error("Error updating status")
    }
  }

  // New: Handle "Mark Payment Done" click for admin
  const handleMarkUserPaymentClick = (booking) => {
    setSelectedBookingForPayment(booking)
    setUserPaymentAmount(booking.sellingPrice || booking.bookingPrice || "") // Pre-fill with selling or booking price
    setShowUserPaymentModal(true)
  }

  // New: Handle "Mark Payment Done" submission for admin
  const handleUserPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBookingForPayment) return

    const amount = Number(userPaymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid selling amount.")
      return
    }

    try {
      // This PATCH route is admin-only and handles wallet deduction
      await axios.patch(`http://localhost:5000/api/bookings/${selectedBookingForPayment._id}/mark-user-paid`, {
        sellingPrice: amount,
      })
      toast.success("Payment marked as done and wallet updated! ✅")
      setShowUserPaymentModal(false)
      setSelectedBookingForPayment(null)
      setUserPaymentAmount("")
      fetchBookings() // Re-fetch bookings to update status and wallet
    } catch (error) {
      toast.error(error.response?.data?.message || "Error marking payment done.")
    }
  }

  const resetForm = () => {
    setFormData({
      bookingDate: "",
      mobileModel: "",
      bookingPrice: "",
      sellingPrice: "",
      platform: "",
      card: "",
      notes: "",
      bookingAccount: "",
      dealer: "",
      bookingId: "",
      status: "",
      assignedToDealerId: "",
      dealerAmount: "",
    })
  }

  const getStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status.replace(/_/g, " ")}</span>
  }

  const getProfitLossDisplay = (bookingPrice, sellingPrice) => {
    if (sellingPrice === undefined || sellingPrice === null || sellingPrice === "") {
      return (
        <span className="status-badge" style={{ background: "rgba(107, 114, 128, 0.15)", color: "#6b7280" }}>
          N/A
        </span>
      )
    }

    const profitLoss = Number(sellingPrice) - Number(bookingPrice)
    const isProfit = profitLoss >= 0

    const badgeClass = isProfit ? "status-delivered" : "status-pending" // Reusing existing classes for color
    const sign = isProfit ? "+" : "" // No minus sign if profit is 0
    const displayAmount = `₹${Math.abs(profitLoss).toLocaleString()}`

    return (
      <span className={`status-badge ${badgeClass}`}>
        {sign}
        {displayAmount}
      </span>
    )
  }

  const allStatuses = ["pending", "delivered", "given_to_admin", "given_to_dealer", "payment_done"]

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">📱 Mobile Bookings</h1>
        <p className="page-subtitle">Manage all your mobile phone bookings in one place</p>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Your Bookings</h2>
          {/* Admin can also add bookings for themselves */}
          <button
            onClick={() => {
              setEditingBooking(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            ➕ Add Booking
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mobile Model</th>
                {user.role === "admin" && <th>User</th>}
                <th>Booking Price</th>
                <th>Selling Price</th>
                <th>Profit/Loss</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>
                    <div className="font-semibold">{booking.mobileModel}</div>
                    {user.role === "admin" && booking.bookingId && (
                      <div className="text-sm text-gray-500">ID: {booking.bookingId}</div>
                    )}
                    {/* Display Dealer Batch ID for both admin and user if assigned */}
                    {booking.dealerBatchId?.batchId && (
                      <div className="text-sm text-gray-500">Batch: {booking.dealerBatchId.batchId}</div>
                    )}
                  </td>
                  {user.role === "admin" && (
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="user-avatar" style={{ width: "24px", height: "24px", fontSize: "10px" }}>
                          {booking.userId?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        {booking.userId?.username || "Unknown"}
                      </div>
                    </td>
                  )}
                  <td>₹{booking.bookingPrice.toLocaleString()}</td>
                  <td>{booking.sellingPrice ? `₹${booking.sellingPrice.toLocaleString()}` : "Not Set"}</td>
                  <td>{getProfitLossDisplay(booking.bookingPrice, booking.sellingPrice)}</td>
                  <td>{booking.platform}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      {/* Edit button is available for users on their own bookings, and for admins on all bookings */}
                      <button
                        onClick={() => handleEdit(booking)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="btn btn-danger"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        🗑️ Delete
                      </button>
                      {/* Quick action status change buttons (available to both users and admins) */}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(booking._id, "delivered")}
                          className="btn btn-success"
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                        >
                          ✅ Mark Delivered
                        </button>
                      )}
                      {booking.status === "delivered" && (
                        <button
                          onClick={() => handleStatusChange(booking._id, "given_to_admin")}
                          className="btn btn-warning"
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                        >
                          👨‍💼 Give to Admin
                        </button>
                      )}
                      {/* Admin specific action for marking user payment done */}
                      {user.role === "admin" && booking.status !== "payment_done" && (
                        <button
                          onClick={() => handleMarkUserPaymentClick(booking)}
                          className="btn btn-success"
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                        >
                          💰 Mark Payment Done
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
            <p>Create your first booking to get started!</p>
            <button
              onClick={() => {
                setEditingBooking(null)
                resetForm()
                setShowModal(true)
              }}
              className="btn btn-primary"
            >
              ➕ Create First Booking
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingBooking ? "✏️ Edit Booking" : "➕ Add New Booking"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Booking Date</label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className="form-control"
                    required
                    // For admin editing existing bookings, these fields are read-only
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Model</label>
                  <input
                    type="text"
                    name="mobileModel"
                    value={formData.mobileModel}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., iPhone 15 Pro Max"
                    required
                    // For admin editing existing bookings, these fields are read-only
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Booking Price</label>
                  <input
                    type="number"
                    name="bookingPrice"
                    value={formData.bookingPrice}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="₹ 0"
                    required
                    // For admin editing existing bookings, these fields are read-only
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (Optional)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="₹ 0"
                    // For user editing existing bookings, this field is read-only
                    readOnly={user.role === "user" && editingBooking}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="form-control"
                    required
                    // For admin editing existing bookings, this field is disabled
                    disabled={user.role === "admin" && editingBooking}
                  >
                    <option value="">Select Platform</option>
                    {platforms.map((platform) => (
                      <option key={platform._id} value={platform.accountAlias}>
                        {platform.name} - {platform.accountAlias}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Card</label>
                  <select
                    name="card"
                    value={formData.card}
                    onChange={handleChange}
                    className="form-control"
                    required
                    // For admin editing existing bookings, this field is disabled
                    disabled={user.role === "admin" && editingBooking}
                  >
                    <option value="">Select Card</option>
                    {cards.map((card) => (
                      <option key={card._id} value={card.alias}>
                        {card.alias} - {card.bankName} (*{card.lastFour})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin-only fields for setting booking details and status */}
              {user.role === "admin" && editingBooking && (
                <>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Booking ID (Admin Set)</label>
                    <input
                      type="text"
                      name="bookingId"
                      value={formData.bookingId}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Order/Booking ID"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Booking Account (Admin Set)</label>
                    <input
                      type="text"
                      name="bookingAccount"
                      value={formData.bookingAccount}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Account used for booking"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealer (Admin Set)</label>
                    <input
                      type="text"
                      name="dealer"
                      value={formData.dealer}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Dealer name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned To Dealer</label>
                    <select
                      name="assignedToDealerId"
                      value={formData.assignedToDealerId}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Select Dealer (Optional)</option>
                      {dealers.map((dealer) => (
                        <option key={dealer._id} value={dealer._id}>
                          {dealer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealer Amount</label>
                    <input
                      type="number"
                      name="dealerAmount"
                      value={formData.dealerAmount}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="₹ 0"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? "Update Booking" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New: Mark User Payment Done Modal */}
      {showUserPaymentModal && selectedBookingForPayment && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Mark Payment Done for User</h3>
              <button onClick={() => setShowUserPaymentModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleUserPaymentSubmit}>
              <p className="mb-3">
                Confirm payment for mobile: <strong>{selectedBookingForPayment.mobileModel}</strong> (Booking Price: ₹
                {selectedBookingForPayment.bookingPrice.toLocaleString()})
              </p>
              <div className="form-group">
                <label className="form-label">Selling Amount (Amount to pay user)</label>
                <input
                  type="number"
                  name="userPaymentAmount"
                  value={userPaymentAmount}
                  onChange={(e) => setUserPaymentAmount(e.target.value)}
                  className="form-control"
                  placeholder="₹ 0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowUserPaymentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payment & Deduct from Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
