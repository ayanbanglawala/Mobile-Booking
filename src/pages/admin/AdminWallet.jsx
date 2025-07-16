"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"
import { Wallet, Plus, Minus, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

const AdminWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddProfitModal, setShowAddProfitModal] = useState(false)
  const [profitFormData, setProfitFormData] = useState({
    amount: "",
    notes: "",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchWalletDetails()
  }, [])

  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend.vercel.app/api/wallet")
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
      await axios.post("https://mobile-booking-backend.vercel.app/api/wallet/add-profit", {
        amount: Number(profitFormData.amount),
        notes: profitFormData.notes,
      })
      toast.success("Profit withdrawn from wallet successfully! 💸")
      setShowAddProfitModal(false)
      setProfitFormData({ amount: "", notes: "" })
      fetchWalletDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error withdrawing profit.")
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "debit":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "profit_addition":
        return <Plus className="h-4 w-4 text-blue-600" />
      case "profit_withdrawal":
        return <Minus className="h-4 w-4 text-red-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionBadge = (type) => {
    const config = {
      credit: { color: "bg-green-100 text-green-800", label: "Credit" },
      debit: { color: "bg-red-100 text-red-800", label: "Debit" },
      profit_addition: { color: "bg-blue-100 text-blue-800", label: "Profit Added" },
      profit_withdrawal: { color: "bg-red-100 text-red-800", label: "Profit Withdrawal" },
    }

    const typeConfig = config[type] || { color: "bg-gray-100 text-gray-800", label: type }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
        {typeConfig.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet not found</h3>
              <p className="text-gray-600">There was an issue loading the admin wallet.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pagination logic
  const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex)

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Wallet</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your system funds and view transaction history</p>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Current Balance</h2>
                <button
                  onClick={() => setShowAddProfitModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw Profit
                </button>
              </div>
              <div className="text-center py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                  <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mr-0 sm:mr-4 mb-2 sm:mb-0" />
                  <div className="text-3xl sm:text-5xl font-bold text-green-600">
                    ₹{wallet.balance.toLocaleString()}
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-600">Available Funds</p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Transaction History ({wallet.transactions.length})
              </h2>
            </div>

            {wallet.transactions.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTransactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getTransactionIcon(transaction.type)}
                              <span className="ml-2">{getTransactionBadge(transaction.type)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                transaction.type === "debit" || transaction.type === "profit_withdrawal"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {transaction.type === "debit" || transaction.type === "profit_withdrawal" ? "-" : "+"}₹
                              {transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{transaction.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {currentTransactions.map((transaction, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-2">{getTransactionBadge(transaction.type)}</span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "debit" || transaction.type === "profit_withdrawal"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "debit" || transaction.type === "profit_withdrawal" ? "-" : "+"}₹
                          {transaction.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-900">{transaction.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={sortedTransactions.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600">Your wallet history will appear here as payments are processed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Profit Modal */}
      {showAddProfitModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Withdraw Profit from Wallet</h3>
              <button onClick={() => setShowAddProfitModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddProfit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw</label>
                <input
                  type="number"
                  name="amount"
                  value={profitFormData.amount}
                  onChange={handleProfitChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="₹ 0"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={profitFormData.notes}
                  onChange={handleProfitChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Personal withdrawal, Investment"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddProfitModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
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
