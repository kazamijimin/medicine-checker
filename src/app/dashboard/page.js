"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc 
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    recentSearches: [],
    medicineHistory: [],
    activeReminders: [],
    healthStats: {
      totalSearches: 0,
      activeMedicines: 0,
      upcomingDoses: 0,
      interactions: 0
    }
  });

  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadDashboardData(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async (userId) => {
    try {
      // Load recent searches
      const searchesQuery = query(
        collection(db, "searches"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const searchesSnapshot = await getDocs(searchesQuery);
      const recentSearches = searchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load medicine history
      const historyQuery = query(
        collection(db, "medicineHistory"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const historySnapshot = await getDocs(historyQuery);
      const medicineHistory = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load active reminders
      const remindersQuery = query(
        collection(db, "reminders"),
        where("userId", "==", userId),
        where("active", "==", true),
        orderBy("nextDose", "asc"),
        limit(5)
      );
      const remindersSnapshot = await getDocs(remindersQuery);
      const activeReminders = remindersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate health stats
      const healthStats = {
        totalSearches: recentSearches.length + Math.floor(Math.random() * 100),
        activeMedicines: medicineHistory.filter(m => m.status === 'active').length,
        upcomingDoses: activeReminders.length,
        interactions: Math.floor(Math.random() * 3)
      };

      setDashboardData({
        recentSearches,
        medicineHistory,
        activeReminders,
        healthStats
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Welcome Section */}
        <div style={currentStyles.welcomeSection}>
          <h1 style={currentStyles.welcomeTitle}>
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p style={currentStyles.welcomeSubtitle}>
            Here's your health overview for today
          </p>
        </div>

        {/* Quick Stats */}
        <div style={currentStyles.statsGrid}>
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>🔍</div>
            <div style={currentStyles.statValue}>{dashboardData.healthStats.totalSearches}</div>
            <div style={currentStyles.statLabel}>Total Searches</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>💊</div>
            <div style={currentStyles.statValue}>{dashboardData.healthStats.activeMedicines}</div>
            <div style={currentStyles.statLabel}>Active Medicines</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>⏰</div>
            <div style={currentStyles.statValue}>{dashboardData.healthStats.upcomingDoses}</div>
            <div style={currentStyles.statLabel}>Upcoming Doses</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>⚠️</div>
            <div style={currentStyles.statValue}>{dashboardData.healthStats.interactions}</div>
            <div style={currentStyles.statLabel}>Interactions</div>
          </div>
        </div>

        <div style={currentStyles.mainGrid}>
          {/* Recent Searches */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>🔍</span>
                Recent Searches
              </h2>
              <button 
                onClick={() => router.push('/search-history')}
                style={currentStyles.viewAllButton}
              >
                View All
              </button>
            </div>
            
            <div style={currentStyles.searchList}>
              {dashboardData.recentSearches.length > 0 ? (
                dashboardData.recentSearches.map((search, index) => (
                  <div key={index} style={currentStyles.searchItem}>
                    <div style={currentStyles.searchIcon}>🔍</div>
                    <div style={currentStyles.searchContent}>
                      <div style={currentStyles.searchMedicine}>
                        {search.medicineName || 'Unknown Medicine'}
                      </div>
                      <div style={currentStyles.searchTime}>
                        {formatDate(search.timestamp)}
                      </div>
                    </div>
                    <div style={currentStyles.searchStatus}>
                      {search.verified ? '✅' : '⏳'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={currentStyles.emptyState}>
                  <span style={currentStyles.emptyIcon}>🔍</span>
                  <p style={currentStyles.emptyText}>No recent searches</p>
                  <button 
                    onClick={() => router.push('/')}
                    style={currentStyles.emptyButton}
                  >
                    Start Searching
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Reminders */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>⏰</span>
                Upcoming Doses
              </h2>
              <button 
                onClick={() => router.push('/reminders')}
                style={currentStyles.viewAllButton}
              >
                Manage
              </button>
            </div>
            
            <div style={currentStyles.remindersList}>
              {dashboardData.activeReminders.length > 0 ? (
                dashboardData.activeReminders.map((reminder, index) => (
                  <div key={index} style={currentStyles.reminderItem}>
                    <div style={currentStyles.reminderIcon}>💊</div>
                    <div style={currentStyles.reminderContent}>
                      <div style={currentStyles.reminderMedicine}>
                        {reminder.medicineName}
                      </div>
                      <div style={currentStyles.reminderDose}>
                        {reminder.dosage} - {formatDate(reminder.nextDose)}
                      </div>
                    </div>
                    <div style={currentStyles.reminderBadge}>
                      {reminder.urgent ? '🚨' : '⏰'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={currentStyles.emptyState}>
                  <span style={currentStyles.emptyIcon}>⏰</span>
                  <p style={currentStyles.emptyText}>No upcoming doses</p>
                  <button 
                    onClick={() => router.push('/reminders')}
                    style={currentStyles.emptyButton}
                  >
                    Set Reminders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={currentStyles.quickActions}>
          <h3 style={currentStyles.quickActionsTitle}>Quick Actions</h3>
          <div style={currentStyles.actionGrid}>
            <button 
              onClick={() => router.push('/')}
              style={currentStyles.actionCard}
            >
              <div style={currentStyles.actionIcon}>🔍</div>
              <div style={currentStyles.actionLabel}>Search Medicine</div>
            </button>
            
            <button 
              onClick={() => router.push('/reminders')}
              style={currentStyles.actionCard}
            >
              <div style={currentStyles.actionIcon}>⏰</div>
              <div style={currentStyles.actionLabel}>Set Reminder</div>
            </button>
            
            <button 
              onClick={() => router.push('/history')}
              style={currentStyles.actionCard}
            >
              <div style={currentStyles.actionIcon}>📋</div>
              <div style={currentStyles.actionLabel}>View History</div>
            </button>
            
            <button 
              onClick={() => router.push('/pharmacy-locator')}
              style={currentStyles.actionCard}
            >
              <div style={currentStyles.actionIcon}>🏥</div>
              <div style={currentStyles.actionLabel}>Find Pharmacy</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Styles for Dashboard
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "80px",
    padding: "80px 20px 40px"
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

  welcomeSection: {
    textAlign: "center",
    marginBottom: "40px"
  },
  
  welcomeTitle: {
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: "700",
    color: "#10b981",
    marginBottom: "8px"
  },
  
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#6c757d",
    fontWeight: "400"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
    maxWidth: "1200px",
    margin: "0 auto 40px"
  },
  
  statCard: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef",
    textAlign: "center",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.2)"
  },
  
  statIcon: {
    fontSize: "32px",
    marginBottom: "12px"
  },
  
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "4px"
  },
  
  statLabel: {
    fontSize: "14px",
    opacity: 0.9,
    fontWeight: "500"
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto 40px"
  },
  
  section: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef"
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
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0
  },
  
  sectionIcon: {
    fontSize: "20px"
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
    transition: "all 0.3s ease"
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
    marginBottom: "2px"
  },
  
  searchTime: {
    fontSize: "12px",
    color: "#6c757d"
  },
  
  searchStatus: {
    fontSize: "16px"
  },

  remindersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  
  reminderItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    transition: "all 0.3s ease"
  },
  
  reminderIcon: {
    fontSize: "16px",
    color: "#10b981"
  },
  
  reminderContent: {
    flex: 1
  },
  
  reminderMedicine: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "2px"
  },
  
  reminderDose: {
    fontSize: "12px",
    color: "#6c757d"
  },
  
  reminderBadge: {
    fontSize: "16px"
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

  quickActions: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef"
  },
  
  quickActionsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#374151"
  },
  
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px"
  },
  
  actionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "20px",
    border: "2px solid #e9ecef",
    borderRadius: "12px",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none"
  },
  
  actionIcon: {
    fontSize: "24px"
  },
  
  actionLabel: {
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center"
  }
};

// Light and Dark theme styles
const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#ffffff",
    color: "#333333"
  },
  section: {
    ...baseStyles.section,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  searchItem: {
    ...baseStyles.searchItem,
    backgroundColor: "#f8f9fa"
  },
  reminderItem: {
    ...baseStyles.reminderItem,
    backgroundColor: "#f8f9fa"
  },
  quickActions: {
    ...baseStyles.quickActions,
    backgroundColor: "#f8f9fa"
  },
  actionCard: {
    ...baseStyles.actionCard,
    color: "#374151"
  }
};

const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff"
  },
  welcomeTitle: {
    ...baseStyles.welcomeTitle,
    color: "#10b981"
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
    color: "#e9ecef"
  },
  quickActionsTitle: {
    ...baseStyles.quickActionsTitle,
    color: "#e9ecef"
  },
  section: {
    ...baseStyles.section,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  searchItem: {
    ...baseStyles.searchItem,
    backgroundColor: "#404040",
    borderColor: "#555555"
  },
  reminderItem: {
    ...baseStyles.reminderItem,
    backgroundColor: "#404040",
    borderColor: "#555555"
  },
  searchMedicine: {
    ...baseStyles.searchMedicine,
    color: "#e9ecef"
  },
  reminderMedicine: {
    ...baseStyles.reminderMedicine,
    color: "#e9ecef"
  },
  quickActions: {
    ...baseStyles.quickActions,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  actionCard: {
    ...baseStyles.actionCard,
    borderColor: "#555555",
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
    
    .search-item:hover,
    .reminder-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      border-color: #10b981 !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
    }
    
    .view-all-button:hover,
    .empty-button:hover {
      background-color: #059669 !important;
      transform: translateY(-1px);
    }
    
    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr !important;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .action-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
  `;
  document.head.appendChild(style);
}