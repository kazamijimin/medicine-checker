"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        // Allow guest access instead of redirecting
        setIsGuest(true);
      } else {
        setIsGuest(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsGuest(true);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
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

  const currentStyles = isDarkMode ? darkStyles : lightStyles;
  const displayName = user?.displayName || user?.email || 'Guest';
  const userName = user ? (user.displayName?.split(' ')[0] || 'User') : 'Guest';

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
              {user ? (
                <>
                  <Image
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=007bff&color=fff`}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    style={styles.avatar}
                    unoptimized={true}
                  />
                  <span style={currentStyles.userName}>{displayName}</span>
                  <button onClick={handleSignOut} style={currentStyles.signOutButton}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.guestAvatar}>👤</div>
                  <span style={currentStyles.userName}>Guest User</span>
                  <button onClick={handleSignIn} style={currentStyles.signInButton}>
                    Sign In
                  </button>
                </>
              )}
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
              Welcome back, {userName}! 👋
            </h1>
            <p style={currentStyles.welcomeSubtitle}>
              {isGuest 
                ? "Explore our featured projects as a guest. Sign in for a personalized experience!" 
                : "Your personal dashboard with quick access to your featured projects."
              }
            </p>
          </section>

          {/* Guest Info Banner */}
          {isGuest && (
            <section style={currentStyles.guestBanner}>
              <div style={currentStyles.guestBannerContent}>
                <span style={currentStyles.guestBannerIcon}>ℹ️</span>
                <span style={currentStyles.guestBannerText}>
                  You&apos;re browsing as a guest. 
                  <button 
                    onClick={handleSignIn} 
                    style={currentStyles.guestSignInLink}
                  >
                    Sign in
                  </button> 
                  for full access to features!
                </span>
              </div>
            </section>
          )}

          {/* Featured Apps Section */}
          <section style={currentStyles.actionsSection}>
            <h2 style={currentStyles.sectionTitle}>🌟 Multi-System Projects</h2>
            <div style={styles.featuredGrid}>
              
              {/* Medicine Checker App */}
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

              {/* Tsukihime Design Project */}
              <div style={currentStyles.featuredCard}>
                <div style={styles.featuredIcon}>🌙</div>
                <h3 style={currentStyles.featuredTitle}>Tsukihime Design</h3>
                <p style={currentStyles.featuredDescription}>
                  🎨 Beautiful and elegant design inspired by the Tsukihime visual novel. 
                  Experience stunning UI/UX with modern web technologies and artistic aesthetics.
                </p>
                <div style={styles.featuredFeatures}>
                  <span style={currentStyles.featureBadgeSecondary}>🎨 Visual Design</span>
                  <span style={currentStyles.featureBadgeSecondary}>🌙 Dark Theme</span>
                  <span style={currentStyles.featureBadgeSecondary}>✨ Aesthetic UI</span>
                </div>
                <button 
                  style={currentStyles.featuredButtonSecondary}
                  onClick={() => handleRedirect('https://schoolproject-tsukiwebvn.vercel.app')}
                >
                  🌙 View Tsukihime Design
                </button>
              </div>

              {/* Prescriptory Project */}
              <div style={currentStyles.featuredCard}>
                <div style={styles.featuredIcon}>💊</div>
                <h3 style={currentStyles.featuredTitle}>Prescriptory</h3>
                <p style={currentStyles.featuredDescription}>
                  📋 Advanced prescription management system with comprehensive medication tracking, 
                  doctor consultations, and personalized healthcare management tools.
                </p>
                <div style={styles.featuredFeatures}>
                  <span style={currentStyles.featureBadgeTertiary}>📋 Prescriptions</span>
                  <span style={currentStyles.featureBadgeTertiary}>👨‍⚕️ Doctors</span>
                  <span style={currentStyles.featureBadgeTertiary}>🔔 Reminders</span>
                </div>
                <button 
                  style={currentStyles.featuredButtonTertiary}
                  onClick={() => handleRedirect('https://prescriptory-test.vercel.app')}
                >
                  💊 View Prescriptory
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
    borderRadius: '50%',
    objectFit: 'cover'
  },
  guestAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'white'
  },
  dashboardContent: {
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '20px'
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '40px',
    marginTop: '40px',
    alignItems: 'stretch',
    justifyContent: 'center'
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
    fontWeight: '500',
    transition: 'background-color 0.3s ease'
  },
  signInButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease'
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
    marginBottom: '40px'
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
  guestBanner: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #bbdefb',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '40px',
    textAlign: 'center'
  },
  guestBannerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  guestBannerIcon: {
    fontSize: '18px'
  },
  guestBannerText: {
    color: '#1976d2',
    fontWeight: '500'
  },
  guestSignInLink: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px'
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
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0,123,255,0.15)',
    border: '3px solid #007bff',
    textAlign: 'center',
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  featuredTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#007bff',
    margin: '0 0 20px 0'
  },
  featuredDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.7',
    marginBottom: '30px',
    flex: 1
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
  featureBadgeSecondary: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #ce93d8'
  },
  featureBadgeTertiary: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #81c784'
  },
  featuredButton: {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    border: 'none',
    padding: '18px 35px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 20px rgba(0,123,255,0.3)',
    alignSelf: 'center',
    width: 'fit-content'
  },
  featuredButtonSecondary: {
    background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
    color: 'white',
    border: 'none',
    padding: '18px 35px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 20px rgba(156,39,176,0.3)',
    alignSelf: 'center',
    width: 'fit-content'
  },
  featuredButtonTertiary: {
    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
    color: 'white',
    border: 'none',
    padding: '18px 35px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 20px rgba(46,125,50,0.3)',
    alignSelf: 'center',
    width: 'fit-content'
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
  guestBanner: {
    ...lightStyles.guestBanner,
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6'
  },
  guestBannerText: {
    ...lightStyles.guestBannerText,
    color: '#93c5fd'
  },
  guestSignInLink: {
    ...lightStyles.guestSignInLink,
    color: '#66b3ff'
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
  },
  featureBadgeSecondary: {
    ...lightStyles.featureBadgeSecondary,
    backgroundColor: '#4a148c',
    color: '#ce93d8',
    border: '1px solid #9c27b0'
  },
  featureBadgeTertiary: {
    ...lightStyles.featureBadgeTertiary,
    backgroundColor: '#1b5e20',
    color: '#81c784',
    border: '1px solid #2e7d32'
  }
};

// Updated CSS with responsive 3-card layout
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Featured card hover effects */
    .featured-card:hover {
      transform: translateY(-8px) !important;
    }
    
    .featured-button:hover, 
    .featured-button-secondary:hover,
    .featured-button-tertiary:hover {
      transform: translateY(-2px) !important;
    }
    
    /* Button hover effects */
    button:hover {
      opacity: 0.9 !important;
    }
    
    /* Ensure cards are equal height */
    [style*="featuredGrid"] > div {
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Desktop - 3 cards in a row */
    @media (min-width: 1200px) {
      [style*="featuredGrid"] {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 40px !important;
        max-width: 1500px !important;
        margin: 40px auto 0 !important;
      }
    }
    
    /* Laptop - 2 cards per row, third below */
    @media (min-width: 769px) and (max-width: 1199px) {
      [style*="featuredGrid"] {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 30px !important;
        margin: 40px 20px 0 !important;
      }
      
      [style*="featuredCard"] {
        padding: 35px 25px !important;
      }
    }
    
    /* Mobile - Stack vertically */
    @media (max-width: 768px) {
      [style*="featuredGrid"] {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 30px !important;
        margin: 40px 15px 0 !important;
      }
      
      [style*="featuredCard"] {
        margin: 0 !important;
        padding: 30px 20px !important;
        max-width: none !important;
      }
      
      [style*="featuredTitle"] {
        font-size: 24px !important;
      }
      
      [style*="featuredDescription"] {
        font-size: 15px !important;
      }
      
      [style*="featuredButton"], 
      [style*="featuredButtonSecondary"],
      [style*="featuredButtonTertiary"] {
        padding: 16px 28px !important;
        font-size: 15px !important;
      }
      
      [style*="welcomeTitle"] {
        font-size: 32px !important;
      }
      
      [style*="welcomeSubtitle"] {
        font-size: 18px !important;
      }
      
      [style*="sectionTitle"] {
        font-size: 24px !important;
      }
      
      [style*="guestBannerContent"] {
        flex-direction: column !important;
        gap: 5px !important;
      }
    }
    
    /* Very small mobile */
    @media (max-width: 480px) {
      [style*="featuredGrid"] {
        margin: 40px 10px 0 !important;
      }
      
      [style*="featuredCard"] {
        padding: 25px 15px !important;
      }
      
      [style*="featuredIcon"] {
        font-size: 48px !important;
      }
      
      [style*="featuredTitle"] {
        font-size: 22px !important;
      }
      
      [style*="featuredDescription"] {
        font-size: 14px !important;
      }
      
      [style*="welcomeTitle"] {
        font-size: 28px !important;
      }
      
      [style*="welcomeSubtitle"] {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}