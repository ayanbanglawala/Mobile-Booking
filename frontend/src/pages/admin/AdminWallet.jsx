"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const AdminWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddProfitModal, setShowAddProfitModal] = useState(false)
  const [profitFormData, setProfitFormData] = useState({
    amount: "",
    notes: "",
  })

  useEffect(() => {
    fetchWalletDetails()
  }, [])

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wallet")
      setWallet(response.data)
    } catch (error) {
      toast.error("Error fetching wallet details")
    } finally {
      setLoading(false)
    }
  }

  const handleProfitChange = (e) => {
    setProfitFormData({
      ...profitFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddProfit = async (e) => {
    e.preventDefault()
    if (!profitFormData.amount || Number(profitFormData.amount) <= 0) {
      toast.error("Please enter a valid amount to withdraw.")
      return
    }

    try {
      // This endpoint now handles profit withdrawal (deduction)
      await axios.post("http://localhost:5000/api/wallet/add-profit", {
        amount: Number(profitFormData.amount),
        notes: profitFormData.notes,
      })
      toast.success("Profit withdrawn from wallet successfully! 💸")
      setShowAddProfitModal(false)
      setProfitFormData({ amount: "", notes: "" })
      fetchWalletDetails() // Re-fetch wallet details to update UI
    } catch (error) {
      toast.error(error.response?.data?.message || "Error withdrawing profit.")
    }
  }

  const getTransactionBadge = (type) => {
    let className = "status-badge"
    let text = ""
    switch (type) {
      case "credit":
        className += " status-delivered" // Green
        text = "Credit"
        break
      case "debit":
        className += " status-pending" // Red
        text = "Debit"
        break
      case "profit_addition":
        className += " status-warning" // Yellow/Orange
        text = "Profit Added"
        break
      case "profit_withdrawal": // New type
        className += " status-pending" // Red for withdrawal
        text = "Profit Withdrawal"
        break
      default:
        className += " status-given_to_admin"
        text = type
        break
    }
    return <span className={className}>{text}</span>
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading wallet...</div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Wallet not found</h3>
          <p>There was an issue loading the admin wallet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">💰 Admin Wallet</h1>
        <p className="page-subtitle">Manage your system funds and view transaction history.</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="card animate-slide-up" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">Current Balance</h2>
          <button onClick={() => setShowAddProfitModal(true)} className="btn btn-primary">
            ➖ Withdraw Profit
          </button>
        </div>
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-green-600">₹{wallet.balance.toLocaleString()}</div>
          <p className="text-lg text-gray-600 mt-2">Available Funds</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <h2 className="card-title">Transaction History ({wallet.transactions.length})</h2>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by newest first
                .map((transaction, index) => (
                  <tr key={index}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{getTransactionBadge(transaction.type)}</td>
                    <td
                      className={
                        transaction.type === "debit" || transaction.type === "profit_withdrawal"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {transaction.type === "debit" || transaction.type === "profit_withdrawal" ? "-" : "+"}₹
                      {transaction.amount.toLocaleString()}
                    </td>
                    <td>{transaction.description}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {wallet.transactions.length === 0 && (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Your wallet history will appear here as payments are processed.</p>
          </div>
        )}
      </div>

      {showAddProfitModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">➖ Withdraw Profit from Wallet</h3>
              <button onClick={() => setShowAddProfitModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleAddProfit}>
              <div className="form-group">
                <label className="form-label">Amount to Withdraw</label>
                <input
                  type="number"
                  name="amount"
                  value={profitFormData.amount}
                  onChange={handleProfitChange}
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
                  value={profitFormData.notes}
                  onChange={handleProfitChange}
                  className="form-control"
                  rows="3"
                  placeholder="e.g., Personal withdrawal, Investment"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddProfitModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Withdraw Profit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWallet
