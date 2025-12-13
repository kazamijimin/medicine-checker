"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

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
        color: isDarkMode ? "#ffffff" : "#333333",
        padding: "20px"
      }}>
        <div style={{ 
          textAlign: "center",
          maxWidth: "300px",
          width: "100%"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "3px solid #e9ecef",
            borderTop: "3px solid #28a745",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{
            fontSize: "16px",
            margin: "0",
            padding: "0 10px"
          }}>Loading MediChecker...</p>
        </div>
      </div>
    );
  }

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <>
      <div style={currentStyles.container}>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <Hero user={user} isDarkMode={isDarkMode} currentStyles={currentStyles} />
        <Stats isDarkMode={isDarkMode} />
        <Features isDarkMode={isDarkMode} />
        <HowItWorks isDarkMode={isDarkMode} />
        <About isDarkMode={isDarkMode} />
        <Testimonials isDarkMode={isDarkMode} />
        <FAQ isDarkMode={isDarkMode} />
        <Contact isDarkMode={isDarkMode} />
        <Footer isDarkMode={isDarkMode} />
        
        {/* Add AI Assistant - it will appear as floating button */}
        <AIAssistant isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

// Mobile-first responsive styles
const baseStyles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    lineHeight: 1.6,
    overflow: "hidden", // Prevent horizontal scroll
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "80px 16px 40px", // Mobile-first: top padding for navbar, side padding
    position: "relative",
  },
  heroContent: {
    maxWidth: "100%", // Mobile-first: full width
    width: "100%",
    padding: "0 8px", // Additional mobile padding
  },
  heroTitle: {
    fontSize: "28px", // Mobile-first: smaller starting size
    fontWeight: "700",
    marginBottom: "16px", // Smaller mobile margins
    lineHeight: "1.2",
    wordBreak: "break-word", // Prevent overflow
    hyphens: "auto", // Better text wrapping
  },
  highlight: {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block", // Better text rendering
  },
  heroSubtitle: {
    fontSize: "14px", // Mobile-first: smaller text
    marginBottom: "24px", // Smaller mobile margins
    opacity: 0.8,
    lineHeight: "1.6",
    padding: "0 8px", // Mobile text padding
    maxWidth: "100%",
  },
  heroButtons: {
    display: "flex",
    gap: "12px", // Smaller mobile gaps
    justifyContent: "center",
    flexDirection: "column", // Mobile-first: stack vertically
    alignItems: "center",
    width: "100%",
    padding: "0 16px", // Mobile button container padding
  },
  primaryButton: {
    padding: "14px 24px", // Smaller mobile padding
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px", // Mobile-appropriate size
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
    width: "100%", // Full width on mobile
    maxWidth: "280px", // Constrain maximum width
    minHeight: "48px", // Minimum touch target
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    padding: "14px 24px", // Smaller mobile padding
    background: "transparent",
    border: "2px solid #28a745",
    borderRadius: "12px",
    fontSize: "16px", // Mobile-appropriate size
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    width: "100%", // Full width on mobile
    maxWidth: "280px", // Constrain maximum width
    minHeight: "48px", // Minimum touch target
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeBack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px", // Smaller mobile gaps
    width: "100%",
    padding: "0 16px", // Mobile padding
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px", // Smaller mobile gaps
    flexDirection: "column", // Mobile-first: stack vertically
    textAlign: "center",
    width: "100%",
  },
  userAvatar: {
    width: "64px", // Smaller on mobile
    height: "64px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #28a745", // Slightly thinner border
  },
  welcomeText: {
    fontSize: "20px", // Smaller mobile text
    margin: 0,
    padding: "0 8px",
    textAlign: "center",
    wordBreak: "break-word",
  },
  ctaButton: {
    padding: "14px 24px", // Smaller mobile padding
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px", // Mobile-appropriate size
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
    width: "100%", // Full width on mobile
    maxWidth: "280px", // Constrain maximum width
    minHeight: "48px", // Minimum touch target
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// Light Theme with mobile responsiveness
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

// Dark Theme with mobile responsiveness
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

// Enhanced CSS with comprehensive mobile responsiveness
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    
    /* Global mobile optimizations */
    * {
      box-sizing: border-box;
    }
    
    html {
      font-size: 16px;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Mobile-first responsive breakpoints */
    
    /* Small mobile phones (320px and up) */
    @media (min-width: 320px) {
      .hero-title {
        font-size: 32px !important;
      }
      
      .hero-subtitle {
        font-size: 15px !important;
      }
      
      .hero-buttons {
        gap: 14px !important;
      }
      
      .user-avatar {
        width: 70px !important;
        height: 70px !important;
      }
    }
    
    /* Mobile phones (375px and up) */
    @media (min-width: 375px) {
      .hero-title {
        font-size: 36px !important;
      }
      
      .hero-subtitle {
        font-size: 16px !important;
        padding: 0 12px !important;
      }
      
      .hero-buttons {
        gap: 16px !important;
        padding: 0 20px !important;
      }
      
      .primary-button, .secondary-button, .cta-button {
        padding: 16px 28px !important;
        font-size: 17px !important;
      }
    }
    
    /* Large mobile phones (414px and up) */
    @media (min-width: 414px) {
      .hero-title {
        font-size: 40px !important;
      }
      
      .hero-content {
        padding: 0 12px !important;
      }
      
      .user-avatar {
        width: 75px !important;
        height: 75px !important;
      }
      
      .welcome-text {
        font-size: 22px !important;
      }
    }
    
    /* Small tablets (768px and up) */
    @media (min-width: 768px) {
      .hero {
        padding: 100px 32px 60px !important;
      }
      
      .hero-content {
        max-width: 600px !important;
        padding: 0 !important;
      }
      
      .hero-title {
        font-size: 48px !important;
        margin-bottom: 20px !important;
      }
      
      .hero-subtitle {
        font-size: 18px !important;
        margin-bottom: 32px !important;
        padding: 0 !important;
      }
      
      .hero-buttons {
        flex-direction: row !important;
        gap: 20px !important;
        padding: 0 !important;
      }
      
      .primary-button, .secondary-button, .cta-button {
        width: auto !important;
        padding: 16px 32px !important;
        font-size: 18px !important;
      }
      
      .user-info {
        flex-direction: row !important;
        gap: 15px !important;
      }
      
      .user-avatar {
        width: 80px !important;
        height: 80px !important;
      }
      
      .welcome-text {
        font-size: 24px !important;
        text-align: left !important;
      }
      
      .welcome-back {
        gap: 20px !important;
        padding: 0 !important;
      }
    }
    
    /* Large tablets and small desktops (1024px and up) */
    @media (min-width: 1024px) {
      .hero-content {
        max-width: 800px !important;
      }
      
      .hero-title {
        font-size: 56px !important;
      }
      
      .hero-subtitle {
        font-size: 20px !important;
        margin-bottom: 40px !important;
      }
      
      .hero-buttons {
        gap: 24px !important;
      }
    }
    
    /* Large desktops (1200px and up) */
    @media (min-width: 1200px) {
      .hero-title {
        font-size: 64px !important;
      }
    }
    
    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      .primary-button, .secondary-button, .cta-button {
        min-height: 48px !important;
        padding: 16px 24px !important;
      }
      
      .primary-button:active, .secondary-button:active, .cta-button:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
    }
    
    /* Landscape orientation on mobile */
    @media (max-height: 500px) and (orientation: landscape) {
      .hero {
        padding: 80px 16px 30px !important;
        min-height: auto !important;
      }
      
      .hero-title {
        font-size: 32px !important;
        margin-bottom: 12px !important;
      }
      
      .hero-subtitle {
        font-size: 14px !important;
        margin-bottom: 20px !important;
      }
      
      .hero-buttons {
        gap: 12px !important;
      }
      
      .user-avatar {
        width: 50px !important;
        height: 50px !important;
      }
      
      .welcome-text {
        font-size: 18px !important;
      }
    }
    
    /* Very small screens (below 320px) */
    @media (max-width: 319px) {
      .hero {
        padding: 80px 12px 30px !important;
      }
      
      .hero-title {
        font-size: 24px !important;
        margin-bottom: 12px !important;
      }
      
      .hero-subtitle {
        font-size: 13px !important;
        margin-bottom: 20px !important;
        padding: 0 4px !important;
      }
      
      .hero-buttons {
        padding: 0 8px !important;
        gap: 10px !important;
      }
      
      .primary-button, .secondary-button, .cta-button {
        padding: 12px 20px !important;
        font-size: 14px !important;
        max-width: 240px !important;
      }
    }
    
    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .primary-button {
        border: 2px solid transparent !important;
      }
      
      .secondary-button {
        border-width: 3px !important;
      }
    }
    
    /* Print styles */
    @media print {
      .hero-buttons {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}