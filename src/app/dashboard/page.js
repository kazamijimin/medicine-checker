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
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentSearches from "@/components/dashboard/RecentSearches";
import UpcomingDoses from "@/components/dashboard/UpcomingDoses";
import QuickActions from "@/components/dashboard/QuickActions";
import NotificationBanner from "@/components/dashboard/NotificationBanner";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  // Load theme from localStorage and listen for changes
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const savedPrefs = localStorage.getItem('userPreferences');
      
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setIsDarkMode(parsedPrefs.theme === 'dark');
      }
    };

    updateTheme();

    const handleStorageChange = (e) => {
      if (e.key === 'theme' || e.key === 'userPreferences') {
        updateTheme();
      }
    };

    const handleThemeChange = () => {
      updateTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkAdminStatus(currentUser.uid);
        await loadDashboardData(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Check if user is admin
  const checkAdminStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.role === 'admin' || userData.isAdmin === true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };
// ...existing code...

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

    // Load active reminders - UPDATED
    let activeReminders = [];
    try {
      const remindersRef = collection(db, "reminders");
      const remindersQuery = query(
        remindersRef,
        where("userId", "==", userId),
        where("active", "==", true)
      );
      
      const remindersSnapshot = await getDocs(remindersQuery);
      activeReminders = remindersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure dates are properly converted
          nextDose: data.nextDose?.toDate ? data.nextDose.toDate() : new Date(data.nextDose),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });

      // Sort by next dose time
      activeReminders.sort((a, b) => {
        const dateA = new Date(a.nextDose);
        const dateB = new Date(b.nextDose);
        return dateA - dateB;
      });

      // Limit to 5 most upcoming
      activeReminders = activeReminders.slice(0, 5);

      console.log("Active reminders loaded:", activeReminders); // Debug log
    } catch (error) {
      console.error("Error loading reminders:", error);
      // Continue without reminders if there's an error
    }

    // Calculate health stats
    const healthStats = {
      totalSearches: recentSearches.length,
      activeMedicines: medicineHistory.filter(m => m.status === 'active').length,
      upcomingDoses: activeReminders.length,
      interactions: 0 // You can calculate this based on your logic
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

// ...existing code...
  // Styles for main container
  const containerStyles = {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "80px",
    padding: "80px 20px 40px",
    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#333333"
  };

  const loadingStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    paddingTop: "60px"
  };

  const spinnerStyles = {
    textAlign: "center"
  };

  const spinnerCircleStyles = {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  };

  const mainGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto 40px"
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={loadingStyles}>
          <div style={spinnerStyles}>
            <div style={spinnerCircleStyles}></div>
            <p style={{ fontSize: "16px", color: "#6c757d" }}>Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={containerStyles}>
        <WelcomeSection user={user} isAdmin={isAdmin} isDarkMode={isDarkMode} />
        
        <NotificationBanner isDarkMode={isDarkMode} />
        
        <StatsGrid healthStats={dashboardData.healthStats} isDarkMode={isDarkMode} />

        <div style={mainGridStyles}>
          <RecentSearches recentSearches={dashboardData.recentSearches} isDarkMode={isDarkMode} />
          <UpcomingDoses activeReminders={dashboardData.activeReminders} isDarkMode={isDarkMode} />
        </div>

        <QuickActions isAdmin={isAdmin} isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

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
    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}