"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, query, where } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminAlertsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    type: "info",
    targetUsers: "all"
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
          await loadAlerts();
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

  const loadAlerts = async () => {
    try {
      const alertsSnapshot = await getDocs(collection(db, "alerts"));
      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const sendAlert = async () => {
    try {
      await addDoc(collection(db, "alerts"), {
        ...newAlert,
        status: "pending",
        createdAt: new Date(),
        createdBy: user.uid,
        sentAt: null
      });
      setNewAlert({
        title: "",
        message: "",
        type: "info",
        targetUsers: "all"
      });
      await loadAlerts();
    } catch (error) {
      console.error("Error sending alert:", error);
    }
  };

  const markAsSent = async (alertId) => {
    try {
      await updateDoc(doc(db, "alerts", alertId), {
        status: "sent",
        sentAt: new Date()
      });
      await loadAlerts();
    } catch (error) {
      console.error("Error updating alert:", error);
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
    alertForm: {
      maxWidth: "1200px",
      margin: "0 auto 40px",
      padding: "24px",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#f8f9fa",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#e9ecef"
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "8px 0",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#ccc",
      borderRadius: "6px",
      backgroundColor: isDarkMode ? "#3a3a3a" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333"
    },
    textarea: {
      width: "100%",
      padding: "12px",
      margin: "8px 0",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#ccc",
      borderRadius: "6px",
      backgroundColor: isDarkMode ? "#3a3a3a" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      minHeight: "100px",
      resize: "vertical"
    },
    select: {
      width: "100%",
      padding: "12px",
      margin: "8px 0",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#ccc",
      borderRadius: "6px",
      backgroundColor: isDarkMode ? "#3a3a3a" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333"
    },
    sendButton: {
      padding: "12px 24px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginTop: "16px"
    },
    alertsList: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gap: "16px"
    },
    alertCard: {
      padding: "20px",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#f8f9fa",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: isDarkMode ? "#404040" : "#e9ecef"
    },
    alertHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px"
    },
    alertTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#ef4444"
    },
    statusBadge: {
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600"
    },
    pendingStatus: {
      backgroundColor: "#f59e0b",
      color: "white"
    },
    sentStatus: {
      backgroundColor: "#10b981",
      color: "white"
    },
    markSentButton: {
      padding: "6px 12px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: "12px"
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={styles.container}>
          <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <p>Loading alerts...</p>
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
          <h1 style={styles.title}>⚠️ Send Alerts</h1>
          <button onClick={() => router.push('/admin')} style={styles.backButton}>
            Back to Admin Panel
          </button>
        </div>

        <div style={styles.alertForm}>
          <h3 style={{ marginBottom: "20px" }}>Create New Alert</h3>
          
          <input
            style={styles.input}
            placeholder="Alert Title"
            value={newAlert.title}
            onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
          />
          
          <textarea
            style={styles.textarea}
            placeholder="Alert Message"
            value={newAlert.message}
            onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
          />
          
          <select
            style={styles.select}
            value={newAlert.type}
            onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
          
          <select
            style={styles.select}
            value={newAlert.targetUsers}
            onChange={(e) => setNewAlert({...newAlert, targetUsers: e.target.value})}
          >
            <option value="all">All Users</option>
            <option value="admins">Admins Only</option>
            <option value="users">Regular Users Only</option>
          </select>
          
          <button onClick={sendAlert} style={styles.sendButton}>
            Send Alert
          </button>
        </div>

        <div style={styles.alertsList}>
          <h3 style={{ marginBottom: "20px" }}>Alert History</h3>
          {alerts.map((alert) => (
            <div key={alert.id} style={styles.alertCard}>
              <div style={styles.alertHeader}>
                <h4 style={styles.alertTitle}>{alert.title}</h4>
                <span 
                  style={{
                    ...styles.statusBadge,
                    ...(alert.status === 'pending' ? styles.pendingStatus : styles.sentStatus)
                  }}
                >
                  {alert.status}
                </span>
              </div>
              <p><strong>Message:</strong> {alert.message}</p>
              <p><strong>Type:</strong> {alert.type}</p>
              <p><strong>Target:</strong> {alert.targetUsers}</p>
              <p><strong>Created:</strong> {alert.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
              {alert.status === 'pending' && (
                <button 
                  onClick={() => markAsSent(alert.id)} 
                  style={styles.markSentButton}
                >
                  Mark as Sent
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}