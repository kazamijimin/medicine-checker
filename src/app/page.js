"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <div style={currentStyles.container}>
      {/* Header */}
      <header style={currentStyles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🚀</span>
            <span style={styles.logoText}>Dashboard</span>
          </div>
          
          <div style={styles.headerRight}>
            <button onClick={toggleTheme} style={currentStyles.themeButton}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <div style={styles.userMenu}>
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=007bff&color=fff`}
                alt="User Avatar"
                style={styles.avatar}
              />
              <span style={currentStyles.userName}>{user.displayName || user.email}</span>
              <button onClick={handleSignOut} style={currentStyles.signOutButton}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={currentStyles.main}>
        <div style={styles.dashboardContent}>
          {/* Welcome Section */}
          <section style={currentStyles.welcomeSection}>
            <h1 style={currentStyles.welcomeTitle}>
              Welcome back, {user.displayName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p style={currentStyles.welcomeSubtitle}>
              Your personal dashboard with quick access to your medicine checker app.
            </p>
          </section>

          {/* Featured App Section */}
          <section style={currentStyles.actionsSection}>
            <h2 style={currentStyles.sectionTitle}>🌟 Featured App</h2>
            <div style={styles.featuredGrid}>
              <div style={currentStyles.featuredCard}>
                <div style={styles.featuredIcon}>🏥</div>
                <h3 style={currentStyles.featuredTitle}>Medicine Checker</h3>
                <p style={currentStyles.featuredDescription}>
                  🤖 Chat with Nick AI for medical advice, medicine information, and health guidance. 
                  Get instant answers to your health questions with our advanced AI assistant.
                </p>
                <div style={styles.featuredFeatures}>
                  <span style={currentStyles.featureBadge}>💊 Medicine Info</span>
                  <span style={currentStyles.featureBadge}>🤖 AI Assistant</span>
                  <span style={currentStyles.featureBadge}>⚕️ Health Advice</span>
                </div>
                <button 
                  style={currentStyles.featuredButton}
                  onClick={() => handleRedirect('https://medicine-checker.vercel.app/home')}
                >
                  🚀 Launch Medicine Checker
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Base styles
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: "'Poppins', sans-serif",
    gap: '20px'
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #e9ecef',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '28px'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#007bff'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  dashboardContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  featuredGrid: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px'
  },
  featuredIcon: {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  featuredFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '25px'
  }
};

// Light theme
const lightStyles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    color: '#333'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e9ecef',
    padding: '15px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  themeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.3s ease'
  },
  userName: {
    fontWeight: '500',
    color: '#333'
  },
  signOutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  main: {
    padding: '40px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)'
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  welcomeTitle: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '15px'
  },
  welcomeSubtitle: {
    fontSize: '20px',
    color: '#666',
    margin: 0
  },
  actionsSection: {
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '30px'
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0,123,255,0.15)',
    border: '3px solid #007bff',
    textAlign: 'center',
    maxWidth: '700px',
    width: '100%',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  featuredTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#007bff',
    margin: '0 0 20px 0'
  },
  featuredDescription: {
    fontSize: '18px',
    color: '#666',
    lineHeight: '1.7',
    marginBottom: '30px'
  },
  featureBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #bbdefb'
  },
  featuredButton: {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    border: 'none',
    padding: '20px 40px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 20px rgba(0,123,255,0.3)'
  }
};

// Dark theme
const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: '#1a1a1a',
    color: '#ffffff'
  },
  header: {
    ...lightStyles.header,
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #404040'
  },
  userName: {
    ...lightStyles.userName,
    color: '#ffffff'
  },
  welcomeTitle: {
    ...lightStyles.welcomeTitle,
    color: '#ffffff'
  },
  welcomeSubtitle: {
    ...lightStyles.welcomeSubtitle,
    color: '#b0b0b0'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#ffffff'
  },
  featuredCard: {
    ...lightStyles.featuredCard,
    backgroundColor: '#2d2d2d',
    boxShadow: '0 12px 40px rgba(0,123,255,0.2)',
    border: '3px solid #0066cc'
  },
  featuredTitle: {
    ...lightStyles.featuredTitle,
    color: '#66b3ff'
  },
  featuredDescription: {
    ...lightStyles.featuredDescription,
    color: '#b0b0b0'
  },
  featureBadge: {
    ...lightStyles.featureBadge,
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
    border: '1px solid #3b82f6'
  }
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .featured-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 50px rgba(0,123,255,0.3);
    }
    
    .featured-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,123,255,0.5);
    }
    
    @media (max-width: 768px) {
      .featured-card {
        margin: 0 15px;
        padding: 30px 20px;
      }
      
      .featured-title {
        font-size: 26px !important;
      }
      
      .featured-description {
        font-size: 16px !important;
      }
      
      .featured-button {
        padding: 16px 28px !important;
        font-size: 16px !important;
      }
      
      .welcome-title {
        font-size: 32px !important;
      }
      
      .welcome-subtitle {
        font-size: 18px !important;
      }
    }
  `;
  document.head.appendChild(style);
}