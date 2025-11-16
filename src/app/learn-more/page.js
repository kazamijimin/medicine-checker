"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DetailedFeatures from "@/components/learn-more/DetailedFeatures";
import UseCases from "@/components/learn-more/UseCases";
import TechnologyStack from "@/components/learn-more/TechnologyStack";
import SecurityInfo from "@/components/learn-more/SecurityInfo";
import GetStartedGuide from "@/components/learn-more/GetStartedGuide";

export default function LearnMorePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#333333",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "3px solid #e9ecef",
            borderTop: "3px solid #10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{ fontSize: "16px", margin: "0" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <div style={currentStyles.container}>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section style={currentStyles.hero}>
        <div style={currentStyles.heroContent}>
          <h1 style={currentStyles.heroTitle}>
            Discover the Power of <span style={currentStyles.highlight}>MediChecker</span>
          </h1>
          <p style={currentStyles.heroSubtitle}>
            A comprehensive guide to understanding how MediChecker helps you manage medications safely and effectively
          </p>
          <div style={currentStyles.breadcrumb}>
            <a href="/home" style={currentStyles.breadcrumbLink}>Home</a>
            <span style={currentStyles.breadcrumbSeparator}>/</span>
            <span style={currentStyles.breadcrumbCurrent}>Learn More</span>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <DetailedFeatures isDarkMode={isDarkMode} />
      <UseCases isDarkMode={isDarkMode} />
      <TechnologyStack isDarkMode={isDarkMode} />
      <SecurityInfo isDarkMode={isDarkMode} />
      <GetStartedGuide isDarkMode={isDarkMode} />
      
      <Footer isDarkTheme={isDarkMode} />
    </div>
  );
}

// Light Theme Styles
const lightStyles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
  },
  hero: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "120px 20px 80px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  highlight: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "20px",
    color: "#ffffff",
    opacity: 0.9,
    marginBottom: "30px",
    lineHeight: "1.6",
    maxWidth: "700px",
    margin: "0 auto 30px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#ffffff",
    opacity: 0.8,
  },
  breadcrumbLink: {
    color: "#ffffff",
    textDecoration: "none",
    transition: "opacity 0.3s ease",
  },
  breadcrumbSeparator: {
    opacity: 0.6,
  },
  breadcrumbCurrent: {
    fontWeight: "600",
  },
};

// Dark Theme Styles
const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#f1f5f9",
  },
  hero: {
    ...lightStyles.hero,
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
};

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 32px !important;
      }
      
      p {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}