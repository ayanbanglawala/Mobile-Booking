"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const DealerBatchDetails = () => {
  const { batchId } = useParams()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    notes: "",
  })

  useEffect(() => {
    fetchBatchDetails()
  }, [batchId])

  const fetchBatchDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dealer-batches/${batchId}`)
      setBatch(response.data)
    } catch (error) {
      toast.error("Error fetching batch details")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentChange = (e) => {
    setPaymentFormData({
      ...paymentFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
      toast.error("Please enter a valid payment amount.")
      return
    }

    try {
      await axios.patch(`http://localhost:5000/api/dealer-batches/${batchId}/add-payment`, {
        amount: Number(paymentFormData.amount),
        notes: paymentFormData.notes,
      })
      toast.success("Payment added successfully! ✅")
      setShowPaymentModal(false)
      setPaymentFormData({ amount: "", notes: "" })
      fetchBatchDetails() // Re-fetch batch details to update UI
      // No explicit wallet re-fetch needed here, as the backend handles it
      // and the wallet page will re-fetch when navigated to.
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding payment.")
    }
  }

  const getBatchStatusBadge = (status) => {
    let className = "status-badge"
    const text = status.replace(/_/g, " ")
    switch (status) {
      case "completed_payment":
        className += " status-delivered" // Green
        break
      case "partially_paid":
        className += " status-warning" // Yellow/Orange
        break
      case "pending_payment":
      default:
        className += " status-pending" // Red
        break
    }
    return <span className={className}>{text}</span>
  }

  const getBookingStatusBadge = (status) => {
    return <span className={`status-badge status-${status}`}>{status.replace("_", " ")}</span>
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading batch details...</div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Batch not found</h3>
          <Link to="/admin/dealers" className="btn btn-primary">
            ← Back to Dealers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <Link to={`/admin/dealer-batches/${batch.dealerId._id}`} className="btn btn-secondary">
          ← Back to Batches
        </Link>
      </div>

      <div className="page-header animate-fade-in">
        <h1 className="page-title">📦 Batch {batch.batchId} Details</h1>
        <p className="page-subtitle">
          Details for mobiles assigned to {batch.dealerId?.name} on {new Date(batch.assignedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Batch Summary Card */}
      <div className="card animate-slide-up" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">Batch Summary</h2>
          {batch.status !== "completed_payment" && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary">
              ➕ Add Payment
            </button>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <strong>Dealer:</strong> {batch.dealerId?.name}
          </div>
          <div>
            <strong>Total Mobiles:</strong> {batch.bookingIds.length}
          </div>
          <div>
            <strong>Total Amount:</strong> ₹{batch.totalAmount.toLocaleString()}
          </div>
          <div>
            <strong>Paid Amount:</strong> ₹{batch.paidAmount.toLocaleString()}
          </div>
          <div>
            <strong>Remaining Amount:</strong>{" "}
            <span className={`font-semibold ${batch.remainingAmount <= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{batch.remainingAmount.toLocaleString()}
            </span>
          </div>
          <div>
            <strong>Status:</strong> {getBatchStatusBadge(batch.status)}
          </div>
        </div>
      </div>

      {/* Mobiles in Batch */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Mobiles in this Batch ({batch.bookingIds.length})</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mobile Model</th>
                <th>User</th>
                <th>Booking Price</th>
                <th>Assigned Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batch.bookingIds.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.mobileModel}</td>
                  <td>{booking.userId?.username || "N/A"}</td>
                  <td>₹{booking.bookingPrice.toLocaleString()}</td>
                  <td>₹{booking.dealerAmount?.toLocaleString() || "N/A"}</td>
                  <td>{getBookingStatusBadge(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {batch.bookingIds.length === 0 && (
          <div className="empty-state">
            <h3>No mobiles found in this batch</h3>
            <p>This batch might have been created without any mobiles or data is missing.</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      {batch.payments.length > 0 && (
        <div className="card animate-slide-up mt-4">
          <div className="card-header">
            <h2 className="card-title">Payment History</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {batch.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>₹{payment.amount.toLocaleString()}</td>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>{payment.notes || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">➕ Add Payment to Batch {batch.batchId}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleAddPayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={paymentFormData.amount}
                  onChange={handlePaymentChange}
                  className="form-control"
                  placeholder="₹ 0"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={paymentFormData.notes}
                  onChange={handlePaymentChange}
                  className="form-control"
                  rows="3"
                  placeholder="e.g., Cash payment, Bank transfer"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DealerBatchDetails
