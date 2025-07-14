"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    role: "user",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users")
      setUsers(response.data)
    } catch (error) {
      toast.error("Error fetching users")
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
      await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, formData)
      toast.success("User updated successfully! ✅")
      setShowModal(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error) {
      toast.error("Error updating user")
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      role: user.role,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This will also delete all their bookings.")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`)
        toast.success("User deleted successfully! 🗑️")
        fetchUsers()
      } catch (error) {
        toast.error("Error deleting user")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      role: "user",
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">Manage all system users and their permissions</p>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">All Users</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Total Bookings</th>
                <th>Total Amount</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.role === "admin" ? "status-delivered" : "status-pending"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.bookingCount || 0}</td>
                  <td>₹{(user.totalAmount || 0).toLocaleString()}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/user-details/${user._id}`}
                        className="btn btn-success"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        👁️ View
                      </Link>
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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

        {users.length === 0 && (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>No users are registered in the system yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit User</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-control" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
