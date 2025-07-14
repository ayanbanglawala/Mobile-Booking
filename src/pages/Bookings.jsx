"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import Pagination from "../components/Pagination"
import { Plus, Edit, Trash2, Check, User, DollarSign, Search, Download, Smartphone } from "lucide-react"

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [cards, setCards] = useState([])
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const { user } = useAuth()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [platformFilter, setPlatformFilter] = useState("")

  // Payment modal state
  const [showUserPaymentModal, setShowUserPaymentModal] = useState(false)
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null)
  const [userPaymentAmount, setUserPaymentAmount] = useState("")

  const [formData, setFormData] = useState({
    bookingDate: "",
    mobileModel: "",
    bookingPrice: "",
    sellingPrice: "",
    platform: "",
    card: "",
    notes: "",
    bookingAccount: "",
    dealer: "",
    bookingId: "",
    status: "",
    assignedToDealerId: "",
    dealerAmount: "",
  })

  useEffect(() => {
    fetchBookings()
    fetchPlatforms()
    fetchCards()
    if (user?.role === "admin") {
      fetchDealers()
    }
  }, [user])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, platformFilter])

  const fetchBookings = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/bookings")
      setBookings(response.data)
    } catch (error) {
      toast.error("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/platforms")
      setPlatforms(response.data)
    } catch (error) {
      console.error("Error fetching platforms:", error)
    }
  }

  const fetchCards = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/cards")
      setCards(response.data)
    } catch (error) {
      console.error("Error fetching cards:", error)
    }
  }

  const fetchDealers = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/dealers")
      setDealers(response.data)
    } catch (error) {
      console.error("Error fetching dealers:", error)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.mobileModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.bookingId && booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    if (platformFilter) {
      filtered = filtered.filter((booking) => booking.platform === platformFilter)
    }

    setFilteredBookings(filtered)
    setCurrentPage(1)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBooking) {
        const dataToSend =
          user.role === "admin"
            ? {
                sellingPrice: formData.sellingPrice,
                notes: formData.notes,
                status: formData.status,
                bookingAccount: formData.bookingAccount,
                dealer: formData.dealer,
                bookingId: formData.bookingId,
                assignedToDealerId: formData.assignedToDealerId || null,
                dealerAmount: formData.dealerAmount,
              }
            : formData

        await axios.put(`https://mobile-booking-backend-production.up.railway.app/api/bookings/${editingBooking._id}`, dataToSend)
        toast.success("Booking updated successfully! ✅")
      } else {
        await axios.post("https://mobile-booking-backend-production.up.railway.app/api/bookings", formData)
        toast.success("Booking created successfully! 🎉")
      }

      setShowModal(false)
      setEditingBooking(null)
      resetForm()
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving booking")
    }
  }

  const handleEdit = (booking) => {
    setEditingBooking(booking)
    setFormData({
      bookingDate: booking.bookingDate.split("T")[0],
      mobileModel: booking.mobileModel,
      bookingPrice: booking.bookingPrice,
      sellingPrice: booking.sellingPrice || "",
      platform: booking.platform,
      card: booking.card,
      notes: booking.notes || "",
      bookingAccount: booking.bookingAccount || "",
      dealer: booking.dealer || "",
      bookingId: booking.bookingId || "",
      status: booking.status,
      assignedToDealerId: booking.assignedToDealerId?._id || "",
      dealerAmount: booking.dealerAmount || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`https://mobile-booking-backend-production.up.railway.app/api/bookings/${id}`)
        toast.success("Booking deleted successfully! 🗑️")
        fetchBookings()
      } catch (error) {
        toast.error("Error deleting booking")
      }
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`https://mobile-booking-backend-production.up.railway.app/api/bookings/${id}/status`, { status })
      toast.success("Status updated successfully! ✅")
      fetchBookings()
    } catch (error) {
      toast.error("Error updating status")
    }
  }

  const handleMarkUserPaymentClick = (booking) => {
    setSelectedBookingForPayment(booking)
    setUserPaymentAmount(booking.sellingPrice || booking.bookingPrice || "")
    setShowUserPaymentModal(true)
  }

  const handleUserPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBookingForPayment) return

    const amount = Number(userPaymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid selling amount.")
      return
    }

    try {
      await axios.patch(`https://mobile-booking-backend-production.up.railway.app/api/bookings/${selectedBookingForPayment._id}/mark-user-paid`, {
        sellingPrice: amount,
      })
      toast.success("Payment marked as done and wallet updated! ✅")
      setShowUserPaymentModal(false)
      setSelectedBookingForPayment(null)
      setUserPaymentAmount("")
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error marking payment done.")
    }
  }

  const resetForm = () => {
    setFormData({
      bookingDate: "",
      mobileModel: "",
      bookingPrice: "",
      sellingPrice: "",
      platform: "",
      card: "",
      notes: "",
      bookingAccount: "",
      dealer: "",
      bookingId: "",
      status: "",
      assignedToDealerId: "",
      dealerAmount: "",
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      delivered: { color: "bg-blue-100 text-blue-800", label: "Delivered" },
      given_to_admin: { color: "bg-purple-100 text-purple-800", label: "Given to Admin" },
      given_to_dealer: { color: "bg-orange-100 text-orange-800", label: "Given to Dealer" },
      payment_done: { color: "bg-green-100 text-green-800", label: "Payment Done" },
    }

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getProfitLossDisplay = (bookingPrice, sellingPrice) => {
    if (sellingPrice === undefined || sellingPrice === null || sellingPrice === "") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          N/A
        </span>
      )
    }

    const profitLoss = Number(sellingPrice) - Number(bookingPrice)
    const isProfit = profitLoss >= 0

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isProfit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isProfit ? "+" : ""}₹{Math.abs(profitLoss).toLocaleString()}
      </span>
    )
  }

  const allStatuses = ["pending", "delivered", "given_to_admin", "given_to_dealer", "payment_done"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mobile Bookings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage all your mobile phone bookings in one place</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                {/* Search and Filters */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Status</option>
                    {allStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>

                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Platforms</option>
                    {platforms.map((platform) => (
                      <option key={platform._id} value={platform.accountAlias}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button className="flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setEditingBooking(null)
                      resetForm()
                      setShowModal(true)
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Booking
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile Model
                    </th>
                    {user.role === "admin" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit/Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
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
                  {currentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.mobileModel}</div>
                          {user.role === "admin" && booking.bookingId && (
                            <div className="text-sm text-gray-500">ID: {booking.bookingId}</div>
                          )}
                          {booking.dealerBatchId?.batchId && (
                            <div className="text-sm text-gray-500">Batch: {booking.dealerBatchId.batchId}</div>
                          )}
                        </div>
                      </td>
                      {user.role === "admin" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium mr-3">
                              {booking.userId?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.userId?.username || "Unknown"}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.bookingPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.sellingPrice ? `₹${booking.sellingPrice.toLocaleString()}` : "Not Set"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getProfitLossDisplay(booking.bookingPrice, booking.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.platform}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleEdit(booking)} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(booking._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {booking.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(booking._id, "delivered")}
                              className="text-green-600 hover:text-green-900"
                              title="Mark Delivered"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {booking.status === "delivered" && (
                            <button
                              onClick={() => handleStatusChange(booking._id, "given_to_admin")}
                              className="text-purple-600 hover:text-purple-900"
                              title="Give to Admin"
                            >
                              <User className="h-4 w-4" />
                            </button>
                          )}
                          {user.role === "admin" && booking.status !== "payment_done" && (
                            <button
                              onClick={() => handleMarkUserPaymentClick(booking)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark Payment Done"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredBookings.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {currentBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1 truncate">{booking.mobileModel}</h3>
                    <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    {user.role === "admin" && booking.bookingId && (
                      <p className="text-sm text-gray-500">ID: {booking.bookingId}</p>
                    )}
                    {booking.dealerBatchId?.batchId && (
                      <p className="text-sm text-gray-500">Batch: {booking.dealerBatchId.batchId}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {getStatusBadge(booking.status)}
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(booking)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(booking._id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Info (Admin only) */}
                {user.role === "admin" && (
                  <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium mr-3">
                      {booking.userId?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {booking.userId?.username || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">User</div>
                    </div>
                  </div>
                )}

                {/* Price Information */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                    <p className="text-sm font-medium text-gray-900">₹{booking.bookingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.sellingPrice ? `₹${booking.sellingPrice.toLocaleString()}` : "Not Set"}
                    </p>
                  </div>
                </div>

                {/* Platform and Profit/Loss */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Platform</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{booking.platform}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Profit/Loss</p>
                    {getProfitLossDisplay(booking.bookingPrice, booking.sellingPrice)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleStatusChange(booking._id, "delivered")}
                      className="flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark Delivered
                    </button>
                  )}
                  {booking.status === "delivered" && (
                    <button
                      onClick={() => handleStatusChange(booking._id, "given_to_admin")}
                      className="flex items-center px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Give to Admin
                    </button>
                  )}
                  {user.role === "admin" && booking.status !== "payment_done" && (
                    <button
                      onClick={() => handleMarkUserPaymentClick(booking)}
                      className="flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Mark Payment
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredBookings.length}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredBookings.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter || platformFilter
                  ? "Try adjusting your filters to see more results."
                  : "Create your first booking to get started!"}
              </p>
              <button
                onClick={() => {
                  setEditingBooking(null)
                  resetForm()
                  setShowModal(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Booking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBooking ? "Edit Booking" : "Add New Booking"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date</label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Model</label>
                  <input
                    type="text"
                    name="mobileModel"
                    value={formData.mobileModel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., iPhone 15 Pro Max"
                    required
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Price</label>
                  <input
                    type="number"
                    name="bookingPrice"
                    value={formData.bookingPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="₹ 0"
                    required
                    readOnly={user.role === "admin" && editingBooking}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (Optional)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="₹ 0"
                    readOnly={user.role === "user" && editingBooking}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={user.role === "admin" && editingBooking}
                  >
                    <option value="">Select Platform</option>
                    {platforms.map((platform) => (
                      <option key={platform._id} value={platform.accountAlias}>
                        {platform.name} - {platform.accountAlias}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card</label>
                  <select
                    name="card"
                    value={formData.card}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={user.role === "admin" && editingBooking}
                  >
                    <option value="">Select Card</option>
                    {cards.map((card) => (
                      <option key={card._id} value={card.alias}>
                        {card.alias} - {card.bankName} (*{card.lastFour})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin-only fields */}
              {user.role === "admin" && editingBooking && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Booking ID (Admin Set)</label>
                      <input
                        type="text"
                        name="bookingId"
                        value={formData.bookingId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Order/Booking ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking Account (Admin Set)
                      </label>
                      <input
                        type="text"
                        name="bookingAccount"
                        value={formData.bookingAccount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Account used for booking"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dealer (Admin Set)</label>
                      <input
                        type="text"
                        name="dealer"
                        value={formData.dealer}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dealer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To Dealer</label>
                      <select
                        name="assignedToDealerId"
                        value={formData.assignedToDealerId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Dealer (Optional)</option>
                        {dealers.map((dealer) => (
                          <option key={dealer._id} value={dealer._id}>
                            {dealer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dealer Amount</label>
                    <input
                      type="number"
                      name="dealerAmount"
                      value={formData.dealerAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="₹ 0"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingBooking ? "Update Booking" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showUserPaymentModal && selectedBookingForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Mark Payment Done</h3>
              <button onClick={() => setShowUserPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUserPaymentSubmit} className="p-6">
              <p className="text-gray-600 mb-4">
                Confirm payment for mobile: <strong>{selectedBookingForPayment.mobileModel}</strong>
                <br />
                Booking Price: ₹{selectedBookingForPayment.bookingPrice.toLocaleString()}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Amount (Amount to pay user)
                </label>
                <input
                  type="number"
                  value={userPaymentAmount}
                  onChange={(e) => setUserPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="₹ 0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUserPaymentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Confirm Payment & Deduct from Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
