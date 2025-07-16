"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, Plus, Edit, Trash2, Phone, Mail, Package, DollarSign, CheckCircle, AlertCircle, Eye, Search } from 'lucide-react'
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../../components/Pagination"

const Dealers = () => {
  const [dealers, setDealers] = useState([])
  const [filteredDealers, setFilteredDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDealer, setEditingDealer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  })

  useEffect(() => {
    fetchDealers()
  }, [])

  useEffect(() => {
    filterDealers()
  }, [dealers, searchTerm])

  const fetchDealers = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend.vercel.app/api/dealers")
      setDealers(response.data)
    } catch (error) {
      toast.error("Error fetching dealers")
    } finally {
      setLoading(false)
    }
  }

  const filterDealers = () => {
    let filtered = dealers

    if (searchTerm) {
      filtered = filtered.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dealer.email && dealer.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredDealers(filtered)
    setCurrentPage(1)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingDealer) {
        await axios.put(
          `https://mobile-booking-backend.vercel.app/api/dealers/${editingDealer._id}`,
          formData,
        )
        toast.success("Dealer updated successfully")
      } else {
        await axios.post("https://mobile-booking-backend.vercel.app/api/dealers", formData)
        toast.success("Dealer created successfully")
      }

      setShowModal(false)
      setEditingDealer(null)
      resetForm()
      fetchDealers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving dealer")
    }
  }

  const handleEdit = (dealer) => {
    setEditingDealer(dealer)
    setFormData({
      name: dealer.name,
      phone: dealer.phone,
      address: dealer.address || "",
      email: dealer.email || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dealer?")) {
      try {
        await axios.delete(`https://mobile-booking-backend.vercel.app/api/dealers/${id}`)
        toast.success("Dealer deleted successfully")
        fetchDealers()
      } catch (error) {
        toast.error("Error deleting dealer")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredDealers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDealers = filteredDealers.slice(startIndex, endIndex)

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dealers Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your dealer network and track their performance</p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search dealers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setEditingDealer(null)
                      resetForm()
                      setShowModal(true)
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dealer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Mobiles
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDealers.map((dealer) => (
                    <tr key={dealer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{dealer.phone}</span>
                          </div>
                          {dealer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{dealer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{dealer.totalMobiles || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            ₹{(dealer.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-green-600 font-medium">
                          ₹{(dealer.paidAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            (dealer.totalAmount || 0) - (dealer.paidAmount || 0) <= 0
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {(dealer.totalAmount || 0) - (dealer.paidAmount || 0) <= 0 ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          ₹{((dealer.totalAmount || 0) - (dealer.paidAmount || 0)).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/dealer-batches/${dealer._id}`}
                            className="text-green-600 hover:text-green-900"
                            title="View Batches"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(dealer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Dealer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dealer._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Dealer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
              totalItems={filteredDealers.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentDealers.map((dealer) => (
              <div key={dealer._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1 truncate">{dealer.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{dealer.phone}</span>
                      </div>
                      {dealer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{dealer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/admin/dealer-batches/${dealer._id}`}
                      className="text-green-600 hover:text-green-900"
                      title="View Batches"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(dealer)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Dealer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dealer._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Dealer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Mobiles</p>
                    <p className="text-sm font-medium text-gray-900">{dealer.totalMobiles || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-sm font-medium text-gray-900">₹{(dealer.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paid Amount</p>
                    <p className="text-sm font-medium text-green-600">₹{(dealer.paidAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        (dealer.totalAmount || 0) - (dealer.paidAmount || 0) <= 0
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {(dealer.totalAmount || 0) - (dealer.paidAmount || 0) <= 0 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      ₹{((dealer.totalAmount || 0) - (dealer.paidAmount || 0)).toLocaleString()}
                    </span>
                  </div>
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
                totalItems={filteredDealers.length}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredDealers.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Try adjusting your search to see more results." : "Add your first dealer to get started!"}
              </p>
              <button
                onClick={() => {
                  setEditingDealer(null)
                  resetForm()
                  setShowModal(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Dealer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingDealer ? "Edit Dealer" : "Add New Dealer"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dealer Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingDealer ? "Update" : "Create"} Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dealers
