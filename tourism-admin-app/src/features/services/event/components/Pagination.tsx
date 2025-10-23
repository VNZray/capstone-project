import React from "react";
import Text from "../../../../components/Text";
import "../../../../components/styles/Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
  const pages: React.ReactNode[] = [];
    const maxVisiblePages = 7;
    if (totalPages <= 1) return pages;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          <Text 
            variant="normal" 
            color={currentPage === i ? 'white' : 'text-color'}
          >
            {i}
          </Text>
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <Text variant="normal" color="text-color">
          {'<'} Previous
        </Text>
      </button>
      
      <div className="page-numbers">
        {renderPageNumbers()}
      </div>
      
      <button
        className="pagination-button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <Text variant="normal" color="text-color">
          Next {'>'}
        </Text>
      </button>
    </div>
  );
};

export default Pagination;