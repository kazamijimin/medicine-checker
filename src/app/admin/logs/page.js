"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, orderBy, query, limit } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminLogsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const createSampleLogs = useCallback(async () => {
    try {
      const sampleLogs = [
        {
          level: "info",
          message: "System started successfully",
          timestamp: new Date(),
          userId: "system",
          action: "system_start"
        },
        {
          level: "info", 
          message: "User logged in",
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          userId: user?.uid,
          action: "user_login"
        }
      ];

      for (const log of sampleLogs) {
        await addDoc(collection(db, "systemLogs"), log);
      }
      
      // Reload logs directly instead of calling loadLogs
      const logsQuery = query(
        collection(db, "systemLogs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    } catch (error) {
      console.error("Error creating sample logs:", error);
    }
  }, [user?.uid]);

  const loadLogs = useCallback(async () => {
    try {
      const logsQuery = query(
        collection(db, "systemLogs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    } catch (error) {
      console.error("Error loading logs:", error);
      // Create a sample log if collection doesn't exist
      if (error.code === 'failed-precondition') {
        await createSampleLogs();
      }
    }
  }, [createSampleLogs]);

  const checkAdminStatus = useCallback(async (userId) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminStatus(currentUser.uid);
        if (!adminStatus) {
          setUnauthorized(true);
        } else {
          await loadLogs();
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, checkAdminStatus, loadLogs]);

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#10b981';
      case 'debug': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      paddingTop: "80px",
      padding: "80px 20px 40px"
    },
    header: {
      maxWidth: "1200px",
      margin: "0 auto 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#ef4444"
    },
    backButton: {
      padding: "10px 20px",
      backgroundColor: "#6b7280",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer"
    },
    logsList: {
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#f8f9fa",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#e9ecef",
      overflow: "hidden"
    },
    logItem: {
      padding: "16px",
      borderBottom: "1px solid",
      borderBottomColor: isDarkMode ? "#404040" : "#e9ecef",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px"
    },
    logLevel: {
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      minWidth: "60px",
      textAlign: "center",
      color: "white"
    },
    logContent: {
      flex: 1
    },
    logMessage: {
      fontSize: "14px",
      marginBottom: "4px"
    },
    logMeta: {
      fontSize: "12px",
      color: isDarkMode ? "#a1a1aa" : "#6b7280"
    },
    refreshButton: {
      padding: "10px 20px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginLeft: "8px"
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={styles.container}>
          <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <p>Loading system logs...</p>
          </div>
        </div>
      </>
    );
  }

  if (unauthorized) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={styles.container}>
          <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <h2>Access Denied</h2>
            <button onClick={() => router.push('/admin')} style={styles.backButton}>
              Back to Admin Panel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ System Logs</h1>
          <div>
            <button onClick={loadLogs} style={styles.refreshButton}>
              Refresh
            </button>
            <button onClick={() => router.push('/admin')} style={styles.backButton}>
              Back to Admin Panel
            </button>
          </div>
        </div>

        <div style={styles.logsList}>
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} style={styles.logItem}>
                <span 
                  style={{
                    ...styles.logLevel,
                    backgroundColor: getLogColor(log.level)
                  }}
                >
                  {log.level?.toUpperCase() || 'INFO'}
                </span>
                <div style={styles.logContent}>
                  <div style={styles.logMessage}>{log.message}</div>
                  <div style={styles.logMeta}>
                    {log.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'} 
                    {log.userId && ` • User: ${log.userId}`}
                    {log.action && ` • Action: ${log.action}`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p>No system logs found.</p>
              <button onClick={createSampleLogs} style={styles.refreshButton}>
                Create Sample Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}