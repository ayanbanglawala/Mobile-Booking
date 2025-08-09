import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange
}) {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Page Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Items per page */}
      <div className="flex items-center gap-2 text-sm">
        <span>Items per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border rounded-md p-1 text-sm"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="ml-2 text-muted-foreground">
          Total: {totalItems}
        </span>
      </div>
    </div>
  )
}
