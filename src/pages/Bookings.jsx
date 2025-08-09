"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import Pagination from "../components/Pagination";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  DollarSign,
  Search,
  Download,
  Smartphone,
  ChevronDown,
  ChevronRight,
  FileText,
  Package,
  Truck,
  UserCheck,
} from "lucide-react";

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [cards, setCards] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Simple mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  // Collapsible state for user cards
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  // Payment modal state
  const [showUserPaymentModal, setShowUserPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState(null);
  // New state for temporary selling prices in the payment modal
  const [tempSellingPrices, setTempSellingPrices] = useState({});

  // Individual price editing state (for table view)
  const [editingPrices, setEditingPrices] = useState({});

  const [formData, setFormData] = useState({
  bookingDate: new Date().toISOString().split('T')[0], // This sets today's date in YYYY-MM-DD format
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
});

  useEffect(() => {
    fetchBookings();
    fetchPlatforms();
    fetchCards();
    if (user?.role === "admin") {
      fetchDealers();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, platformFilter]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "https://mobile-booking-backend.vercel.app/api/bookings"
      );
      setBookings(response.data);
    } catch (error) {
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get(
        "https://mobile-booking-backend.vercel.app/api/platforms"
      );
      setPlatforms(response.data);
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://mobile-booking-backend.vercel.app/api/cards"
      );
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await axios.get(
        "https://mobile-booking-backend.vercel.app/api/dealers"
      );
      setDealers(response.data);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.mobileModel
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.bookingId &&
            booking.bookingId
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (booking.userId?.username &&
            booking.userId.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }
    if (platformFilter) {
      filtered = filtered.filter(
        (booking) => booking.platform === platformFilter
      );
    }
    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  // Group bookings by user and then by batch/bill
  const userGroupedBookings = useMemo(() => {
    const grouped = filteredBookings.reduce((acc, booking) => {
      const userId = booking.userId?._id || "unknown_user";
      const userName = booking.userId?.username || "Unknown User";
      const batchId =
        booking.dealerBatchId?.batchId ||
        `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`; // Fallback for bookings without batchId
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName,
          bills: {},
          totalBookings: 0,
          totalAmount: 0,
          paidAmount: 0,
        };
      }
      if (!acc[userId].bills[batchId]) {
        acc[userId].bills[batchId] = {
          billId: batchId,
          items: [],
          status: "pending", // Default status for a bill
          totalBookingPrice: 0,
          totalSellingPrice: 0,
          isPaid: false,
          canMakePayment: false,
        };
      }
      // Add booking as an item to the bill
      acc[userId].bills[batchId].items.push({
        _id: booking._id,
        mobileModel: booking.mobileModel,
        bookingPrice: booking.bookingPrice,
        sellingPrice: booking.sellingPrice || booking.bookingPrice,
        status: booking.status,
        bookingDate: booking.bookingDate,
        platform: booking.platform,
      });
      // Update bill totals
      acc[userId].bills[batchId].totalBookingPrice += Number(
        booking.bookingPrice
      );
      acc[userId].bills[batchId].totalSellingPrice += Number(
        booking.sellingPrice || booking.bookingPrice
      );
      // Update user totals
      acc[userId].totalBookings += 1;
      acc[userId].totalAmount += Number(booking.bookingPrice);
      if (booking.status === "payment_done") {
        acc[userId].paidAmount += Number(
          booking.sellingPrice || booking.bookingPrice
        );
      }
      // Determine bill status and payment eligibility
      const allItemsPaid = acc[userId].bills[batchId].items.every(
        (item) => item.status === "payment_done"
      );
      const allItemsGivenToAdmin = acc[userId].bills[batchId].items.every(
        (item) => item.status === "given_to_dealer"
      );
      acc[userId].bills[batchId].isPaid = allItemsPaid;
      acc[userId].bills[batchId].status = allItemsPaid ? "paid" : "pending"; // Update bill status based on items
      acc[userId].bills[batchId].canMakePayment =
        allItemsGivenToAdmin && !allItemsPaid;
      return acc;
    }, {});
    return Object.values(grouped).map((user) => ({
      ...user,
      bills: Object.values(user.bills),
    }));
  }, [filteredBookings]);

  // Pagination logic for table view
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            : formData;
        await axios.put(
          `https://mobile-booking-backend.vercel.app/api/bookings/${editingBooking._id}`,
          dataToSend
        );
        toast.success("Booking updated successfully! ✅");
      } else {
        await axios.post(
          "https://mobile-booking-backend.vercel.app/api/bookings",
          formData
        );
        toast.success("Booking created successfully! 🎉");
      }
      setShowModal(false);
      setEditingBooking(null);
      resetForm();
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving booking");
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
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
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(
          `https://mobile-booking-backend.vercel.app/api/bookings/${id}`
        );
        toast.success("Booking deleted successfully! 🗑️");
        fetchBookings();
      } catch (error) {
        toast.error("Error deleting booking");
      }
    }
  };

  // Replace the old function with THIS ONE
const handleStatusChange = async (id, status) => {
  // Create a user-friendly message from the status string (e.g., "given_to_admin" -> "given to admin")
  const actionText = status.replace(/_/g, " ");
  const confirmationMessage = `Are you sure you want to mark this booking as "${actionText}"?`;

  // Use window.confirm to show the popup
  if (window.confirm(confirmationMessage)) {
    try {
      await axios.patch(
        `https://mobile-booking-backend.vercel.app/api/bookings/${id}/status`,
        {
          status,
        }
      );
      toast.success("Status updated successfully! ✅");
      fetchBookings();
    } catch (error) {
      toast.error("Error updating status");
    }
  }
};

  const handleMarkBillPaymentClick = (userInfo, bill) => {
    setSelectedBillForPayment(bill);
    setSelectedUserForPayment(userInfo);
    // Initialize tempSellingPrices with current selling prices from the bill items
    const initialPrices = Object.fromEntries(
      bill.items.map((item) => [item._id, item.sellingPrice])
    );
    setTempSellingPrices(initialPrices);
    setShowUserPaymentModal(true);
  };

  const handleBillPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBillForPayment || !selectedUserForPayment) return;

    try {
      // Update all items in the bill to payment_done status with their potentially edited selling prices
      const updatePromises = selectedBillForPayment.items.map((item) => {
        const newSellingPrice = tempSellingPrices[item._id];
        if (!newSellingPrice || isNaN(Number(newSellingPrice))) {
          throw new Error(`Invalid selling price for item ${item.mobileModel}`);
        }
        return axios.patch(
          `https://mobile-booking-backend.vercel.app/api/bookings/${item._id}/mark-user-paid`,
          {
            sellingPrice: Number(newSellingPrice),
          }
        );
      });
      await Promise.all(updatePromises);
      toast.success("All payments in the bill have been processed! ✅");
      setShowUserPaymentModal(false);
      setSelectedBillForPayment(null);
      setSelectedUserForPayment(null);
      setTempSellingPrices({}); // Clear temp prices
      fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error processing bill payment."
      );
    }
  };

  // Handle individual item price update (for table view)
  const handleItemPriceUpdate = async (bookingId, newSellingPrice) => {
    if (!newSellingPrice || isNaN(Number(newSellingPrice))) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      await axios.put(
        `https://mobile-booking-backend.vercel.app/api/bookings/${bookingId}`,
        {
          sellingPrice: Number(newSellingPrice),
        }
      );
      toast.success("Selling price updated successfully! 💰");
      fetchBookings();
      // Clear the editing state for this item
      setEditingPrices((prev) => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating selling price."
      );
    }
  };

  // Generate PDF bill
  const handleGenerateBillPdf = (userInfo, bill) => {
    // Create new PDF document
    const doc = new jsPDF();

    // Add title and user information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MOBILE BOOKING BILL", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Bill for: ${userInfo.userName}`, 105, 30, { align: "center" });

    // Bill details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Bill ID: ${bill.billId}`, 14, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 48);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 14, 56);

    // Prepare table data
    const tableData = bill.items.map((item, index) => [
      index + 1,
      item.mobileModel,
      item.bookingPrice,
      item.sellingPrice,
      new Date(item.bookingDate).toLocaleDateString(),
    ]);

    // Add table using autoTable
    autoTable(doc, {
      startY: 65,
      head: [
        ["#", "Mobile Model", "Booking Price", "Selling Price", "Booking Date"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 40, halign: "left" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 25, halign: "center" },
      },
      margin: { top: 65 },
      tableWidth: "wrap",
      halign: "center",
    });

    // Get the final Y position after the table
    const finalY = doc.lastAutoTable.finalY + 15;

    // Add summary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SUMMARY", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total Items: ${bill.items.length}`, 14, finalY + 10);
    doc.text(
      `Total Booking Amount: ${bill.totalBookingPrice.toLocaleString()}`,
      14,
      finalY + 18
    );
    doc.text(
      `Total Selling Amount: ${bill.totalSellingPrice.toLocaleString()}`,
      14,
      finalY + 26
    );

    const profitLoss = bill.totalSellingPrice - bill.totalBookingPrice;
    const profitLossColor = profitLoss >= 0 ? [0, 128, 0] : [255, 0, 0]; // Green for profit, red for loss
    doc.setTextColor(...profitLossColor);
    doc.text(`Profit/Loss: ${profitLoss.toLocaleString()}`, 14, finalY + 34);
    doc.setTextColor(0, 0, 0); // Reset to black

    doc.text(
      `Payment Status: ${bill.isPaid ? "PAID" : "PENDING"}`,
      14,
      finalY + 42
    );

    if (bill.isPaid) {
      doc.setTextColor(0, 128, 0);
      doc.text(`Payment Received`, 14, finalY + 50);
      doc.setTextColor(0, 0, 0);
    }

    // Add footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, {
      align: "center",
    });

    // Save the PDF
    const fileName = `Bill_${bill.billId}_${userInfo.userName.replace(
      /\s/g,
      "_"
    )}.pdf`;
    doc.save(fileName);

    // Optional: Show success message
    toast.success("Bill PDF generated and downloaded! 📄");
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
  setFormData({
    bookingDate: new Date().toISOString().split('T')[0], // Today's date
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
  });
};

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      delivered: { color: "bg-blue-100 text-blue-800", label: "Delivered" },
      given_to_admin: {
        color: "bg-purple-100 text-purple-800",
        label: "Given to Admin",
      },
      given_to_dealer: {
        color: "bg-orange-100 text-orange-800",
        label: "Given to Dealer",
      },
      payment_done: {
        color: "bg-green-100 text-green-800",
        label: "Payment Done",
      },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" }, // For bill status
    };
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getProfitLossDisplay = (bookingPrice, sellingPrice) => {
    if (
      sellingPrice === undefined ||
      sellingPrice === null ||
      sellingPrice === ""
    ) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          N/A
        </span>
      );
    }
    const profitLoss = Number(sellingPrice) - Number(bookingPrice);
    const isProfit = profitLoss >= 0;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isProfit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isProfit ? "+" : ""}
        {Math.abs(profitLoss).toLocaleString()}
      </span>
    );
  };

  // Get appropriate action buttons based on status and user role
  const getActionButtons = (booking) => {
    const buttons = [];
    // Always show edit and delete for admin, only edit for users on their own bookings
    if (user.role === "admin" || booking.userId?._id === user.id || user.role === "user") {
      buttons.push(
        <button
          key="edit"
          onClick={() => handleEdit(booking)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          title="Edit Booking"
        >
          <Edit className="h-3 w-3" />
          Edit
        </button>
      );
    }
    if (user.role === "admin" || user.role === "user") {
      buttons.push(
        <button
          key="delete"
          onClick={() => handleDelete(booking._id)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
          title="Delete Booking"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      );
    }
    // Status-based action buttons with proper labels
    if (booking.status === "pending") {
      buttons.push(
        <button
          key="delivered"
          onClick={() => handleStatusChange(booking._id, "delivered")}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
          title="Mark as Delivered"
        >
          <Truck className="h-3 w-3" />
          Mark Delivered
        </button>
      );
    } else if (booking.status === "delivered") {
      buttons.push(
        <button
          key="given_to_admin"
          onClick={() => handleStatusChange(booking._id, "given_to_admin")}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
          title="Give to Admin"
        >
          <UserCheck className="h-3 w-3" />
          Give to Admin
        </button>
      );
    }
    return buttons;
  };

  const allStatuses = [
    "pending",
    "delivered",
    "given_to_admin",
    "given_to_dealer",
    "payment_done",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Mobile Bookings
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage all your mobile phone bookings in one place
            </p>
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
                      <option key={platform._id} value={`${platform.accountAlias}-${platform.name}`}>
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
                      setEditingBooking(null);
                      resetForm();
                      setShowModal(true);
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

          {/* Admin View - Desktop Table View with User Grouping */}
          {user.role === "admin" && (
            <div className="hidden md:block space-y-4">
              {userGroupedBookings.length > 0 ? (
                userGroupedBookings.map((userBooking) => (
                  <div
                    key={userBooking.userId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* User Header - Collapsible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                      onClick={() => toggleUserExpansion(userBooking.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center text-sm font-medium">
                            {userBooking.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {userBooking.userName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {userBooking.totalBookings} bookings • Total: ₹
                              {userBooking.totalAmount.toLocaleString()} • Paid:
                              ₹{userBooking.paidAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              userBooking.paidAmount >= userBooking.totalAmount
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {userBooking.paidAmount >= userBooking.totalAmount
                              ? "Fully Paid"
                              : "Pending Payment"}
                          </span>
                          {expandedUsers.has(userBooking.userId) ? (
                            <ChevronDown className="h-6 w-6 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Bills and Items */}
                    {expandedUsers.has(userBooking.userId) && (
                      <div className="p-4 space-y-6">
                        {userBooking.bills.map((bill) => (
                          <div
                            key={bill.billId}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Bill Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Package className="h-5 w-5 text-gray-500" />
                                  <span className="font-medium text-gray-900">
                                    Batch {bill.billId}
                                  </span>
                                  {getStatusBadge(bill.status)}
                                  <span className="text-sm text-gray-600">
                                    {bill.items.length} items • ₹
                                    {bill.totalSellingPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      handleGenerateBillPdf(userBooking, bill)
                                    }
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Generate PDF"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Download PDF
                                  </button>
                                  {bill.canMakePayment && (
                                    <button
                                      onClick={() =>
                                        handleMarkBillPaymentClick(
                                          userBooking,
                                          bill
                                        )
                                      }
                                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                      title="Process Payment for All Items"
                                    >
                                      <DollarSign className="h-4 w-4" />
                                      Make Payment
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bill Items Table */}
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Mobile Model
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
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
                                  {bill.items.map((item) => (
                                    <tr
                                      key={item._id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <Smartphone className="w-4 h-4 text-gray-400" />
                                          <span className="text-sm font-medium text-gray-900">
                                            {item.mobileModel}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(
                                          item.bookingDate
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{item.bookingPrice.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                          {editingPrices[item._id] ? (
                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="number"
                                                value={editingPrices[item._id]}
                                                onChange={(e) =>
                                                  setEditingPrices((prev) => ({
                                                    ...prev,
                                                    [item._id]: e.target.value,
                                                  }))
                                                }
                                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                                                placeholder="Price"
                                              />
                                              <button
                                                onClick={() =>
                                                  handleItemPriceUpdate(
                                                    item._id,
                                                    editingPrices[item._id]
                                                  )
                                                }
                                                className="text-green-600 hover:text-green-800"
                                                title="Save Price"
                                              >
                                                <Check className="h-4 w-4" />
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                setEditingPrices((prev) => ({
                                                  ...prev,
                                                  [item._id]: item.sellingPrice,
                                                }))
                                              }
                                              className="text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                                              title="Click to edit selling price - You can change this amount"
                                            >
                                              ₹
                                              {item.sellingPrice.toLocaleString()}{" "}
                                              ✏️
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        {getProfitLossDisplay(
                                          item.bookingPrice,
                                          item.sellingPrice
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.platform}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(item.status)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                                          {getActionButtons(
                                            bookings.find(
                                              (b) => b._id === item._id
                                            )
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Bill Summary Footer */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-6">
                                  <div>
                                    <span className="text-sm text-gray-600">
                                      Total Booking:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      ₹{bill.totalBookingPrice.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-600">
                                      Total Selling:{" "}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      ₹{bill.totalSellingPrice.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-600">
                                      Profit/Loss:{" "}
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        bill.totalSellingPrice >=
                                        bill.totalBookingPrice
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {bill.totalSellingPrice >=
                                      bill.totalBookingPrice
                                        ? "+"
                                        : ""}
                                      ₹
                                      {(
                                        bill.totalSellingPrice -
                                        bill.totalBookingPrice
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {bill.items.length} item
                                  {bill.items.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                  <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter || platformFilter
                      ? "Try adjusting your filters to see more results."
                      : "Create your first booking to get started!"}
                  </p>
                  <button
                    onClick={() => {
                      setEditingBooking(null);
                      resetForm();
                      setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Booking
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User View - Simple Table (Hidden on mobile) */}
          {user.role === "user" && (
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                            <div className="text-sm font-medium text-gray-900">
                              {booking.mobileModel}
                            </div>
                            {booking.bookingId && (
                              <div className="text-sm text-gray-500">
                                ID: {booking.bookingId}
                              </div>
                            )}
                            {booking.dealerBatchId?.batchId && (
                              <div className="text-sm text-gray-500">
                                Batch: {booking.dealerBatchId.batchId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{booking.bookingPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.sellingPrice
                            ? `₹${booking.sellingPrice.toLocaleString()}`
                            : "Not Set"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getProfitLossDisplay(
                            booking.bookingPrice,
                            booking.sellingPrice
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            {getActionButtons(booking)}
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
          )}

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {/* Admin Mobile View - Collapsible */}
            {user.role === "admin" ? (
              userGroupedBookings.length > 0 ? (
                userGroupedBookings.map((userBooking) => (
                  <div
                    key={userBooking.userId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    {/* User Header - Collapsible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleUserExpansion(userBooking.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium">
                            {userBooking.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-gray-900">
                              {userBooking.userName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {userBooking.totalBookings} bookings • ₹
                              {userBooking.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              userBooking.paidAmount >= userBooking.totalAmount
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {userBooking.paidAmount >= userBooking.totalAmount
                              ? "Paid"
                              : "Pending"}
                          </span>
                          {expandedUsers.has(userBooking.userId) ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Bills */}
                    {expandedUsers.has(userBooking.userId) && (
                      <div className="border-t border-gray-200 p-4 space-y-4">
                        {userBooking.bills.map((bill) => (
                          <div
                            key={bill.billId}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            {/* Bill Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  Batch {bill.billId}
                                </span>
                                {getStatusBadge(bill.status)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleGenerateBillPdf(userBooking, bill)
                                  }
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Generate PDF"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
                                {bill.canMakePayment && (
                                  <button
                                    onClick={() =>
                                      handleMarkBillPaymentClick(
                                        userBooking,
                                        bill
                                      )
                                    }
                                    className="text-green-600 hover:text-green-800"
                                    title="Process Payment"
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Bill Items */}
                            <div className="space-y-2">
                              {bill.items.map((item) => (
                                <div
                                  key={item._id}
                                  className="bg-white rounded p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">
                                        {item.mobileModel}
                                      </h4>
                                      <p className="text-xs text-gray-500">
                                        {item.platform} •{" "}
                                        {new Date(
                                          item.bookingDate
                                        ).toLocaleDateString()}
                                      </p>
                                      <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-xs text-gray-600">
                                          Booking: ₹
                                          {item.bookingPrice.toLocaleString()}
                                        </span>
                                        {getStatusBadge(item.status)}
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="flex items-center space-x-2">
                                        {editingPrices[item._id] ? (
                                          <div className="flex items-center space-x-1">
                                            <input
                                              type="number"
                                              value={editingPrices[item._id]}
                                              onChange={(e) =>
                                                setEditingPrices((prev) => ({
                                                  ...prev,
                                                  [item._id]: e.target.value,
                                                }))
                                              }
                                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                                              placeholder="Price"
                                            />
                                            <button
                                              onClick={() =>
                                                handleItemPriceUpdate(
                                                  item._id,
                                                  editingPrices[item._id]
                                                )
                                              }
                                              className="text-green-600 hover:text-green-800"
                                            >
                                              <Check className="h-3 w-3" />
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              setEditingPrices((prev) => ({
                                                ...prev,
                                                [item._id]: item.sellingPrice,
                                              }))
                                            }
                                            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded bg-blue-50"
                                            title="Tap to edit selling price"
                                          >
                                            ₹
                                            {item.sellingPrice.toLocaleString()}{" "}
                                            ✏️
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center space-x-2 flex-wrap gap-1">
                                    {getActionButtons(
                                      bookings.find((b) => b._id === item._id)
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Bill Summary */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">
                                  Total Amount:
                                </span>
                                <span className="font-bold text-gray-900">
                                  ₹{bill.totalSellingPrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                                <span>Profit/Loss:</span>
                                <span
                                  className={`font-medium ${
                                    bill.totalSellingPrice >=
                                    bill.totalBookingPrice
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {bill.totalSellingPrice >=
                                  bill.totalBookingPrice
                                    ? "+"
                                    : ""}
                                  ₹
                                  {(
                                    bill.totalSellingPrice -
                                    bill.totalBookingPrice
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || statusFilter || platformFilter
                      ? "Try adjusting your filters to see more results."
                      : "Create your first booking to get started!"}
                  </p>
                  <button
                    onClick={() => {
                      setEditingBooking(null);
                      resetForm();
                      setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Booking
                  </button>
                </div>
              )
            ) : /* User Mobile View - Simple Cards */
            currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 mb-1 truncate">
                        {booking.mobileModel}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          {booking.platform} •{" "}
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          {booking.card}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Booking Price
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{booking.bookingPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Selling Price
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.sellingPrice
                          ? `₹${booking.sellingPrice.toLocaleString()}`
                          : "Not Set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Profit/Loss</p>
                      {getProfitLossDisplay(
                        booking.bookingPrice,
                        booking.sellingPrice
                      )}
                    </div>
                    <div>{getStatusBadge(booking.status)}</div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-3">
                      <div className="flex items-center space-x-2">
                      {getActionButtons(booking)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter || platformFilter
                    ? "Try adjusting your filters to see more results."
                    : "Create your first booking to get started!"}
                </p>
                <button
                  onClick={() => {
                    setEditingBooking(null);
                    resetForm();
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Booking
                </button>
              </div>
            )}
            {/* Mobile Pagination */}
            {user.role === "user" && totalPages > 1 && (
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
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBooking ? "Edit Booking" : "Add New Booking"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Model
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Price
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (Optional)
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
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
                      <option key={platform._id} value={`${platform.accountAlias}-${platform.name}`}>
                        {platform.name} - {platform.accountAlias}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card
                  </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking ID (Admin Set)
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dealer (Admin Set)
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To Dealer
                      </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dealer Amount
                    </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBooking ? "Update Booking" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showUserPaymentModal &&
        selectedBillForPayment &&
        selectedUserForPayment && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Process Bill Payment
                </h3>
                <button
                  onClick={() => setShowUserPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleBillPaymentSubmit} className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Bill Details:
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    User: <strong>{selectedUserForPayment.userName}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Bill ID: <strong>{selectedBillForPayment.billId}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Items:{" "}
                    <strong>{selectedBillForPayment.items.length}</strong>
                  </p>
                </div>
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Items to be paid:
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                    {selectedBillForPayment.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.mobileModel}
                          </p>
                          <p className="text-xs text-gray-500">
                            Booking: ₹{item.bookingPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                          <label
                            htmlFor={`sellingPrice-${item._id}`}
                            className="sr-only"
                          >
                            Selling Price for {item.mobileModel}
                          </label>
                          <input
                            id={`sellingPrice-${item._id}`}
                            type="number"
                            value={tempSellingPrices[item._id] || ""}
                            onChange={(e) =>
                              setTempSellingPrices((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Selling Price"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Total Amount (based on current selling prices):
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹
                      {Object.values(tempSellingPrices)
                        .reduce((sum, price) => sum + Number(price || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Profit/Loss:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        Object.values(tempSellingPrices).reduce(
                          (sum, price) => sum + Number(price || 0),
                          0
                        ) >= selectedBillForPayment.totalBookingPrice
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {Object.values(tempSellingPrices).reduce(
                        (sum, price) => sum + Number(price || 0),
                        0
                      ) >= selectedBillForPayment.totalBookingPrice
                        ? "+"
                        : ""}
                      ₹
                      {(
                        Object.values(tempSellingPrices).reduce(
                          (sum, price) => sum + Number(price || 0),
                          0
                        ) - selectedBillForPayment.totalBookingPrice
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUserPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Process All Payments
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default Bookings;
