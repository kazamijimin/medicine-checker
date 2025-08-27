"use client";

import React from 'react';
import AdvancedFilters from './AdvancedFilters';

const SearchSection = ({
  searchTerm,
  onSearchChange,
  apiLoading,
  searchHistory,
  onQuickSearch,
  filters,
  onFiltersChange,
  isDarkMode,
  showFilters,
  onToggleFilters
}) => {
  const styles = getStyles(isDarkMode);

  return (
    <div style={styles.searchSection}>
      {/* Main Search Input */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder={`Search for medicines${filters.category !== 'all' ? ` in ${filters.category}` : ''} (e.g., Tylenol, Ibuprofen, Metformin)...`}
          value={searchTerm}
          onChange={onSearchChange}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        isDarkMode={isDarkMode}
        isVisible={showFilters}
        onToggle={onToggleFilters}
      />
      
      {/* Loading Indicator */}
      {apiLoading && (
        <div style={styles.loadingIndicator}>
          Searching with filters for {searchTerm}...
        </div>
      )}

      {/* Quick Search Buttons */}
      <div style={styles.quickSearch}>
        <span style={styles.quickSearchLabel}>Quick search: </span>
        {['Tylenol', 'Ibuprofen', 'Aspirin', 'Metformin', 'Lisinopril', 'Omeprazole'].map(term => (
          <button
            key={term}
            onClick={() => onQuickSearch(term)}
            style={styles.quickSearchButton}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div style={styles.searchHistory}>
          <span style={styles.historyLabel}>Recent searches: </span>
          {searchHistory.map(term => (
            <button
              key={term}
              onClick={() => onQuickSearch(term)}
              style={styles.historyButton}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const getStyles = (isDarkMode) => ({
  searchSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
    gap: "16px",
  },
  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },
  searchInput: {
    width: "100%",
    padding: "16px 50px 16px 20px",
    borderRadius: "12px",
    border: `2px solid ${isDarkMode ? '#404040' : '#e9ecef'}`,
    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#333333',
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif",
  },
  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    opacity: 0.6,
  },
  loadingIndicator: {
    fontSize: "14px",
    opacity: 0.7,
    fontStyle: "italic",
    fontFamily: "'Poppins', sans-serif",
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
  },
  quickSearch: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
  },
  quickSearchLabel: {
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.8,
    fontFamily: "'Poppins', sans-serif",
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
  },
  quickSearchButton: {
    padding: "6px 12px",
    borderRadius: "16px",
    border: "1px solid #28a745",
    backgroundColor: "transparent",
    color: "#28a745",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
  },
  searchHistory: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
  },
  historyLabel: {
    fontSize: "12px",
    opacity: 0.6,
    fontFamily: "'Poppins', sans-serif",
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
  },
  historyButton: {
    padding: "4px 8px",
    borderRadius: "12px",
    border: `1px solid ${isDarkMode ? '#6c757d' : '#6c757d'}`,
    backgroundColor: "transparent",
    color: "#6c757d",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "'Poppins', sans-serif",
  },
});

export default SearchSection;