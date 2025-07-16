"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../components/Pagination"
import { Package, Calendar, DollarSign, Store, User, UserCheck, Smartphone } from "lucide-react"

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    setFilteredInventory(inventory)
  }, [inventory])

  const fetchInventory = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend.vercel.app/api/inventory/user")
      setInventory(response.data)
    } catch (error) {
      toast.error("Error fetching inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleGiveToAdmin = async (bookingId) => {
    if (window.confirm("Are you sure you want to give this mobile to admin?")) {
      try {
        await axios.patch(`https://mobile-booking-backend.vercel.app/api/bookings/${bookingId}/status`, {
          status: "given_to_admin",
        })
        toast.success("Mobile marked as given to admin! ✅")
        fetchInventory()
      } catch (error) {
        toast.error("Error updating status")
      }
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInventory = filteredInventory.slice(startIndex, endIndex)

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Inventory</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Mobiles that have been delivered to you but not yet handed over to admin
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Available Mobiles</h2>
            </div>

            {inventory.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platform
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dealer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentInventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{item.mobileModel}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(item.bookingDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <DollarSign className="h-4 w-4 mr-1 text-green-600" />₹
                              {item.bookingPrice.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Store className="h-4 w-4 mr-1 text-purple-600" />
                              {item.platform}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <User className="h-4 w-4 mr-1 text-orange-600" />
                              {item.dealer || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleGiveToAdmin(item._id)}
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Give to Admin
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {currentInventory.map((item) => (
                    <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">{item.mobileModel}</h3>
                            <p className="text-sm text-gray-500">{new Date(item.bookingDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                          <p className="text-sm font-medium text-gray-900">₹{item.bookingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Platform</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{item.platform}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Dealer</p>
                        <p className="text-sm font-medium text-gray-900">{item.dealer || "N/A"}</p>
                      </div>

                      <button
                        onClick={() => handleGiveToAdmin(item._id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Give to Admin
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredInventory.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mobiles in inventory</h3>
                <p className="text-gray-600 mb-6">Mobiles will appear here once they are marked as delivered.</p>
                <a
                  href="/bookings"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  View Bookings
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory
