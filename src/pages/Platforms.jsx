"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import Pagination from "../components/Pagination"
import { Store, Plus, Edit, Trash2, Search, Calendar, Building } from "lucide-react"

const Platforms = () => {
  const [platforms, setPlatforms] = useState([])
  const [filteredPlatforms, setFilteredPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    accountAlias: "",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchPlatforms()
  }, [])

  useEffect(() => {
    filterPlatforms()
  }, [platforms, searchTerm])

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get("https://mobile-booking-backend-production.up.railway.app/api/platforms")
      setPlatforms(response.data)
    } catch (error) {
      toast.error("Error fetching platforms")
    } finally {
      setLoading(false)
    }
  }

  const filterPlatforms = () => {
    let filtered = platforms

    if (searchTerm) {
      filtered = filtered.filter(
        (platform) =>
          platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          platform.accountAlias.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredPlatforms(filtered)
    setCurrentPage(1)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredPlatforms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPlatforms = filteredPlatforms.slice(startIndex, endIndex)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingPlatform) {
        await axios.put(`https://mobile-booking-backend-production.up.railway.app/api/platforms/${editingPlatform._id}`, formData)
        toast.success("Platform updated successfully! ✅")
      } else {
        await axios.post("https://mobile-booking-backend-production.up.railway.app/api/platforms", formData)
        toast.success("Platform added successfully! 🎉")
      }

      setShowModal(false)
      setEditingPlatform(null)
      resetForm()
      fetchPlatforms()
    } catch (error) {
      toast.error("Error saving platform")
    }
  }

  const handleEdit = (platform) => {
    setEditingPlatform(platform)
    setFormData({
      name: platform.name,
      accountAlias: platform.accountAlias,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this platform?")) {
      try {
        await axios.delete(`https://mobile-booking-backend-production.up.railway.app/api/platforms/${id}`)
        toast.success("Platform deleted successfully! 🗑️")
        fetchPlatforms()
      } catch (error) {
        toast.error("Error deleting platform")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      accountAlias: "",
    })
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">E-commerce Platforms</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your e-commerce platform accounts</p>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingPlatform(null)
                    resetForm()
                    setShowModal(true)
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </button>
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
                      Platform Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Alias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPlatforms.map((platform) => (
                    <tr key={platform._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Store className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{platform.accountAlias}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(platform.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(platform)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Platform"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(platform._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Platform"
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
              totalItems={filteredPlatforms.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentPlatforms.map((platform) => (
              <div key={platform._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                      <Store className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">{platform.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{platform.accountAlias}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(platform)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Platform"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(platform._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Platform"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created: {new Date(platform.createdAt).toLocaleDateString()}
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
                totalItems={filteredPlatforms.length}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredPlatforms.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No platforms found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search to see more results."
                  : "Add your first e-commerce platform to get started!"}
              </p>
              <button
                onClick={() => {
                  setEditingPlatform(null)
                  resetForm()
                  setShowModal(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Platform
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPlatform ? "Edit Platform" : "Add New Platform"}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Amazon, Flipkart, Myntra"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Alias</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="accountAlias"
                    value={formData.accountAlias}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Amazon - John's Account, Flipkart - Business"
                    required
                  />
                </div>
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
                  {editingPlatform ? "Update Platform" : "Add Platform"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Platforms
