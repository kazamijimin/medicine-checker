"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    systemNotifications: true,
    emailAlerts: true,
    maintenanceMode: false,
    allowUserRegistration: true,
    maxSearchesPerUser: 100,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    logRetentionDays: 30,
    apiRateLimit: 1000,
    maxFileUploadSize: 10
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
          await loadSettings();
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

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "systemSettings", "config"));
      if (settingsDoc.exists()) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsDoc.data()
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "systemSettings", "config"), {
        ...settings,
        lastUpdated: new Date(),
        updatedBy: user.uid
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage('Error saving settings. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px"
    },

    titleSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#ef4444",
      margin: 0
    },

    backButton: {
      padding: "8px 16px",
      backgroundColor: isDarkMode ? "#374151" : "#6b7280",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 0.3s ease"
    },

    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "24px"
    },

    card: {
      padding: "24px",
      border: "1px solid",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
      borderRadius: "12px",
      backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff"
    },

    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#ef4444",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },

    settingGroup: {
      marginBottom: "20px",
      paddingBottom: "16px",
      borderBottom: "1px solid",
      borderBottomColor: isDarkMode ? "#374151" : "#e5e7eb"
    },

    settingLabel: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "8px",
      display: "block",
      color: isDarkMode ? "#e5e7eb" : "#374151"
    },

    settingDescription: {
      fontSize: "12px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      marginBottom: "8px"
    },

    input: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid",
      borderColor: isDarkMode ? "#374151" : "#d1d5db",
      borderRadius: "6px",
      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      fontSize: "14px"
    },

    select: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid",
      borderColor: isDarkMode ? "#374151" : "#d1d5db",
      borderRadius: "6px",
      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#333333",
      fontSize: "14px"
    },

    checkbox: {
      marginRight: "8px",
      transform: "scale(1.2)"
    },

    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      fontSize: "14px"
    },

    saveButton: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      padding: "16px 32px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
      zIndex: 1000
    },

    message: {
      position: "fixed",
      top: "100px",
      right: "24px",
      padding: "12px 24px",
      backgroundColor: message.includes('Error') ? "#ef4444" : "#10b981",
      color: "white",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 1001,
      animation: "slideIn 0.3s ease"
    },

    unauthorizedContainer: {
      textAlign: "center",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "60px 20px"
    },

    unauthorizedTitle: {
      fontSize: "48px",
      marginBottom: "16px"
    },

    unauthorizedText: {
      fontSize: "18px",
      color: isDarkMode ? "#a1a1aa" : "#6b7280",
      marginBottom: "24px"
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={styles.container}>
          <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
            <p>Loading settings...</p>
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
          <div style={styles.unauthorizedContainer}>
            <div style={styles.unauthorizedTitle}>🚫</div>
            <h2>Access Denied</h2>
            <p style={styles.unauthorizedText}>
              You don&apos;t have permission to access admin settings.
            </p>
            <button 
              style={styles.backButton}
              onClick={() => router.push('/admin')}
            >
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
          <div style={styles.titleSection}>
            <span style={{ fontSize: "24px" }}>⚙️</span>
            <h1 style={styles.title}>System Settings</h1>
          </div>
          <button 
            style={styles.backButton}
            onClick={() => router.push('/admin')}
            onMouseOver={(e) => e.target.style.backgroundColor = isDarkMode ? "#4b5563" : "#374151"}
            onMouseOut={(e) => e.target.style.backgroundColor = isDarkMode ? "#374151" : "#6b7280"}
          >
            ← Back to Admin
          </button>
        </div>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <div style={styles.content}>
          {/* General Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>🔧</span>
              General Settings
            </h2>
            
            <div style={styles.settingGroup}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={settings.systemNotifications}
                  onChange={(e) => handleInputChange('systemNotifications', e.target.checked)}
                />
                Enable System Notifications
              </label>
              <div style={styles.settingDescription}>
                Allow the system to send notifications to users
              </div>
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={settings.emailAlerts}
                  onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                />
                Enable Email Alerts
              </label>
              <div style={styles.settingDescription}>
                Send email notifications for important events
              </div>
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                />
                Maintenance Mode
              </label>
              <div style={styles.settingDescription}>
                Temporarily disable the application for maintenance
              </div>
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={settings.allowUserRegistration}
                  onChange={(e) => handleInputChange('allowUserRegistration', e.target.checked)}
                />
                Allow User Registration
              </label>
              <div style={styles.settingDescription}>
                Allow new users to register for accounts
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>🔒</span>
              Security Settings
            </h2>
            
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Session Timeout (minutes)</label>
              <div style={styles.settingDescription}>
                Automatically log out users after inactivity
              </div>
              <input 
                type="number"
                style={styles.input}
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Max Searches Per User (per day)</label>
              <div style={styles.settingDescription}>
                Limit the number of searches a user can perform daily
              </div>
              <input 
                type="number"
                style={styles.input}
                value={settings.maxSearchesPerUser}
                onChange={(e) => handleInputChange('maxSearchesPerUser', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>API Rate Limit (requests/hour)</label>
              <div style={styles.settingDescription}>
                Maximum API requests per user per hour
              </div>
              <input 
                type="number"
                style={styles.input}
                value={settings.apiRateLimit}
                onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                min="100"
                max="10000"
              />
            </div>
          </div>

          {/* System Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span>💾</span>
              System Settings
            </h2>
            
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Backup Frequency</label>
              <div style={styles.settingDescription}>
                How often to backup the database
              </div>
              <select 
                style={styles.select}
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Log Retention (days)</label>
              <div style={styles.settingDescription}>
                How long to keep system logs
              </div>
              <input 
                type="number"
                style={styles.input}
                value={settings.logRetentionDays}
                onChange={(e) => handleInputChange('logRetentionDays', parseInt(e.target.value))}
                min="7"
                max="365"
              />
            </div>

            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Max File Upload Size (MB)</label>
              <div style={styles.settingDescription}>
                Maximum size for file uploads
              </div>
              <input 
                type="number"
                style={styles.input}
                value={settings.maxFileUploadSize}
                onChange={(e) => handleInputChange('maxFileUploadSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        <button 
          style={{
            ...styles.saveButton,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
          onClick={saveSettings}
          disabled={saving}
          onMouseOver={(e) => !saving && (e.target.style.backgroundColor = "#059669")}
          onMouseOut={(e) => !saving && (e.target.style.backgroundColor = "#10b981")}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </>
  );
}