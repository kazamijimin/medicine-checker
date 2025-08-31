"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalSearches: 0,
    totalMedicines: 0,
    activeReminders: 0,
    recentSearches: [],
    topMedicines: [],
    userActivity: [],
    adminUsers: 0,
    regularUsers: 0,
    dailySearches: 0,
    weeklySearches: 0
  });
  const router = useRouter();

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
        const adminStatus = await checkAdminStatus(currentUser.uid);
        if (!adminStatus) {
          setUnauthorized(true);
        } else {
          await loadAnalytics();
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const checkAdminStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const adminStatus = userData.role === 'admin' || userData.isAdmin === true;
        setIsAdmin(adminStatus);
        return adminStatus;
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get users data
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;
      const usersData = usersSnapshot.docs.map(doc => doc.data());
      const adminUsers = usersData.filter(user => user.isAdmin || user.role === 'admin').length;
      const regularUsers = totalUsers - adminUsers;

      let totalSearches = 0;
      let recentSearches = [];
      let dailySearches = 0;
      let weeklySearches = 0;

      try {
        const searchesSnapshot = await getDocs(collection(db, "searches"));
        totalSearches = searchesSnapshot.size;
        
        // Get recent searches
        const recentSearchesQuery = query(
          collection(db, "searches"),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const recentSearchesSnapshot = await getDocs(recentSearchesQuery);
        recentSearches = recentSearchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate daily and weekly searches
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        searchesSnapshot.docs.forEach(doc => {
          const searchData = doc.data();
          if (searchData.timestamp?.toDate) {
            const searchDate = searchData.timestamp.toDate();
            if (searchDate > oneDayAgo) dailySearches++;
            if (searchDate > oneWeekAgo) weeklySearches++;
          }
        });
      } catch (error) {
        console.log("Searches collection doesn't exist yet");
      }

      let totalMedicines = 0;
      try {
        const medicinesSnapshot = await getDocs(collection(db, "medicines"));
        totalMedicines = medicinesSnapshot.size;
      } catch (error) {
        console.log("Medicines collection doesn't exist yet");
      }

      let activeReminders = 0;
      try {
        const remindersQuery = query(
          collection(db, "reminders"),
          where("active", "==", true)
        );
        const remindersSnapshot = await getDocs(remindersQuery);
        activeReminders = remindersSnapshot.size;
      } catch (error) {
        console.log("Reminders collection doesn't exist yet");
      }

      setAnalytics({
        totalUsers,
        totalSearches,
        totalMedicines,
        activeReminders,
        recentSearches,
        topMedicines: [],
        userActivity: [],
        adminUsers,
        regularUsers,
        dailySearches,
        weeklySearches
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Base styles (same as other pages)
  const baseStyles = {
    container: {
      minHeight: "100vh",
      paddingTop: "60px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      transition: "all 0.3s ease"
    },

    hero: {
      minHeight: "30vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },

    heroBackground: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      width: "100%",
      minHeight: "30vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    },

    heroContent: {
      textAlign: "center",
      color: "white",
      maxWidth: "800px",
      padding: "40px 20px"
    },

    heroTitle: {
      fontSize: "clamp(28px, 5vw, 42px)",
      fontWeight: "700",
      marginBottom: "12px",
      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px"
    },

    heroIcon: {
      fontSize: "48px"
    },

    heroSubtitle: {
      fontSize: "16px",
      opacity: 0.9,
      marginBottom: "24px"
    },

    mainContent: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "40px 20px"
    },

    section: {
      marginBottom: "40px",
      padding: "32px",
      borderRadius: "16px",
      border: "1px solid",
      fontFamily: "'Poppins', sans-serif"
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
      flexWrap: "wrap",
      gap: "16px"
    },

    sectionTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#10b981",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: 0
    },

    sectionIcon: {
      fontSize: "28px"
    },

    button: {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "'Poppins', sans-serif"
    },

    primaryButton: {
      backgroundColor: "#10b981",
      color: "white"
    },

    secondaryButton: {
      border: "2px solid",
      backgroundColor: "transparent"
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "24px",
      marginBottom: "32px"
    },

    statsCard: {
      padding: "28px",
      borderRadius: "16px",
      border: "1px solid",
      textAlign: "center",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
      overflow: "hidden"
    },

    statsCardGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px"
    },

    statsIcon: {
      fontSize: "40px",
      marginBottom: "16px",
      display: "block"
    },

    statsNumber: {
      fontSize: "36px",
      fontWeight: "800",
      color: "#10b981",
      margin: "0 0 8px 0",
      fontFamily: "'Poppins', sans-serif"
    },

    statsLabel: {
      fontSize: "14px",
      fontWeight: "500",
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    },

    statsChange: {
      fontSize: "12px",
      fontWeight: "600",
      marginTop: "8px",
      padding: "4px 8px",
      borderRadius: "12px",
      display: "inline-block"
    },

    positiveChange: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },

    recentActivity: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "24px"
    },

    activityCard: {
      borderRadius: "16px",
      padding: "28px",
      border: "1px solid",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', sans-serif"
    },

    activityHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px"
    },

    activityTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#10b981",
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    },

    activityList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },

    activityItem: {
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid",
      transition: "all 0.3s ease"
    },

    searchQuery: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "4px",
      fontFamily: "'Poppins', sans-serif"
    },

    searchTime: {
      fontSize: "12px",
      fontFamily: "'Poppins', sans-serif"
    },

    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      fontFamily: "'Poppins', sans-serif"
    },

    emptyIcon: {
      fontSize: "64px",
      marginBottom: "16px",
      display: "block",
      opacity: 0.5
    },

    emptyTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "8px",
      fontFamily: "'Poppins', sans-serif"
    },

    emptyText: {
      fontSize: "14px",
      lineHeight: "1.5",
      fontFamily: "'Poppins', sans-serif"
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
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
      color: "#6c757d",
      fontFamily: "'Poppins', sans-serif"
    }
  };

  // Light theme styles
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
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    secondaryButton: {
      ...baseStyles.secondaryButton,
      borderColor: "#6c757d",
      color: "#6c757d"
    },
    statsCard: {
      ...baseStyles.statsCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    statsLabel: {
      ...baseStyles.statsLabel,
      color: "#6c757d"
    },
    activityCard: {
      ...baseStyles.activityCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    activityItem: {
      ...baseStyles.activityItem,
      backgroundColor: "#f8f9fa",
      borderColor: "#e9ecef"
    },
    searchTime: {
      ...baseStyles.searchTime,
      color: "#6c757d"
    },
    emptyTitle: {
      ...baseStyles.emptyTitle,
      color: "#374151"
    },
    emptyText: {
      ...baseStyles.emptyText,
      color: "#6c757d"
    }
  };

  // Dark theme styles
  const darkStyles = {
    ...baseStyles,
    container: {
      ...baseStyles.container,
      backgroundColor: "#1a1a1a",
      color: "#ffffff"
    },
    section: {
      ...baseStyles.section,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040",
      color: "#ffffff"
    },
    secondaryButton: {
      ...baseStyles.secondaryButton,
      borderColor: "#e9ecef",
      color: "#e9ecef"
    },
    statsCard: {
      ...baseStyles.statsCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    statsLabel: {
      ...baseStyles.statsLabel,
      color: "#b0b0b0"
    },
    activityCard: {
      ...baseStyles.activityCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    activityItem: {
      ...baseStyles.activityItem,
      backgroundColor: "#404040",
      borderColor: "#555555"
    },
    searchTime: {
      ...baseStyles.searchTime,
      color: "#b0b0b0"
    },
    emptyTitle: {
      ...baseStyles.emptyTitle,
      color: "#e9ecef"
    },
    emptyText: {
      ...baseStyles.emptyText,
      color: "#b0b0b0"
    }
  };

  // Current styles based on theme
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .stats-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
    
    .activity-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
    
    * {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;

  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.loadingContainer}>
            <div style={currentStyles.loadingSpinner}>
              <div style={currentStyles.spinner}></div>
              <p style={currentStyles.loadingText}>Loading Analytics...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (unauthorized) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.emptyState}>
            <span style={currentStyles.emptyIcon}>🚫</span>
            <h2 style={currentStyles.emptyTitle}>Access Denied</h2>
            <p style={currentStyles.emptyText}>
              You don't have permission to view analytics.<br/>
              Please contact an administrator for access.
            </p>
            <button 
              onClick={() => router.push('/admin')} 
              style={{...currentStyles.button, ...currentStyles.primaryButton, marginTop: "24px"}}
            >
              ← Back to Admin Panel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssAnimations}</style>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Hero Section */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <h1 style={currentStyles.heroTitle}>
                <span style={currentStyles.heroIcon}>📊</span>
                Analytics Dashboard
              </h1>
              <p style={currentStyles.heroSubtitle}>
                Comprehensive insights into your platform's performance
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>

          {/* Header Controls */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>📈</span>
                Platform Analytics
              </h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button 
                  onClick={() => router.push('/admin')} 
                  style={{...currentStyles.button, ...currentStyles.secondaryButton}}
                  className="button"
                >
                  ← Back to Admin
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={currentStyles.statsGrid}>
              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #10b981 0%, #059669 100%)"}}></div>
                <span style={currentStyles.statsIcon}>👥</span>
                <h3 style={currentStyles.statsNumber}>{analytics.totalUsers}</h3>
                <p style={currentStyles.statsLabel}>Total Users</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  {analytics.adminUsers} Admins • {analytics.regularUsers} Users
                </div>
              </div>

              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)"}}></div>
                <span style={currentStyles.statsIcon}>🔍</span>
                <h3 style={currentStyles.statsNumber}>{analytics.totalSearches}</h3>
                <p style={currentStyles.statsLabel}>Total Searches</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  {analytics.dailySearches} Today • {analytics.weeklySearches} This Week
                </div>
              </div>

              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)"}}></div>
                <span style={currentStyles.statsIcon}>💊</span>
                <h3 style={currentStyles.statsNumber}>{analytics.totalMedicines}</h3>
                <p style={currentStyles.statsLabel}>Medicines in Database</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  Available for search
                </div>
              </div>

              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"}}></div>
                <span style={currentStyles.statsIcon}>⏰</span>
                <h3 style={currentStyles.statsNumber}>{analytics.activeReminders}</h3>
                <p style={currentStyles.statsLabel}>Active Reminders</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  Currently scheduled
                </div>
              </div>

              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"}}></div>
                <span style={currentStyles.statsIcon}>📱</span>
                <h3 style={currentStyles.statsNumber}>{Math.round((analytics.dailySearches / analytics.totalUsers || 0) * 100) / 100}</h3>
                <p style={currentStyles.statsLabel}>Avg. Searches per User</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  Daily average
                </div>
              </div>

              <div style={currentStyles.statsCard} className="stats-card">
                <div style={{...currentStyles.statsCardGradient, background: "linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)"}}></div>
                <span style={currentStyles.statsIcon}>📊</span>
                <h3 style={currentStyles.statsNumber}>{analytics.totalMedicines > 0 ? Math.round((analytics.totalSearches / analytics.totalMedicines) * 10) / 10 : 0}</h3>
                <p style={currentStyles.statsLabel}>Search to Medicine Ratio</p>
                <div style={{...currentStyles.statsChange, ...currentStyles.positiveChange}}>
                  Platform utilization
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h3 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>🕒</span>
                Recent Activity
              </h3>
            </div>

            <div style={currentStyles.recentActivity}>
              <div style={currentStyles.activityCard} className="activity-card">
                <div style={currentStyles.activityHeader}>
                  <span style={currentStyles.sectionIcon}>🔍</span>
                  <h4 style={currentStyles.activityTitle}>Recent Searches</h4>
                </div>
                
                <div style={currentStyles.activityList}>
                  {analytics.recentSearches.length > 0 ? (
                    analytics.recentSearches.slice(0, 5).map((search) => (
                      <div key={search.id} style={currentStyles.activityItem}>
                        <div style={currentStyles.searchQuery}>
                          {search.medicineQuery || search.query || 'Unknown medicine'}
                        </div>
                        <div style={currentStyles.searchTime}>
                          {formatTimestamp(search.timestamp)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={currentStyles.emptyState}>
                      <span style={currentStyles.emptyIcon}>🔍</span>
                      <h5 style={currentStyles.emptyTitle}>No Recent Searches</h5>
                      <p style={currentStyles.emptyText}>
                        Search activity will appear here when users start searching.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div style={currentStyles.activityCard} className="activity-card">
                <div style={currentStyles.activityHeader}>
                  <span style={currentStyles.sectionIcon}>📈</span>
                  <h4 style={currentStyles.activityTitle}>System Performance</h4>
                </div>
                
                <div style={currentStyles.activityList}>
                  <div style={currentStyles.activityItem}>
                    <div style={currentStyles.searchQuery}>
                      Database Status
                    </div>
                    <div style={currentStyles.searchTime}>
                      {analytics.totalMedicines > 0 ? '🟢 Online' : '🟡 Empty'} • {analytics.totalMedicines} medicines loaded
                    </div>
                  </div>
                  
                  <div style={currentStyles.activityItem}>
                    <div style={currentStyles.searchQuery}>
                      User Engagement
                    </div>
                    <div style={currentStyles.searchTime}>
                      {analytics.totalUsers > 0 && analytics.totalSearches > 0 ? '🟢 Active' : '🟡 Low'} • {((analytics.totalSearches / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}% search rate
                    </div>
                  </div>
                  
                  <div style={currentStyles.activityItem}>
                    <div style={currentStyles.searchQuery}>
                      Reminder System
                    </div>
                    <div style={currentStyles.searchTime}>
                      {analytics.activeReminders > 0 ? '🟢 Active' : '🟡 Inactive'} • {analytics.activeReminders} active reminders
                    </div>
                  </div>
                  
                  <div style={currentStyles.activityItem}>
                    <div style={currentStyles.searchQuery}>
                      Admin Coverage
                    </div>
                    <div style={currentStyles.searchTime}>
                      {analytics.adminUsers > 0 ? '🟢 Covered' : '🔴 No Admins'} • {analytics.adminUsers} administrators
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}