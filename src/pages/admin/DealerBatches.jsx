"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Package, Calendar, DollarSign, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"

const DealerBatches = () => {
  const { dealerId } = useParams()
  const [batches, setBatches] = useState([])
  const [dealerInfo, setDealerInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchDealerBatches()
    fetchDealerInfo()
  }, [dealerId])

  const fetchDealerBatches = async () => {
    try {
      const response = await axios.get(`https://mobile-booking-backend-production.up.railway.app/api/dealer-batches/dealer/${dealerId}`)
      setBatches(response.data)
    } catch (error) {
      toast.error("Error fetching dealer batches")
    } finally {
      setLoading(false)
    }
  }

  const fetchDealerInfo = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/dealers")
      const foundDealer = response.data.find((d) => d._id === dealerId)
      setDealerInfo(foundDealer)
    } catch (error) {
      console.error("Error fetching dealer info:", error)
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBatches = batches.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(batches.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dealer batches...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/admin/dealers"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dealers
          </Link>
        </div>

        {/* Header */}
        {dealerInfo && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{dealerInfo.name}'s Batches</h1>
            </div>
            <p className="text-gray-600">Manage payment batches for {dealerInfo.name}</p>
          </div>
        )}

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Batches</h2>
          </div>

          {currentBatches.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentBatches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch.batchId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(batch.assignedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              ₹{batch.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-600 font-medium">
                            ₹{batch.paidAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              batch.remainingAmount > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            ₹{batch.remainingAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getBatchStatusBadge(batch.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/admin/dealer-batch-details/${batch._id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found for this dealer</h3>
              <p className="text-gray-500 mb-6">Assign mobiles from Admin Inventory to create a new batch.</p>
              <Link
                to="/admin/inventory"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Package className="w-4 h-4" />
                Go to Admin Inventory
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DealerBatches
