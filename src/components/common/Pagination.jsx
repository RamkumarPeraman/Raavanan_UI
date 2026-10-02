import React, { useId } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange, disabled = false, itemLabel = 'Items', pageSizeOptions = [5, 10, 15, 20, 50, 100] }) => {
  const pageSizeId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, total);
  const navButton = 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8';

  return (
    <nav aria-label="Table pagination" className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 sm:px-4 sm:py-3">
      <span>{itemLabel} {firstItem} – {lastItem} of {total}</span>
      <div className="flex w-full min-w-0 items-center gap-1 sm:w-auto sm:gap-2">
        <label htmlFor={pageSizeId} className="sr-only sm:not-sr-only sm:whitespace-nowrap">{itemLabel} per page</label>
        <select
          id={pageSizeId}
          value={pageSize}
          disabled={disabled}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="mr-auto min-w-0 rounded-md border border-gray-200 bg-white px-1.5 py-1.5 text-xs text-gray-800 focus:border-primary-500 focus:outline-none sm:mr-0 sm:px-2"
        >
          {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <button type="button" aria-label="First page" disabled={disabled || currentPage === 1} onClick={() => onPageChange(1)} className={navButton}><FiChevronsLeft /></button>
        <button type="button" aria-label="Previous page" disabled={disabled || currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className={navButton}><FiChevronLeft /></button>
        <span className="min-w-9 whitespace-nowrap text-center text-gray-900 sm:min-w-12">{currentPage} / {totalPages}</span>
        <button type="button" aria-label="Next page" disabled={disabled || currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className={navButton}><FiChevronRight /></button>
        <button type="button" aria-label="Last page" disabled={disabled || currentPage === totalPages} onClick={() => onPageChange(totalPages)} className={navButton}><FiChevronsRight /></button>
      </div>
    </nav>
  );
};

export default Pagination;
