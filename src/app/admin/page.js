"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalMedicines: 0,
    totalSearches: 0,
    activeReminders: 0,
    pendingAlerts: 0,
    systemLogs: 0,
    adminUsers: 0,
    regularUsers: 0,
    dailySearches: 0,
    systemHealth: 100
  });
  const router = useRouter();

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Auth and admin check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminStatus(currentUser.uid);
        if (!adminStatus) {
          setUnauthorized(true);
        } else {
          await loadAdminStats();
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

  const loadAdminStats = async () => {
    try {
      // Get total users and categorize them
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;
      const usersData = usersSnapshot.docs.map(doc => doc.data());
      const adminUsers = usersData.filter(user => user.isAdmin || user.role === 'admin').length;
      const regularUsers = totalUsers - adminUsers;

      // Get total medicines
      let totalMedicines = 0;
      try {
        const medicinesSnapshot = await getDocs(collection(db, "medicines"));
        totalMedicines = medicinesSnapshot.size;
      } catch (error) {
        console.log("Medicines collection doesn't exist yet");
      }

      // Get total searches and daily searches
      let totalSearches = 0;
      let dailySearches = 0;
      try {
        const searchesSnapshot = await getDocs(collection(db, "searches"));
        totalSearches = searchesSnapshot.size;
        
        // Calculate daily searches
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        searchesSnapshot.docs.forEach(doc => {
          const searchData = doc.data();
          if (searchData.timestamp?.toDate) {
            const searchDate = searchData.timestamp.toDate();
            if (searchDate > oneDayAgo) dailySearches++;
          }
        });
      } catch (error) {
        console.log("Searches collection doesn't exist yet");
      }

      // Get active reminders
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

      // Get pending alerts
      let pendingAlerts = 0;
      try {
        const alertsQuery = query(
          collection(db, "alerts"),
          where("status", "==", "pending")
        );
        const alertsSnapshot = await getDocs(alertsQuery);
        pendingAlerts = alertsSnapshot.size;
      } catch (error) {
        console.log("Alerts collection doesn't exist yet");
      }

      // Get system logs count
      let systemLogs = 0;
      try {
        const logsSnapshot = await getDocs(collection(db, "systemLogs"));
        systemLogs = logsSnapshot.size;
      } catch (error) {
        console.log("System logs collection doesn't exist yet");
      }

      // Calculate system health
      let systemHealth = 100;
      if (totalMedicines === 0) systemHealth -= 20;
      if (adminUsers === 0) systemHealth -= 30;
      if (pendingAlerts > 5) systemHealth -= 15;
      if (totalUsers === 0) systemHealth -= 25;
      if (systemHealth < 0) systemHealth = 0;

      setAdminStats({
        totalUsers,
        totalMedicines,
        totalSearches,
        activeReminders,
        pendingAlerts,
        systemLogs,
        adminUsers,
        regularUsers,
        dailySearches,
        systemHealth
      });

    } catch (error) {
      console.error("Error loading admin stats:", error);
      setAdminStats({
        totalUsers: 0,
        totalMedicines: 0,
        totalSearches: 0,
        activeReminders: 0,
        pendingAlerts: 0,
        systemLogs: 0,
        adminUsers: 0,
        regularUsers: 0,
        dailySearches: 0,
        systemHealth: 0
      });
    }
  };

  // Base styles
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
      minHeight: "40vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },

    heroBackground: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      width: "100%",
      minHeight: "40vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"
    },

    heroContent: {
      textAlign: "center",
      color: "white",
      maxWidth: "800px",
      padding: "60px 20px"
    },

    heroTitle: {
      fontSize: "clamp(32px, 6vw, 52px)",
      fontWeight: "800",
      marginBottom: "16px",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      lineHeight: "1.2"
    },

    heroIcon: {
      fontSize: "64px",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
    },

    heroSubtitle: {
      fontSize: "18px",
      opacity: 0.95,
      marginBottom: "32px",
      fontWeight: "400"
    },

    systemStatus: {
      display: "inline-flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: "12px 24px",
      borderRadius: "50px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)"
    },

    mainContent: {
      maxWidth: "1400px",
      margin: "-80px auto 0",
      padding: "0 20px 60px",
      position: "relative",
      zIndex: 2
    },

    quickStats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "40px"
    },

    quickStatCard: {
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "'Poppins', sans-serif"
    },

    quickStatGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px"
    },

    quickStatIcon: {
      fontSize: "28px",
      marginBottom: "12px",
      display: "block"
    },

    quickStatNumber: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#10b981",
      margin: "0 0 4px 0",
      fontFamily: "'Poppins', sans-serif"
    },

    quickStatLabel: {
      fontSize: "12px",
      fontWeight: "500",
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    },

    section: {
      marginBottom: "40px",
      padding: "32px",
      borderRadius: "20px",
      border: "1px solid",
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
      overflow: "hidden"
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
      fontSize: "28px",
      fontWeight: "700",
      color: "#10b981",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    },

    sectionIcon: {
      fontSize: "32px"
    },

    adminGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "28px"
    },

    adminCard: {
      padding: "40px 32px",
      borderRadius: "20px",
      border: "1px solid",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', sans-serif"
    },

    cardGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "6px"
    },

    cardIcon: {
      fontSize: "56px",
      marginBottom: "20px",
      display: "block",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
    },

    cardTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "12px",
      fontFamily: "'Poppins', sans-serif"
    },

    cardDescription: {
      fontSize: "14px",
      marginBottom: "20px",
      lineHeight: "1.5",
      fontFamily: "'Poppins', sans-serif"
    },

    cardStats: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginTop: "20px",
      flexWrap: "wrap"
    },

    cardCount: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#10b981",
      padding: "8px 16px",
      borderRadius: "20px",
      border: "2px solid #10b981",
      display: "inline-block",
      fontFamily: "'Poppins', sans-serif"
    },

    cardStatus: {
      fontSize: "12px",
      fontWeight: "600",
      padding: "6px 12px",
      borderRadius: "16px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "'Poppins', sans-serif"
    },

    statusActive: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },

    statusWarning: {
      backgroundColor: "#fef3c7",
      color: "#92400e"
    },

    statusError: {
      backgroundColor: "#fecaca",
      color: "#991b1b"
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column"
    },

    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #10b981",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 24px"
    },

    loadingText: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#10b981",
      fontFamily: "'Poppins', sans-serif"
    },

    unauthorizedContainer: {
      textAlign: "center",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "100px 20px"
    },

    unauthorizedIcon: {
      fontSize: "120px",
      marginBottom: "32px",
      display: "block",
      opacity: 0.7
    },

    unauthorizedTitle: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "16px",
      color: "#ef4444",
      fontFamily: "'Poppins', sans-serif"
    },

    unauthorizedText: {
      fontSize: "16px",
      lineHeight: "1.6",
      marginBottom: "32px",
      fontFamily: "'Poppins', sans-serif"
    },

    backButton: {
      padding: "16px 32px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  // Light theme styles - matching your profile page exactly
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
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    },
    quickStatCard: {
      ...baseStyles.quickStatCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
    },
    quickStatLabel: {
      ...baseStyles.quickStatLabel,
      color: "#6c757d"
    },
    adminCard: {
      ...baseStyles.adminCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    },
    cardDescription: {
      ...baseStyles.cardDescription,
      color: "#6c757d"
    },
    unauthorizedText: {
      ...baseStyles.unauthorizedText,
      color: "#6c757d"
    },
    loadingContainer: {
      ...baseStyles.loadingContainer,
      backgroundColor: "#ffffff"
    }
  };

  // Dark theme styles - matching your profile page exactly
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
    quickStatCard: {
      ...baseStyles.quickStatCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    quickStatLabel: {
      ...baseStyles.quickStatLabel,
      color: "#b0b0b0"
    },
    adminCard: {
      ...baseStyles.adminCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    cardDescription: {
      ...baseStyles.cardDescription,
      color: "#b0b0b0"
    },
    unauthorizedText: {
      ...baseStyles.unauthorizedText,
      color: "#b0b0b0"
    },
    loadingContainer: {
      ...baseStyles.loadingContainer,
      backgroundColor: "#1a1a1a"
    },
    loadingText: {
      ...baseStyles.loadingText,
      color: "#10b981"
    }
  };

  // Current styles based on theme
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Admin actions data
  const adminActions = [
    { 
      icon: "💊", 
      title: "Medicine Database", 
      description: "Manage medicine information, drug interactions, and dosage guidelines for accurate health recommendations.",
      count: `${adminStats.totalMedicines} medicines`, 
      status: adminStats.totalMedicines > 0 ? "active" : "warning",
      statusText: adminStats.totalMedicines > 0 ? "Database Active" : "Empty Database",
      path: "/admin/medicines",
      gradient: "linear-gradient(90deg, #10b981 0%, #059669 100%)"
    },
    { 
      icon: "👥", 
      title: "User Management", 
      description: "Monitor user accounts, manage permissions, and oversee platform access and security settings.",
      count: `${adminStats.totalUsers} total users`, 
      status: adminStats.adminUsers > 0 ? "active" : "error",
      statusText: `${adminStats.adminUsers} admins • ${adminStats.regularUsers} users`,
      path: "/admin/users",
      gradient: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)"
    },
    { 
      icon: "⚠️", 
      title: "System Alerts", 
      description: "Send critical notifications, health warnings, and system-wide announcements to users instantly.",
      count: adminStats.pendingAlerts === 0 ? "No pending alerts" : `${adminStats.pendingAlerts} pending`, 
      status: adminStats.pendingAlerts === 0 ? "active" : adminStats.pendingAlerts < 5 ? "warning" : "error",
      statusText: adminStats.pendingAlerts === 0 ? "All Clear" : "Needs Attention",
      path: "/admin/alerts",
      gradient: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
    },
    { 
      icon: "📊", 
      title: "Analytics Dashboard", 
      description: "View comprehensive insights, user behavior patterns, and system performance metrics.",
      count: `${adminStats.totalSearches} searches analyzed`, 
      status: adminStats.totalSearches > 0 ? "active" : "warning",
      statusText: `${adminStats.dailySearches} searches today`,
      path: "/admin/analytics",
      gradient: "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    { 
      icon: "🛡️", 
      title: "System Monitoring", 
      description: "Track system logs, monitor security events, and maintain platform stability and performance.",
      count: adminStats.systemLogs > 0 ? `${adminStats.systemLogs} log entries` : "No logs recorded", 
      status: adminStats.systemLogs > 0 ? "active" : "warning",
      statusText: `System Health: ${adminStats.systemHealth}%`,
      path: "/admin/logs",
      gradient: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
    },
    { 
      icon: "⚙️", 
      title: "Platform Settings", 
      description: "Configure system parameters, notification settings, and platform-wide preferences.",
      count: `${adminStats.activeReminders} active reminders`, 
      status: "active",
      statusText: "System Configured",
      path: "/admin/settings",
      gradient: "linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)"
    }
  ];

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    
    .admin-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
    }
    
    .quick-stat:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
    }
    
    .back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
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
            <div style={currentStyles.loadingSpinner}></div>
            <p style={currentStyles.loadingText}>Initializing Admin Panel...</p>
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
          <div style={currentStyles.unauthorizedContainer}>
            <span style={currentStyles.unauthorizedIcon}>🚫</span>
            <h2 style={currentStyles.unauthorizedTitle}>Access Restricted</h2>
            <p style={currentStyles.unauthorizedText}>
              This area is reserved for system administrators only.<br/>
              You don't have the necessary permissions to access the admin panel.<br/>
              Please contact your system administrator if you believe this is an error.
            </p>
            <button 
              style={currentStyles.backButton}
              className="back-button"
              onClick={() => router.push('/dashboard')}
              onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
            >
              <span>←</span>
              Return to Dashboard
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
                <span style={currentStyles.heroIcon}>⚙️</span>
                Admin Control Center
              </h1>
              <p style={currentStyles.heroSubtitle}>
                Complete system management and monitoring dashboard
              </p>
              <div style={currentStyles.systemStatus}>
                <span style={{fontSize: "20px"}}>
                  {adminStats.systemHealth >= 80 ? "🟢" : adminStats.systemHealth >= 60 ? "🟡" : "🔴"}
                </span>
                <span>System Health: {adminStats.systemHealth}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>
          
          {/* Quick Stats */}
          <div style={currentStyles.quickStats}>
            <div style={currentStyles.quickStatCard} className="quick-stat">
              <div style={{...currentStyles.quickStatGradient, background: "linear-gradient(90deg, #10b981 0%, #059669 100%)"}}></div>
              <span style={currentStyles.quickStatIcon}>👥</span>
              <h3 style={currentStyles.quickStatNumber}>{adminStats.totalUsers}</h3>
              <p style={currentStyles.quickStatLabel}>Total Users</p>
            </div>
            
            <div style={currentStyles.quickStatCard} className="quick-stat">
              <div style={{...currentStyles.quickStatGradient, background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)"}}></div>
              <span style={currentStyles.quickStatIcon}>💊</span>
              <h3 style={currentStyles.quickStatNumber}>{adminStats.totalMedicines}</h3>
              <p style={currentStyles.quickStatLabel}>Medicines</p>
            </div>
            
            <div style={currentStyles.quickStatCard} className="quick-stat">
              <div style={{...currentStyles.quickStatGradient, background: "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)"}}></div>
              <span style={currentStyles.quickStatIcon}>🔍</span>
              <h3 style={currentStyles.quickStatNumber}>{adminStats.totalSearches}</h3>
              <p style={currentStyles.quickStatLabel}>Total Searches</p>
            </div>
            
            <div style={currentStyles.quickStatCard} className="quick-stat">
              <div style={{...currentStyles.quickStatGradient, background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"}}></div>
              <span style={currentStyles.quickStatIcon}>⏰</span>
              <h3 style={currentStyles.quickStatNumber}>{adminStats.activeReminders}</h3>
              <p style={currentStyles.quickStatLabel}>Active Reminders</p>
            </div>

            <div style={currentStyles.quickStatCard} className="quick-stat">
              <div style={{...currentStyles.quickStatGradient, background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"}}></div>
              <span style={currentStyles.quickStatIcon}>⚠️</span>
              <h3 style={currentStyles.quickStatNumber}>{adminStats.pendingAlerts}</h3>
              <p style={currentStyles.quickStatLabel}>Pending Alerts</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>🛠️</span>
                Administrative Tools
              </h2>
            </div>

            <div style={currentStyles.adminGrid}>
              {adminActions.map((action, index) => (
                <div 
                  key={index}
                  onClick={() => router.push(action.path)}
                  style={currentStyles.adminCard}
                  className="admin-card"
                >
                  <div style={{...currentStyles.cardGradient, background: action.gradient}}></div>
                  
                  <span style={currentStyles.cardIcon}>{action.icon}</span>
                  <h3 style={currentStyles.cardTitle}>{action.title}</h3>
                  <p style={currentStyles.cardDescription}>{action.description}</p>
                  
                  <div style={currentStyles.cardStats}>
                    <span style={currentStyles.cardCount}>{action.count}</span>
                    <span style={{
                      ...currentStyles.cardStatus,
                      ...(action.status === "active" ? currentStyles.statusActive :
                          action.status === "warning" ? currentStyles.statusWarning :
                          currentStyles.statusError)
                    }}>
                      <span>{action.status === "active" ? "🟢" : action.status === "warning" ? "🟡" : "🔴"}</span>
                      {action.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}