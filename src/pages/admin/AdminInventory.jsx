"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"
import { Package, Users, DollarSign, Calendar, CheckSquare, Square } from "lucide-react"

const AdminInventory = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [assignData, setAssignData] = useState({
    dealerId: "",
    amounts: {},
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchInventory()
    fetchDealers()
  }, [])

  useEffect(() => {
    setFilteredInventory(inventory)
  }, [inventory])

  const fetchInventory = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/inventory/admin")
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching inventory")
    } finally {
      setLoading(false)
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

  // Pagination logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInventory = filteredInventory.slice(startIndex, endIndex)

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings((prev) => {
      if (prev.includes(bookingId)) {
        return prev.filter((id) => id !== bookingId)
      } else {
        return [...prev, bookingId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedBookings.length === inventory.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(inventory.map((item) => item._id))
    }
  }

  const handleAmountChange = (bookingId, amount) => {
    setAssignData((prev) => ({
      ...prev,
      amounts: {
        ...prev.amounts,
        [bookingId]: Number.parseFloat(amount) || 0,
      },
    }))
  }

  const handleAssignToDealer = async () => {
    if (!assignData.dealerId || selectedBookings.length === 0) {
      toast.error("Please select dealer and at least one mobile to assign.")
      return
    }

    const allAmountsSet = selectedBookings.every(
      (id) => assignData.amounts[id] !== undefined && assignData.amounts[id] !== null,
    )
    if (!allAmountsSet) {
      toast.error("Please enter an amount for all selected mobiles.")
      return
    }

    try {
      await axios.post("https://mobile-booking-backend-production.up.railway.app/api/inventory/assign-to-dealer", {
        dealerId: assignData.dealerId,
        bookingIds: selectedBookings,
        amounts: assignData.amounts,
      })

      toast.success("Mobiles assigned to dealer in a new batch successfully!")
      setShowAssignModal(false)
      setSelectedBookings([])
      setAssignData({ dealerId: "", amounts: {} })
      fetchInventory()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error assigning mobiles to dealer.")
    }
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Inventory</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage mobiles that have been given to admin</p>
          </div>

          {/* Actions */}
          {selectedBookings.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">{selectedBookings.length} items selected</span>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign to Dealer ({selectedBookings.length})
                </button>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={handleSelectAll} className="flex items-center">
                        {selectedBookings.length === inventory.length && inventory.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
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
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Given to Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleSelectBooking(item._id)}>
                          {selectedBookings.includes(item._id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{item.mobileModel}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium mr-3">
                            {item.userId?.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{item.userId?.username || "Unknown"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />₹{item.bookingPrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.platform}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.givenToAdminAt).toLocaleDateString()}
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
              totalItems={filteredInventory.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentInventory.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    <button onClick={() => handleSelectBooking(item._id)} className="mr-3">
                      {selectedBookings.includes(item._id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">{item.mobileModel}</h3>
                      <p className="text-sm text-gray-600">{item.userId?.username || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                    <p className="text-sm font-medium text-gray-900">₹{item.bookingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Platform</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{item.platform}</p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Given to Admin: {new Date(item.givenToAdminAt).toLocaleDateString()}
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
                totalItems={filteredInventory.length}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredInventory.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mobiles in admin inventory</h3>
              <p className="text-gray-600">Mobiles will appear here when users mark them as "Given to Admin".</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign to Dealer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Assign Mobiles to Dealer</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dealer</label>
                <select
                  value={assignData.dealerId}
                  onChange={(e) => setAssignData((prev) => ({ ...prev, dealerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose Dealer</option>
                  {dealers.map((dealer) => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.name} - {dealer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Selected Mobiles & Amounts:</h4>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {selectedBookings.map((bookingId) => {
                    const booking = inventory.find((item) => item._id === bookingId)
                    return (
                      <div
                        key={bookingId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100 last:border-b-0 space-y-3 sm:space-y-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{booking?.mobileModel}</div>
                          <div className="text-sm text-gray-500">₹{booking?.bookingPrice.toLocaleString()}</div>
                        </div>
                        <div className="sm:ml-4">
                          <input
                            type="number"
                            placeholder="Amount to Dealer"
                            value={assignData.amounts[bookingId] || ""}
                            onChange={(e) => handleAmountChange(bookingId, e.target.value)}
                            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignToDealer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign to Dealer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInventory
