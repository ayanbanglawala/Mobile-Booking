"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"
import { ArrowLeft, User, Shield, Calendar, DollarSign, Smartphone, Check, UserCheck } from "lucide-react"

const UserDetails = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  useEffect(() => {
    setFilteredBookings(bookings)
  }, [bookings])

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`https://mobile-booking-backend.vercel.app/api/users/${userId}`)
      setUser(response.data.user)
      setBookings(response.data.bookings)
    } catch (error) {
      toast.error("Error fetching user details")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    try {
      await axios.patch(`https://mobile-booking-backend.vercel.app/api/bookings/${bookingId}/status`, { status })
      toast.success("Status updated successfully! ✅")
      fetchUserDetails()
    } catch (error) {
      toast.error("Error updating status")
    }
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

  const getRoleBadge = (role) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
        }`}
      >
        <Shield className="h-3 w-3 mr-1" />
        {role}
      </span>
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
              <Link
                to="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </div>
          </div>
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
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-4 sm:space-y-0">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center font-bold text-lg sm:text-xl mr-0 sm:mr-4 flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-sm sm:text-base text-gray-600">User details and booking history</p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Information</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-sm text-gray-900 truncate">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-sm text-gray-900">{bookings.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-sm text-gray-900">
                      ₹{bookings.reduce((sum, booking) => sum + booking.bookingPrice, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Bookings ({bookings.length})</h2>
            </div>

            {bookings.length > 0 ? (
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
                          Mobile Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Price
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.mobileModel}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <DollarSign className="h-4 w-4 mr-1 text-green-600" />₹
                              {booking.bookingPrice.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.platform}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
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
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {currentBookings.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 mb-1 truncate">{booking.mobileModel}</h3>
                          <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-4">{getStatusBadge(booking.status)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                          <p className="text-sm font-medium text-gray-900">₹{booking.bookingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Platform</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{booking.platform}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
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
                            <UserCheck className="h-3 w-3 mr-1" />
                            Give to Admin
                          </button>
                        )}
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
                  totalItems={filteredBookings.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings for this user</h3>
                <p className="text-gray-600">This user has not made any mobile bookings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
