"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  User,
  Smartphone,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"

const DealerInventory = () => {
  const { dealerId } = useParams()
  const [inventory, setInventory] = useState([])
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchDealerInventory()
    fetchDealerInfo()
  }, [dealerId])

  const fetchDealerInventory = async () => {
    try {
      const response = await axios.get(`https://mobile-booking-backend.vercel.app/api/inventory/dealer/${dealerId}`)
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching dealer inventory")
    } finally {
      setLoading(false)
    }
  }

  const fetchDealerInfo = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend.vercel.app/api/dealers")
      const dealerInfo = response.data.find((d) => d._id === dealerId)
      setDealer(dealerInfo)
    } catch (error) {
      console.error("Error fetching dealer info:", error)
    }
  }

  const handleMarkPaymentReceived = async (bookingId) => {
    if (window.confirm("Mark payment as received from dealer?")) {
      try {
        await axios.patch(`https://mobile-booking-backend.vercel.app/api/inventory/dealer-payment/${bookingId}`)
        toast.success("Payment marked as received")
        fetchDealerInventory()
        fetchDealerInfo()
      } catch (error) {
        toast.error("Error updating payment status")
      }
    }
  }

  const handleMarkUserPaymentGiven = async (bookingId) => {
    if (window.confirm("Mark payment as given to user?")) {
      try {
        await axios.patch(`https://mobile-booking-backend.vercel.app/api/inventory/user-payment/${bookingId}`)
        toast.success("Payment marked as given to user")
        fetchDealerInventory()
      } catch (error) {
        toast.error("Error updating payment status")
      }
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentInventory = inventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(inventory.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dealer inventory...</span>
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

        {/* Dealer Info Card */}
        {dealer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{dealer.name} - Inventory</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{dealer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Mobiles</p>
                  <p className="font-medium text-gray-900">{dealer.totalMobiles}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">₹{dealer.totalAmount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-medium text-green-600">₹{dealer.paidAmount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Amount</p>
                  <p className="font-medium text-red-600">₹{dealer.totalAmount - dealer.paidAmount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Mobiles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Mobiles</h2>
          </div>

          {currentInventory.length > 0 ? (
            <>
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
                        Dealer Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{item.mobileModel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.userId?.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{item.bookingPrice}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{item.dealerAmount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(item.assignedToDealerAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                item.dealerPaymentReceived
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {item.dealerPaymentReceived ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              Dealer: {item.dealerPaymentReceived ? "Paid" : "Pending"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                item.userPaymentGiven
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {item.userPaymentGiven ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              User: {item.userPaymentGiven ? "Paid" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {!item.dealerPaymentReceived && (
                              <button
                                onClick={() => handleMarkPaymentReceived(item._id)}
                                className="block w-full px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                Mark Dealer Payment
                              </button>
                            )}
                            {item.dealerPaymentReceived && !item.userPaymentGiven && (
                              <button
                                onClick={() => handleMarkUserPaymentGiven(item._id)}
                                className="block w-full px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Mark User Payment
                              </button>
                            )}
                            {item.userPaymentGiven && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            )}
                          </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mobiles assigned to this dealer</h3>
              <p className="text-gray-500">Assign mobiles from the admin inventory to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DealerInventory
