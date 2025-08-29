"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('searches');
  
  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserHistory(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load user's search history
  const loadUserHistory = async (userId) => {
    try {
      const historyRef = collection(db, "searchHistory");
      const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSearchHistory(history);
      setFilteredHistory(history);
    } catch (error) {
      console.error("Error loading history:", error);
      showNotification('Failed to load search history.', 'error');
    }
  };

  // Filter history based on search term and type
  useEffect(() => {
    let filtered = searchHistory;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.searchQuery?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.resultType === filterType);
    }

    setFilteredHistory(filtered);
  }, [searchHistory, searchTerm, filterType]);

  // Add item to history (called from other pages)
  const addToHistory = async (searchData) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "searchHistory"), {
        userId: user.uid,
        ...searchData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error adding to history:", error);
    }
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    setDeleting(true);
    try {
      const deletePromises = selectedItems.map(itemId => 
        deleteDoc(doc(db, "searchHistory", itemId))
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      setSearchHistory(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      
      showNotification(`Deleted ${selectedItems.length} item(s) successfully!`, 'success');
    } catch (error) {
      console.error("Error deleting items:", error);
      showNotification('Failed to delete items. Please try again.', 'error');
    }
    setDeleting(false);
  };

  // Clear all history
  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const deletePromises = searchHistory.map(item => 
        deleteDoc(doc(db, "searchHistory", item.id))
      );
      
      await Promise.all(deletePromises);
      
      setSearchHistory([]);
      setFilteredHistory([]);
      setSelectedItems([]);
      
      showNotification('All search history cleared successfully!', 'success');
    } catch (error) {
      console.error("Error clearing history:", error);
      showNotification('Failed to clear history. Please try again.', 'error');
    }
    setDeleting(false);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get result type icon
  const getResultTypeIcon = (type) => {
    switch (type) {
      case 'verified': return '✅';
      case 'warning': return '⚠️';
      case 'unknown': return '❓';
      case 'expired': return '⏰';
      default: return '🔍';
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      max-width: 400px;
      word-wrap: break-word;
      font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading your history...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Header */}
        <div style={currentStyles.header}>
          <div style={currentStyles.headerContent}>
            <h1 style={currentStyles.headerTitle}>
              <span style={currentStyles.headerIcon}>📚</span>
              Search History
            </h1>
            <p style={currentStyles.headerSubtitle}>
              Track your medicine searches and verification history
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>
          
          {/* Stats Cards */}
          <div style={currentStyles.statsGrid}>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>🔍</div>
              <div style={currentStyles.statValue}>{searchHistory.length}</div>
              <div style={currentStyles.statLabel}>Total Searches</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>✅</div>
              <div style={currentStyles.statValue}>
                {searchHistory.filter(item => item.resultType === 'verified').length}
              </div>
              <div style={currentStyles.statLabel}>Verified Medicines</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>⚠️</div>
              <div style={currentStyles.statValue}>
                {searchHistory.filter(item => item.resultType === 'warning').length}
              </div>
              <div style={currentStyles.statLabel}>Warnings Found</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>📅</div>
              <div style={currentStyles.statValue}>
                {searchHistory.length > 0 ? formatDate(searchHistory[0].timestamp) : 'None'}
              </div>
              <div style={currentStyles.statLabel}>Last Search</div>
            </div>
          </div>

          {/* Controls */}
          <div style={currentStyles.controlsSection}>
            <div style={currentStyles.searchControls}>
              <input
                type="text"
                placeholder="Search in history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={currentStyles.searchInput}
              />
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={currentStyles.filterSelect}
              >
                <option value="all">All Results</option>
                <option value="verified">Verified</option>
                <option value="warning">Warnings</option>
                <option value="unknown">Unknown</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div style={currentStyles.actionControls}>
              {selectedItems.length > 0 && (
                <button
                  onClick={deleteSelectedItems}
                  style={currentStyles.deleteButton}
                  disabled={deleting}
                >
                  {deleting ? '⏳ Deleting...' : `🗑️ Delete (${selectedItems.length})`}
                </button>
              )}
              
              <button
                onClick={selectAllItems}
                style={currentStyles.selectAllButton}
              >
                {selectedItems.length === filteredHistory.length && filteredHistory.length > 0 
                  ? '❌ Deselect All' 
                  : '✅ Select All'
                }
              </button>
              
              {searchHistory.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  style={currentStyles.clearAllButton}
                  disabled={deleting}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div style={currentStyles.historySection}>
            {filteredHistory.length === 0 ? (
              <div style={currentStyles.emptyState}>
                <div style={currentStyles.emptyIcon}>📭</div>
                <h3 style={currentStyles.emptyTitle}>
                  {searchHistory.length === 0 ? 'No Search History' : 'No Results Found'}
                </h3>
                <p style={currentStyles.emptyText}>
                  {searchHistory.length === 0 
                    ? 'Start searching for medicines to build your history.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                <button
                  onClick={() => router.push('/')}
                  style={currentStyles.emptyButton}
                >
                  🔍 Search Medicines
                </button>
              </div>
            ) : (
              <div style={currentStyles.historyList}>
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...currentStyles.historyItem,
                      ...(selectedItems.includes(item.id) ? currentStyles.historyItemSelected : {})
                    }}
                  >
                    <div style={currentStyles.historyItemHeader}>
                      <label style={currentStyles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          style={currentStyles.checkbox}
                        />
                        <span style={currentStyles.resultTypeIcon}>
                          {getResultTypeIcon(item.resultType)}
                        </span>
                      </label>
                      
                      <div style={currentStyles.historyItemInfo}>
                        <h4 style={currentStyles.historyItemTitle}>
                          {item.medicineName || item.searchQuery || 'Unknown Medicine'}
                        </h4>
                        <p style={currentStyles.historyItemTime}>
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      
                      <div style={currentStyles.historyItemMeta}>
                        <span style={currentStyles.resultTypeBadge}>
                          {item.resultType || 'unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p style={currentStyles.historyItemDescription}>
                        {item.description}
                      </p>
                    )}
                    
                    {item.batchNumber && (
                      <div style={currentStyles.historyItemDetails}>
                        <span style={currentStyles.detailLabel}>Batch:</span>
                        <span style={currentStyles.detailValue}>{item.batchNumber}</span>
                      </div>
                    )}
                    
                    {item.manufacturer && (
                      <div style={currentStyles.historyItemDetails}>
                        <span style={currentStyles.detailLabel}>Manufacturer:</span>
                        <span style={currentStyles.detailValue}>{item.manufacturer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// Base Styles
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "60px"
  },
  
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    paddingTop: "60px"
  },
  
  loadingSpinner: {
    textAlign: "center"
  },
  
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  },
  
  loadingText: {
    fontSize: "16px",
    color: "#6c757d"
  },
  
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "60px 20px 40px",
    textAlign: "center",
    color: "white"
  },
  
  headerContent: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  
  headerTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
  },
  
  headerIcon: {
    fontSize: "48px"
  },
  
  headerSubtitle: {
    fontSize: "18px",
    opacity: 0.9,
    lineHeight: "1.6"
  },
  
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px"
  },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px"
  },
  
  statCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    textAlign: "center",
    backgroundColor: "#ffffff"
  },
  
  statIcon: {
    fontSize: "32px",
    marginBottom: "12px"
  },
  
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#10b981",
    marginBottom: "4px"
  },
  
  statLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500"
  },
  
  controlsSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    gap: "20px",
    flexWrap: "wrap"
  },
  
  searchControls: {
    display: "flex",
    gap: "12px",
    flex: 1,
    minWidth: "300px"
  },
  
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif"
  },
  
  filterSelect: {
    padding: "12px 16px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#ffffff"
  },
  
  actionControls: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  
  deleteButton: {
    padding: "12px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  selectAllButton: {
    padding: "12px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  clearAllButton: {
    padding: "12px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  historySection: {
    minHeight: "400px"
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6c757d"
  },
  
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "24px"
  },
  
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px"
  },
  
  emptyText: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "24px"
  },
  
  emptyButton: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  
  historyItem: {
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease"
  },
  
  historyItemSelected: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.05)"
  },
  
  historyItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px"
  },
  
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#10b981"
  },
  
  resultTypeIcon: {
    fontSize: "20px"
  },
  
  historyItemInfo: {
    flex: 1
  },
  
  historyItemTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#374151"
  },
  
  historyItemTime: {
    fontSize: "14px",
    color: "#6c757d"
  },
  
  historyItemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  
  resultTypeBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    backgroundColor: "#e9ecef",
    color: "#374151"
  },
  
  historyItemDescription: {
    fontSize: "14px",
    color: "#6c757d",
    lineHeight: "1.5",
    marginBottom: "8px"
  },
  
  historyItemDetails: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    marginBottom: "4px"
  },
  
  detailLabel: {
    fontWeight: "600",
    color: "#374151"
  },
  
  detailValue: {
    color: "#6c757d"
  }
};

// Light Theme Styles
const lightStyles = {
  ...baseStyles
};

// Dark Theme Styles
const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff"
  },
  
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  
  searchInput: {
    ...baseStyles.searchInput,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  
  filterSelect: {
    ...baseStyles.filterSelect,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  
  historyItem: {
    ...baseStyles.historyItem,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  
  historyItemSelected: {
    ...baseStyles.historyItemSelected,
    backgroundColor: "rgba(16, 185, 129, 0.1)"
  },
  
  historyItemTitle: {
    ...baseStyles.historyItemTitle,
    color: "#e9ecef"
  },
  
  detailLabel: {
    ...baseStyles.detailLabel,
    color: "#e9ecef"
  },
  
  resultTypeBadge: {
    ...baseStyles.resultTypeBadge,
    backgroundColor: "#404040",
    color: "#e9ecef"
  }
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    @media (max-width: 768px) {
      .controls-section {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      
      .search-controls {
        min-width: auto !important;
      }
      
      .action-controls {
        justify-content: center !important;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
    
    .delete-button:hover {
      background-color: #dc2626 !important;
      transform: translateY(-2px);
    }
    
    .select-all-button:hover,
    .empty-button:hover {
      background-color: #0d9488 !important;
      transform: translateY(-2px);
    }
    
    .clear-all-button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-2px);
    }
    
    .history-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}