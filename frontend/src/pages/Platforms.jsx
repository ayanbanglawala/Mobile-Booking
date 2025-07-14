"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Platforms = () => {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    accountAlias: "",
  })

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/platforms")
      setPlatforms(response.data)
    } catch (error) {
      toast.error("Error fetching platforms")
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
      if (editingPlatform) {
        await axios.put(`http://localhost:5000/api/platforms/${editingPlatform._id}`, formData)
        toast.success("Platform updated successfully! ✅")
      } else {
        await axios.post("http://localhost:5000/api/platforms", formData)
        toast.success("Platform added successfully! 🎉")
      }

      setShowModal(false)
      setEditingPlatform(null)
      resetForm()
      fetchPlatforms()
    } catch (error) {
      toast.error("Error saving platform")
    }
  }

  const handleEdit = (platform) => {
    setEditingPlatform(platform)
    setFormData({
      name: platform.name,
      accountAlias: platform.accountAlias,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this platform?")) {
      try {
        await axios.delete(`http://localhost:5000/api/platforms/${id}`)
        toast.success("Platform deleted successfully! 🗑️")
        fetchPlatforms()
      } catch (error) {
        toast.error("Error deleting platform")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      accountAlias: "",
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading platforms...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">🛒 E-commerce Platforms</h1>
        <p className="page-subtitle">Manage your e-commerce platform accounts</p>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Your Platforms</h2>
          <button
            onClick={() => {
              setEditingPlatform(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            ➕ Add Platform
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Platform Name</th>
                <th>Account Alias</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform._id}>
                  <td>{platform.name}</td>
                  <td>{platform.accountAlias}</td>
                  <td>{new Date(platform.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(platform)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(platform._id)}
                        className="btn btn-danger"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {platforms.length === 0 && (
          <div className="empty-state">
            <h3>No platforms found</h3>
            <p>Add your first e-commerce platform to get started!</p>
            <button
              onClick={() => {
                setEditingPlatform(null)
                resetForm()
                setShowModal(true)
              }}
              className="btn btn-primary"
            >
              ➕ Add First Platform
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingPlatform ? "✏️ Edit Platform" : "➕ Add New Platform"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Platform Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Amazon, Flipkart, Myntra"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Alias</label>
                <input
                  type="text"
                  name="accountAlias"
                  value={formData.accountAlias}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Amazon - John's Account, Flipkart - Business"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlatform ? "Update Platform" : "Add Platform"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Platforms
