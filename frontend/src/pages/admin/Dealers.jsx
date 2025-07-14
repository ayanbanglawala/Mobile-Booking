"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const Dealers = () => {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDealer, setEditingDealer] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  })

  useEffect(() => {
    fetchDealers()
  }, [])

  const fetchDealers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dealers")
      setDealers(response.data)
    } catch (error) {
      toast.error("Error fetching dealers")
    } finally {
      setLoading(false)
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
      if (editingDealer) {
        await axios.put(`http://localhost:5000/api/dealers/${editingDealer._id}`, formData)
        toast.success("Dealer updated successfully")
      } else {
        await axios.post("http://localhost:5000/api/dealers", formData)
        toast.success("Dealer created successfully")
      }

      setShowModal(false)
      setEditingDealer(null)
      resetForm()
      fetchDealers()
    } catch (error) {
      toast.error("Error saving dealer")
    }
  }

  const handleEdit = (dealer) => {
    setEditingDealer(dealer)
    setFormData({
      name: dealer.name,
      phone: dealer.phone,
      address: dealer.address || "",
      email: dealer.email || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dealer?")) {
      try {
        await axios.delete(`http://localhost:5000/api/dealers/${id}`)
        toast.success("Dealer deleted successfully")
        fetchDealers()
      } catch (error) {
        toast.error("Error deleting dealer")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
    })
  }

  if (loading) {
    return <div className="loading">Loading dealers...</div>
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Dealers Management</h2>
          <button
            onClick={() => {
              setEditingDealer(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            Add Dealer
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Mobiles</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => (
              <tr key={dealer._id}>
                <td>{dealer.name}</td>
                <td>{dealer.phone}</td>
                <td>{dealer.email || "N/A"}</td>
                <td>{dealer.totalMobiles}</td>
                <td>₹{dealer.totalAmount}</td>
                <td>₹{dealer.paidAmount}</td>
                <td>
                  <Link
                    to={`/admin/dealer-batches/${dealer._id}`}
                    className="btn btn-success"
                    style={{ marginRight: "5px" }}
                  >
                    View Inventory
                  </Link>
                  <button
                    onClick={() => handleEdit(dealer)}
                    className="btn btn-secondary"
                    style={{ marginRight: "5px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(dealer._id)} className="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dealers.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No dealers found. Add your first dealer!
          </p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingDealer ? "Edit Dealer" : "Add New Dealer"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Dealer Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address (Optional)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDealer ? "Update" : "Create"} Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dealers
