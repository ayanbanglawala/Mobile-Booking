"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const DealerBatches = () => {
  const { dealerId } = useParams()
  const [batches, setBatches] = useState([])
  const [dealerInfo, setDealerInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDealerBatches()
    fetchDealerInfo()
  }, [dealerId])

  const fetchDealerBatches = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dealer-batches/dealer/${dealerId}`)
      setBatches(response.data)
    } catch (error) {
      toast.error("Error fetching dealer batches")
    } finally {
      setLoading(false)
    }
  }

  const fetchDealerInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dealers")
      const foundDealer = response.data.find((d) => d._id === dealerId)
      setDealerInfo(foundDealer)
    } catch (error) {
      console.error("Error fetching dealer info:", error)
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dealer batches...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <Link to="/admin/dealers" className="btn btn-secondary">
          ← Back to Dealers
        </Link>
      </div>

      {dealerInfo && (
        <div className="page-header animate-fade-in">
          <h1 className="page-title">📦 {dealerInfo.name}'s Batches</h1>
          <p className="page-subtitle">Manage payment batches for {dealerInfo.name}</p>
        </div>
      )}

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">All Batches</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Assigned Date</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Remaining Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch._id}>
                  <td>{batch.batchId}</td>
                  <td>{new Date(batch.assignedAt).toLocaleDateString()}</td>
                  <td>₹{batch.totalAmount.toLocaleString()}</td>
                  <td>₹{batch.paidAmount.toLocaleString()}</td>
                  <td>₹{batch.remainingAmount.toLocaleString()}</td>
                  <td>{getBatchStatusBadge(batch.status)}</td>
                  <td>
                    <Link
                      to={`/admin/dealer-batch-details/${batch._id}`}
                      className="btn btn-primary"
                      style={{ padding: "8px 12px", fontSize: "12px" }}
                    >
                      👁️ View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {batches.length === 0 && (
          <div className="empty-state">
            <h3>No batches found for this dealer</h3>
            <p>Assign mobiles from Admin Inventory to create a new batch.</p>
            <Link to="/admin/inventory" className="btn btn-primary">
              📋 Go to Admin Inventory
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealerBatches
