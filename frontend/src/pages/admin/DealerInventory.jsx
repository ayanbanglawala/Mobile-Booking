"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const DealerInventory = () => {
  const { dealerId } = useParams()
  const [inventory, setInventory] = useState([])
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDealerInventory()
    fetchDealerInfo()
  }, [dealerId])

  const fetchDealerInventory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventory/dealer/${dealerId}`)
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching dealer inventory")
    } finally {
      setLoading(false)
    }
  }

  const fetchDealerInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dealers")
      const dealerInfo = response.data.find((d) => d._id === dealerId)
      setDealer(dealerInfo)
    } catch (error) {
      console.error("Error fetching dealer info:", error)
    }
  }

  const handleMarkPaymentReceived = async (bookingId) => {
    if (window.confirm("Mark payment as received from dealer?")) {
      try {
        await axios.patch(`http://localhost:5000/api/inventory/dealer-payment/${bookingId}`)
        toast.success("Payment marked as received")
        fetchDealerInventory()
        fetchDealerInfo()
      } catch (error) {
        toast.error("Error updating payment status")
      }
    }
  }

  const handleMarkUserPaymentGiven = async (bookingId) => {
    if (window.confirm("Mark payment as given to user?")) {
      try {
        await axios.patch(`http://localhost:5000/api/inventory/user-payment/${bookingId}`)
        toast.success("Payment marked as given to user")
        fetchDealerInventory()
      } catch (error) {
        toast.error("Error updating payment status")
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading dealer inventory...</div>
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "20px" }}>
        <Link to="/admin/dealers" className="btn btn-secondary">
          ← Back to Dealers
        </Link>
      </div>

      {dealer && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h2>{dealer.name} - Inventory</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginTop: "15px",
            }}
          >
            <div>
              <strong>Phone:</strong> {dealer.phone}
            </div>
            <div>
              <strong>Total Mobiles:</strong> {dealer.totalMobiles}
            </div>
            <div>
              <strong>Total Amount:</strong> ₹{dealer.totalAmount}
            </div>
            <div>
              <strong>Paid Amount:</strong> ₹{dealer.paidAmount}
            </div>
            <div>
              <strong>Pending Amount:</strong> ₹{dealer.totalAmount - dealer.paidAmount}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Assigned Mobiles</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Mobile Model</th>
              <th>User</th>
              <th>Booking Price</th>
              <th>Dealer Amount</th>
              <th>Assigned Date</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.mobileModel}</td>
                <td>{item.userId?.username}</td>
                <td>₹{item.bookingPrice}</td>
                <td>₹{item.dealerAmount || 0}</td>
                <td>{new Date(item.assignedToDealerAt).toLocaleDateString()}</td>
                <td>
                  <div>
                    <span
                      className={`status-badge ${item.dealerPaymentReceived ? "status-delivered" : "status-pending"}`}
                    >
                      Dealer: {item.dealerPaymentReceived ? "Paid" : "Pending"}
                    </span>
                    <br />
                    <span className={`status-badge ${item.userPaymentGiven ? "status-delivered" : "status-pending"}`}>
                      User: {item.userPaymentGiven ? "Paid" : "Pending"}
                    </span>
                  </div>
                </td>
                <td>
                  {!item.dealerPaymentReceived && (
                    <button
                      onClick={() => handleMarkPaymentReceived(item._id)}
                      className="btn btn-success"
                      style={{ marginBottom: "5px", display: "block" }}
                    >
                      Mark Dealer Payment
                    </button>
                  )}
                  {item.dealerPaymentReceived && !item.userPaymentGiven && (
                    <button onClick={() => handleMarkUserPaymentGiven(item._id)} className="btn btn-primary">
                      Mark User Payment
                    </button>
                  )}
                  {item.userPaymentGiven && <span className="status-badge status-payment_done">Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <h3>No mobiles assigned to this dealer</h3>
            <p>Assign mobiles from the admin inventory to see them here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealerInventory
