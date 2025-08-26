"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Home from "@/components/ui/Home";

export default function HomePage() {
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
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#333333"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "3px solid #e9ecef",
            borderTop: "3px solid #28a745",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p>Loading MediChecker...</p>
        </div>
      </div>
    );
  }

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <>
      {/* Import Poppins Font */}

      
      <div style={currentStyles.container}>
        {/* Navbar Component */}
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <Hero user={user} isDarkMode={isDarkMode} currentStyles={currentStyles} />
        <Features isDarkMode={isDarkMode} />
        <About isDarkMode={isDarkMode} />
        <Contact isDarkMode={isDarkMode} />
        <Home isDarkMode={isDarkMode} />

        <Footer isDarkTheme={isDarkMode} />

      </div>
    </>
  );
}

// Simplified Styles - Only for Hero section
const baseStyles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    lineHeight: 1.6,
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 20px",
    paddingTop: "70px",
  },
  heroContent: {
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 64px)",
    fontWeight: "700",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  highlight: {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 3vw, 20px)",
    marginBottom: "40px",
    opacity: 0.8,
    lineHeight: "1.6",
  },
  heroButtons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "16px 32px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
  },
  secondaryButton: {
    padding: "16px 32px",
    background: "transparent",
    border: "2px solid #28a745",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  welcomeBack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexDirection: "column",
  },
  userAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #28a745",
  },
  welcomeText: {
    fontSize: "24px",
    margin: 0,
  },
  ctaButton: {
    padding: "16px 32px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
  },
};

// Light Theme
const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  hero: {
    ...baseStyles.hero,
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  },
  heroTitle: {
    ...baseStyles.heroTitle,
    color: "#333333",
  },
  heroSubtitle: {
    ...baseStyles.heroSubtitle,
    color: "#666666",
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    color: "#28a745",
  },
  welcomeText: {
    ...baseStyles.welcomeText,
    color: "#333333",
  },
};

// Dark Theme
const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
  },
  hero: {
    ...baseStyles.hero,
    background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
  },
  heroTitle: {
    ...baseStyles.heroTitle,
    color: "#ffffff",
  },
  heroSubtitle: {
    ...baseStyles.heroSubtitle,
    color: "#b0b0b0",
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    color: "#28a745",
  },
  welcomeText: {
    ...baseStyles.welcomeText,
    color: "#ffffff",
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .hero-buttons {
        flex-direction: column !important;
        align-items: center !important;
      }
      
      .user-info {
        flex-direction: column !important;
      }
    }
  `;
  document.head.appendChild(style);
}
