"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory/user")
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleGiveToAdmin = async (bookingId) => {
    if (window.confirm("Are you sure you want to give this mobile to admin?")) {
      try {
        await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
          status: "given_to_admin",
        })
        toast.success("Mobile marked as given to admin! ✅")
        fetchInventory()
      } catch (error) {
        toast.error("Error updating status")
      }
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">📦 My Inventory</h1>
        <p className="page-subtitle">Mobiles that have been delivered to you but not yet handed over to admin</p>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Available Mobiles</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mobile Model</th>
                <th>Booking Date</th>
                <th>Booking Price</th>
                <th>Platform</th>
                <th>Dealer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td>{item.mobileModel}</td>
                  <td>{new Date(item.bookingDate).toLocaleDateString()}</td>
                  <td>₹{item.bookingPrice.toLocaleString()}</td>
                  <td>{item.platform}</td>
                  <td>{item.dealer}</td>
                  <td>
                    <button
                      onClick={() => handleGiveToAdmin(item._id)}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "12px" }}
                    >
                      👨‍💼 Give to Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inventory.length === 0 && (
          <div className="empty-state">
            <h3>No mobiles in inventory</h3>
            <p>Mobiles will appear here once they are marked as delivered.</p>
            <a href="/bookings" className="btn btn-primary">
              📱 View Bookings
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
