"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const Cards = () => {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [formData, setFormData] = useState({
    alias: "",
    bankName: "",
    lastFour: "",
    cardType: "credit",
    isActive: true,
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cards")
      setCards(response.data)
    } catch (error) {
      toast.error("Error fetching cards")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingCard) {
        await axios.put(`http://localhost:5000/api/cards/${editingCard._id}`, formData)
        toast.success("Card updated successfully! ✅")
      } else {
        await axios.post("http://localhost:5000/api/cards", formData)
        toast.success("Card added successfully! 🎉")
      }

      setShowModal(false)
      setEditingCard(null)
      resetForm()
      fetchCards()
    } catch (error) {
      toast.error("Error saving card")
    }
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setFormData({
      alias: card.alias,
      bankName: card.bankName,
      lastFour: card.lastFour,
      cardType: card.cardType,
      isActive: card.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await axios.delete(`http://localhost:5000/api/cards/${id}`)
        toast.success("Card deleted successfully! 🗑️")
        fetchCards()
      } catch (error) {
        toast.error("Error deleting card")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      alias: "",
      bankName: "",
      lastFour: "",
      cardType: "credit",
      isActive: true,
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading cards...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">💳 Payment Cards</h1>
        <p className="page-subtitle">Manage your payment cards for mobile bookings</p>
      </div>

      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Your Cards</h2>
          <button
            onClick={() => {
              setEditingCard(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            ➕ Add Card
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Alias</th>
                <th>Bank Name</th>
                <th>Last 4 Digits</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card._id}>
                  <td>{card.alias}</td>
                  <td>{card.bankName}</td>
                  <td>****{card.lastFour}</td>
                  <td style={{ textTransform: "capitalize" }}>{card.cardType}</td>
                  <td>
                    <span className={`status-badge ${card.isActive ? "status-delivered" : "status-pending"}`}>
                      {card.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card._id)}
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

        {cards.length === 0 && (
          <div className="empty-state">
            <h3>No cards found</h3>
            <p>Add your first payment card to get started!</p>
            <button
              onClick={() => {
                setEditingCard(null)
                resetForm()
                setShowModal(true)
              }}
              className="btn btn-primary"
            >
              ➕ Add First Card
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingCard ? "✏️ Edit Card" : "➕ Add New Card"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Card Alias</label>
                <input
                  type="text"
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Personal HDFC, Business SBI"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., HDFC Bank, SBI"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last 4 Digits</label>
                  <input
                    type="text"
                    name="lastFour"
                    value={formData.lastFour}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="1234"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Type</label>
                  <select
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    style={{ width: "auto" }}
                  />
                  <span className="form-label mb-0">Active Card</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCard ? "Update Card" : "Add Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cards
