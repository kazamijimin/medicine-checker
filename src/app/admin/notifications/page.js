"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AdminNotificationPanel } from "@/components/NotificationSystem";

export default function AdminNotificationsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access admin panel</div>;
  }

  // Add your admin authentication logic here
  // For example, check if user.email is in your admin list

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: isDarkMode ? "#fff" : "#333",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Admin Notification Panel
        </h1>

        <AdminNotificationPanel isDarkMode={isDarkMode} />

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <label
            style={{
              color: isDarkMode ? "#fff" : "#333",
              marginRight: "10px",
            }}
          >
            Dark Mode:
          </label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={(e) => setIsDarkMode(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}