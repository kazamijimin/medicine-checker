"use client";

import React from 'react';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  isDarkMode,
  isVisible,
  onToggle 
}) => {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchType: 'all',
      category: 'all',
      source: 'all',
      sortBy: 'relevance'
    });
  };

  const styles = getStyles(isDarkMode);

  return (
    <div style={styles.container}>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        style={styles.toggleButton}
      >
        <span style={styles.toggleIcon}>
          {isVisible ? '🔽' : '🔼'}
        </span>
        Advanced Filters
        {(filters.searchType !== 'all' || filters.category !== 'all' || filters.source !== 'all') && (
          <span style={styles.activeIndicator}>●</span>
        )}
      </button>

      {/* Filters Panel */}
      {isVisible && (
        <div style={styles.filtersPanel}>
          <div style={styles.filtersGrid}>
            {/* Search Type Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search Type</label>
              <select
                value={filters.searchType}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Types</option>
                <option value="brand">Brand Names Only</option>
                <option value="generic">Generic Names Only</option>
                <option value="active_ingredient">Active Ingredients</option>
              </select>
            </div>

            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Digestive">Digestive</option>
                <option value="Allergy">Allergy</option>
                <option value="Mental Health">Mental Health</option>
              </select>
            </div>

            {/* Source Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Data Source</label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Sources</option>
                <option value="local">Local Database</option>
                <option value="fda">FDA Database</option>
                <option value="rxnav">RxNav Database</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name (A-Z)</option>
                <option value="category">Category</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div style={styles.filterActions}>
            <button
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Clear All Filters
            </button>
            <div style={styles.filterSummary}>
              {getFilterSummary(filters)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getFilterSummary = (filters) => {
  const activeFilters = [];
  
  if (filters.searchType !== 'all') {
    activeFilters.push(`Type: ${filters.searchType.replace('_', ' ')}`);
  }
  if (filters.category !== 'all') {
    activeFilters.push(`Category: ${filters.category}`);
  }
  if (filters.source !== 'all') {
    activeFilters.push(`Source: ${filters.source.toUpperCase()}`);
  }
  if (filters.sortBy !== 'relevance') {
    activeFilters.push(`Sort: ${filters.sortBy}`);
  }

  if (activeFilters.length === 0) {
    return 'No filters applied';
  }

  return `Active filters: ${activeFilters.join(', ')}`;
};

const getStyles = (isDarkMode) => ({
  container: {
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif",
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: `2px solid ${isDarkMode ? '#404040' : '#e9ecef'}`,
    borderRadius: '12px',
    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#333333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  toggleIcon: {
    fontSize: '16px',
  },
  activeIndicator: {
    color: '#28a745',
    fontSize: '12px',
    position: 'absolute',
    right: '15px',
  },
  filtersPanel: {
    marginTop: '15px',
    padding: '20px',
    border: `1px solid ${isDarkMode ? '#404040' : '#e9ecef'}`,
    borderRadius: '12px',
    backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterSelect: {
    padding: '10px 12px',
    border: `2px solid ${isDarkMode ? '#404040' : '#e9ecef'}`,
    borderRadius: '8px',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#333333',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: "'Poppins', sans-serif",
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: `1px solid ${isDarkMode ? '#404040' : '#e9ecef'}`,
    flexWrap: 'wrap',
    gap: '10px',
  },
  clearButton: {
    padding: '8px 16px',
    border: `1px solid ${isDarkMode ? '#dc3545' : '#dc3545'}`,
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', sans-serif",
  },
  filterSummary: {
    fontSize: '12px',
    color: isDarkMode ? '#b0b0b0' : '#6c757d',
    fontStyle: 'italic',
  },
});

export default AdvancedFilters;