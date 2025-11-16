"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function RecentSearches({ recentSearches = [], isDarkMode }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searches, setSearches] = useState(recentSearches);
  const [loading, setLoading] = useState(false);
  const [lastSearchCount, setLastSearchCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for new searches
  useEffect(() => {
    if (user) {
      const searchesQuery = query(
        collection(db, "searches"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(searchesQuery, (snapshot) => {
        const newSearches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Check for new searches and show notification
        if (lastSearchCount > 0 && newSearches.length > lastSearchCount) {
          const newSearchCount = newSearches.length - lastSearchCount;
          showNotification(`${newSearchCount} new search${newSearchCount > 1 ? 'es' : ''} added!`, 'info');
        }
        
        setSearches(newSearches.slice(0, 5)); // Only show 5 most recent
        setLastSearchCount(newSearches.length);
      });

      return () => unsubscribe();
    }
  }, [user, lastSearchCount]);

  // Initialize with prop data
  useEffect(() => {
    setSearches(recentSearches);
    setLastSearchCount(recentSearches.length);
  }, [recentSearches]);

  const showNotification = (message, type = 'info') => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.search-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'search-notification';
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
      background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
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
    }, 4000);
  };

  const refreshSearches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const searchesQuery = query(
        collection(db, "searches"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      
      const snapshot = await getDocs(searchesQuery);
      const freshSearches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSearches(freshSearches);
      showNotification('Search history refreshed!', 'success');
    } catch (error) {
      console.error("Error refreshing searches:", error);
      showNotification('Failed to refresh search history', 'error');
    }
    setLoading(false);
  };

  const handleSearchItemClick = (search) => {
    // Navigate to medicine details page or search again
    if (search.medicineName) {
      router.push(`/?search=${encodeURIComponent(search.medicineName)}`);
      showNotification(`Searching for ${search.medicineName} again...`, 'info');
    }
  };

  const getSearchTypeIcon = (search) => {
    if (search.searchType === 'barcode') return '📱';
    if (search.searchType === 'image') return '📷';
    if (search.searchType === 'voice') return '🎤';
    return '🔍';
  };

  const getVerificationStatus = (search) => {
    if (search.verified === true) return { icon: '✅', text: 'Verified', color: '#10b981' };
    if (search.verified === false) return { icon: '❌', text: 'Not Found', color: '#ef4444' };
    return { icon: '⏳', text: 'Pending', color: '#f59e0b' };
  };

  const styles = {
    section: {
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #e9ecef",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff",
      borderColor: isDarkMode ? "#404040" : "#e9ecef",
      boxShadow: isDarkMode ? "none" : "0 2px 10px rgba(0,0,0,0.08)",
      position: "relative"
    },
    
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px"
    },
    
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: isDarkMode ? "#e9ecef" : "#374151",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: 0
    },
    
    sectionIcon: {
      fontSize: "20px"
    },
    
    headerButtons: {
      display: "flex",
      gap: "8px"
    },
    
    refreshButton: {
      padding: "6px 12px",
      backgroundColor: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: loading ? 0.7 : 1
    },
    
    viewAllButton: {
      padding: "8px 16px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },

    searchList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    
    searchItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e9ecef",
      backgroundColor: isDarkMode ? "#404040" : "#f8f9fa",
      borderColor: isDarkMode ? "#555555" : "#e9ecef",
      transition: "all 0.3s ease",
      cursor: "pointer"
    },
    
    searchIcon: {
      fontSize: "16px",
      color: "#10b981"
    },
    
    searchContent: {
      flex: 1
    },
    
    searchMedicine: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "2px",
      color: isDarkMode ? "#e9ecef" : "inherit"
    },
    
    searchDetails: {
      fontSize: "12px",
      color: "#6c757d",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    
    searchTime: {
      fontSize: "12px",
      color: "#6c757d"
    },
    
    searchStatus: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px"
    },
    
    statusIcon: {
      fontSize: "16px"
    },
    
    statusText: {
      fontSize: "10px",
      fontWeight: "600"
    },

    emptyState: {
      textAlign: "center",
      padding: "40px 20px"
    },
    
    emptyIcon: {
      fontSize: "48px",
      display: "block",
      marginBottom: "16px"
    },
    
    emptyText: {
      fontSize: "14px",
      color: "#6c757d",
      marginBottom: "16px"
    },
    
    emptyButton: {
      padding: "10px 20px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },

    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? "rgba(45, 45, 45, 0.8)" : "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16px",
      zIndex: 10
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div style={styles.section}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div>🔄 Refreshing...</div>
        </div>
      )}
      
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🔍</span>
          Recent Searches
          {searches.length > 0 && (
            <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'normal' }}>
              ({searches.length})
            </span>
          )}
        </h2>
        <div style={styles.headerButtons}>
          <button 
            onClick={refreshSearches}
            disabled={loading}
            style={styles.refreshButton}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
          <button 
            onClick={() => router.push('/history')}
            style={styles.viewAllButton}
          >
            View All
          </button>
        </div>
      </div>
      
      <div style={styles.searchList}>
        {searches.length > 0 ? (
          searches.map((search, index) => {
            const status = getVerificationStatus(search);
            return (
              <div 
                key={search.id || index} 
                style={styles.searchItem} 
                className="search-item"
                onClick={() => handleSearchItemClick(search)}
              >
                <div style={styles.searchIcon}>
                  {getSearchTypeIcon(search)}
                </div>
                <div style={styles.searchContent}>
                  <div style={styles.searchMedicine}>
                    {search.medicineName || search.searchQuery || 'Unknown Medicine'}
                  </div>
                  <div style={styles.searchDetails}>
                    <span style={styles.searchTime}>
                      {formatDate(search.timestamp)}
                    </span>
                    {search.resultCount && (
                      <span>• {search.resultCount} results</span>
                    )}
                  </div>
                </div>
                <div style={styles.searchStatus}>
                  <div style={{ ...styles.statusIcon, color: status.color }}>
                    {status.icon}
                  </div>
                  <div style={{ ...styles.statusText, color: status.color }}>
                    {status.text}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <p style={styles.emptyText}>No recent searches</p>
            <button 
              onClick={() => router.push('/home')}
              style={styles.emptyButton}
            >
              Start Searching
            </button>
          </div>
        )}
      </div>
    </div>
  );
}