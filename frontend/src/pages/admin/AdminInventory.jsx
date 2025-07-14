"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const AdminInventory = () => {
  const [inventory, setInventory] = useState([])
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [assignData, setAssignData] = useState({
    dealerId: "",
    amounts: {}, // amounts will be an object { bookingId: amount, ... }
  })

  useEffect(() => {
    fetchInventory()
    fetchDealers()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory/admin")
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching inventory")
    } finally {
      setLoading(false)
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

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings((prev) => {
      if (prev.includes(bookingId)) {
        return prev.filter((id) => id !== bookingId)
      } else {
        return [...prev, bookingId]
      }
    })
  }

  const handleAmountChange = (bookingId, amount) => {
    setAssignData((prev) => ({
      ...prev,
      amounts: {
        ...prev.amounts,
        [bookingId]: Number.parseFloat(amount) || 0,
      },
    }))
  }

  const handleAssignToDealer = async () => {
    if (!assignData.dealerId || selectedBookings.length === 0) {
      toast.error("Please select dealer and at least one mobile to assign.")
      return
    }

    // Ensure all selected bookings have an amount set
    const allAmountsSet = selectedBookings.every(
      (id) => assignData.amounts[id] !== undefined && assignData.amounts[id] !== null,
    )
    if (!allAmountsSet) {
      toast.error("Please enter an amount for all selected mobiles.")
      return
    }

    try {
      // Send bookingIds as an array and amounts as an object
      await axios.post("http://localhost:5000/api/inventory/assign-to-dealer", {
        dealerId: assignData.dealerId,
        bookingIds: selectedBookings,
        amounts: assignData.amounts,
      })

      toast.success("Mobiles assigned to dealer in a new batch successfully!")
      setShowAssignModal(false)
      setSelectedBookings([])
      setAssignData({ dealerId: "", amounts: {} })
      fetchInventory()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error assigning mobiles to dealer.")
    }
  }

  if (loading) {
    return <div className="loading">Loading admin inventory...</div>
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Admin Inventory</h2>
          {selectedBookings.length > 0 && (
            <button onClick={() => setShowAssignModal(true)} className="btn btn-primary">
              Assign to Dealer ({selectedBookings.length})
            </button>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBookings(inventory.map((item) => item._id))
                    } else {
                      setSelectedBookings([])
                    }
                  }}
                  checked={selectedBookings.length === inventory.length && inventory.length > 0}
                />
              </th>
              <th>Mobile Model</th>
              <th>User</th>
              <th>Booking Price</th>
              <th>Platform</th>
              <th>Given to Admin</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(item._id)}
                    onChange={() => handleSelectBooking(item._id)}
                  />
                </td>
                <td>{item.mobileModel}</td>
                <td>{item.userId?.username}</td>
                <td>₹{item.bookingPrice}</td>
                <td>{item.platform}</td>
                <td>{new Date(item.givenToAdminAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <h3>No mobiles in admin inventory</h3>
            <p>Mobiles will appear here when users mark them as "Given to Admin".</p>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Mobiles to Dealer</h3>
              <button onClick={() => setShowAssignModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Select Dealer</label>
              <select
                value={assignData.dealerId}
                onChange={(e) => setAssignData((prev) => ({ ...prev, dealerId: e.target.value }))}
                className="form-control"
                required
              >
                <option value="">Choose Dealer</option>
                {dealers.map((dealer) => (
                  <option key={dealer._id} value={dealer._id}>
                    {dealer.name} - {dealer.phone}
                  </option>
                ))}
              </select>
            </div>

            <h4>Selected Mobiles & Amounts:</h4>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {selectedBookings.map((bookingId) => {
                const booking = inventory.find((item) => item._id === bookingId)
                return (
                  <div
                    key={bookingId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      borderBottom: "1px solid var(--border-light)",
                      marginBottom: "5px",
                    }}
                  >
                    <span>
                      {booking?.mobileModel} (₹{booking?.bookingPrice})
                    </span>
                    <input
                      type="number"
                      placeholder="Amount to Dealer"
                      value={assignData.amounts[bookingId] || ""}
                      onChange={(e) => handleAmountChange(bookingId, e.target.value)}
                      className="form-control"
                      style={{ width: "150px" }}
                      required
                    />
                  </div>
                )
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleAssignToDealer} className="btn btn-primary">
                Assign to Dealer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInventory
