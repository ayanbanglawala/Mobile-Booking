"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  Plus,
  DollarSign,
  Calendar,
  User,
  Smartphone,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react"
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

  // Simple mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  useEffect(() => {
    fetchBatchDetails()
  }, [batchId])

  const fetchBatchDetails = async () => {
    try {
      const response = await axios.get(
        `https://mobile-booking-backend-production.up.railway.app/api/dealer-batches/${batchId}`,
      )
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
      await axios.patch(
        `https://mobile-booking-backend-production.up.railway.app/api/dealer-batches/${batchId}/add-payment`,
        {
          amount: Number(paymentFormData.amount),
          notes: paymentFormData.notes,
        },
      )
      toast.success("Payment added successfully!")
      setShowPaymentModal(false)
      setPaymentFormData({ amount: "", notes: "" })
      fetchBatchDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding payment.")
    }
  }

  const getBatchStatusBadge = (status) => {
    const statusConfig = {
      completed_payment: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
        text: "Completed Payment",
      },
      partially_paid: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Partially Paid",
      },
      pending_payment: {
        icon: AlertCircle,
        className: "bg-red-100 text-red-800 border-red-200",
        text: "Pending Payment",
      },
    }

    const config = statusConfig[status] || statusConfig.pending_payment
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    )
  }

  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" },
      delivered: { className: "bg-blue-100 text-blue-800 border-blue-200", text: "Delivered" },
      given_to_admin: { className: "bg-purple-100 text-purple-800 border-purple-200", text: "Given to Admin" },
      assigned_to_dealer: { className: "bg-orange-100 text-orange-800 border-orange-200", text: "Assigned to Dealer" },
      dealer_payment_received: { className: "bg-green-100 text-green-800 border-green-200", text: "Payment Received" },
      user_payment_given: { className: "bg-green-100 text-green-800 border-green-200", text: "Payment Given" },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading batch details...</span>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Batch not found</h3>
          <Link
            to="/admin/dealers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dealers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to={`/admin/dealer-batches/${batch.dealerId._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Batches
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Batch {batch.batchId} Details</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Details for mobiles assigned to {batch.dealerId?.name} on{" "}
              {new Date(batch.assignedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Batch Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Batch Summary</h2>
              {batch.status !== "completed_payment" && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Payment
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dealer</p>
                  <p className="font-medium text-gray-900">{batch.dealerId?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Mobiles</p>
                  <p className="font-medium text-gray-900">{batch.bookingIds.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">₹{batch.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-medium text-green-600">₹{batch.paidAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Remaining Amount</p>
                  <p className={`font-medium ${batch.remainingAmount <= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{batch.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getBatchStatusBadge(batch.status)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobiles in Batch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mobiles in this Batch ({batch.bookingIds.length})</h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              {batch.bookingIds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batch.bookingIds.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{booking.mobileModel}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.userId?.username || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{booking.bookingPrice.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{booking.dealerAmount?.toLocaleString() || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getBookingStatusBadge(booking.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mobiles found in this batch</h3>
                  <p className="text-gray-500">
                    This batch might have been created without any mobiles or data is missing.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {batch.bookingIds.length > 0 ? (
                <div className="p-4 space-y-4">
                  {batch.bookingIds.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <h3 className="text-base font-medium text-gray-900 truncate">{booking.mobileModel}</h3>
                          </div>
                          <p className="text-sm text-gray-600">User: {booking.userId?.username || "N/A"}</p>
                        </div>
                        <div className="ml-4">{getBookingStatusBadge(booking.status)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                          <p className="text-sm font-medium text-gray-900">₹{booking.bookingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Assigned Amount</p>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{booking.dealerAmount?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mobiles found in this batch</h3>
                  <p className="text-gray-500">
                    This batch might have been created without any mobiles or data is missing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {batch.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batch.payments.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900">
                                ₹{payment.amount.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {new Date(payment.date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.notes || "N/A"}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-4">
                {batch.payments.map((payment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-base font-medium text-gray-900">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {payment.notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-900">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Add Payment to Batch {batch.batchId}</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentFormData.amount}
                      onChange={handlePaymentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="₹ 0"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={paymentFormData.notes}
                      onChange={handlePaymentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="e.g., Cash payment, Bank transfer"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DealerBatchDetails
