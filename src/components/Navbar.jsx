"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ui/ThemeToggle";

export default function Navbar({ user, isDarkMode, setIsDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Smooth scroll function
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Handle navigation click
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    smoothScrollTo(sectionId);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
      if (profileDropdownOpen && !event.target.closest('.profile-container')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, profileDropdownOpen]);

  // Fetch user's profile picture
  useEffect(() => {
    const fetchUserProfilePicture = async () => {
      if (user) {
        try {
          console.log("Fetching profile picture for user:", user.uid);
          
          // Method 1: Get from Firestore first (most reliable)
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            
            if (userData.profilePictureUrl) {
              console.log("Found profile picture URL in Firestore:", userData.profilePictureUrl);
              setUserProfilePicture(userData.profilePictureUrl);
              setLoading(false);
              return;
            }
          }

          // Method 2: Use Google's photoURL if available
          if (user.photoURL) {
            console.log("Using Google photoURL:", user.photoURL);
            setUserProfilePicture(user.photoURL);
            setLoading(false);
            return;
          }

          // Method 3: Try Supabase storage (only if previous methods fail)
          console.log("Checking Supabase storage...");
          
          const { data: files, error: listError } = await supabase.storage
            .from('profile-pictures')
            .list(`${user.uid}/`, {
              limit: 1,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (listError) {
            console.error("Supabase list error:", listError);
            setLoading(false);
            return;
          }

          if (files && files.length > 0) {
            console.log("Found files in Supabase:", files);
            
            const { data: urlData } = await supabase.storage
              .from('profile-pictures')
              .getPublicUrl(`${user.uid}/${files[0].name}`);
            
            if (urlData?.publicUrl) {
              console.log("Supabase public URL:", urlData.publicUrl);
              setUserProfilePicture(urlData.publicUrl);
            }
          } else {
            console.log("No files found in Supabase storage");
          }
          
        } catch (error) {
          console.error("Error fetching user profile picture:", error);
        }
      }
      setLoading(false);
    };

    fetchUserProfilePicture();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Function to get profile image source with better fallback
  const getProfileImageSrc = () => {
    console.log("=== DEBUG getProfileImageSrc ===");
    console.log("loading:", loading);
    console.log("userProfilePicture:", userProfilePicture);
    console.log("user?.photoURL:", user?.photoURL);
    console.log("user?.displayName:", user?.displayName);
    console.log("user?.email:", user?.email);
    
    // While loading, show letter avatar
    if (loading) {
      const loadingAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=35`;
      console.log("Returning loading avatar:", loadingAvatar);
      return loadingAvatar;
    }
    
    // Priority: Supabase URL > Google photoURL > Letter avatar
    if (userProfilePicture) {
      console.log("Returning userProfilePicture:", userProfilePicture);
      return userProfilePicture;
    }
    
    if (user?.photoURL) {
      console.log("Returning user.photoURL:", user.photoURL);
      return user.photoURL;
    }
    
    // Final fallback to letter avatar
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=35`;
    console.log("Returning fallback avatar:", fallbackAvatar);
    return fallbackAvatar;
  };

  const getMobileProfileImageSrc = () => {
    if (loading) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=40`;
    }
    
    if (userProfilePicture) {
      return userProfilePicture;
    }
    
    if (user?.photoURL) {
      return user.photoURL;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=40`;
  };

  // Helper function to get display name
  const getDisplayName = (fullName = false) => {
    if (user?.displayName) {
      if (fullName) {
        return user.displayName; // Return full name when needed
      } else {
        // Return only first name for navbar display
        return user.displayName.split(' ')[0];
      }
    }
    
    if (user?.email) {
      // Return email username without @domain
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <nav style={currentStyles.nav} className="navbar">
      <div style={currentStyles.navContainer}>
        {/* Logo */}
        <div style={currentStyles.logo} onClick={() => router.push('/')} className="logo">
          <span style={currentStyles.logoIcon}>💊</span>
          <span style={currentStyles.logoText}>MediChecker</span>
        </div>

        {/* Desktop Navigation */}
        <div style={currentStyles.navLinks} className="nav-links">
          <a 
            href="#features" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'features')}
            className="nav-link"
          >
            Features
          </a>
          <a 
            href="#about" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'about')}
            className="nav-link"
          >
            About
          </a>
          <a 
            href="#contact" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'contact')}
            className="nav-link"
          >
            Contact
          </a>
          
          {/* Theme Toggle */}
          <div className="theme-toggle-desktop">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </div>
          
          {user ? (
            <div style={currentStyles.userMenu}>
              <div 
                style={currentStyles.profileContainer}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="profile-container"
              >
                <img 
                  src={getProfileImageSrc()}
                  alt="Profile"
                  style={currentStyles.avatar}
                  onError={(e) => {
                    console.log("Image failed to load, falling back to letter avatar");
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=10b981&color=fff&size=35`;
                  }}
                />
                <span style={currentStyles.userName} className="user-name-desktop">
                  {getDisplayName()} {/* This will show only first name or email username */}
                </span>
                <span style={currentStyles.dropdownArrow}>▼</span>
              </div>
              
              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div style={currentStyles.dropdown} className="dropdown">
                  <div style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "12px",
                    color: "#10b981",
                    fontWeight: "600"
                  }}>
                    {getDisplayName(true)} {/* Show full name in dropdown */}
                  </div>
                  <button 
                    onClick={() => {
                      router.push('/profile');
                      setProfileDropdownOpen(false);
                    }}
                    style={currentStyles.dropdownItem}
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/dashboard');
                      setProfileDropdownOpen(false);
                    }}
                    style={currentStyles.dropdownItem}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleSignOut}
                    style={currentStyles.dropdownItemDanger}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={currentStyles.authButtons} className="auth-buttons-desktop">
              <button 
                onClick={() => router.push('/login')}
                style={currentStyles.loginBtn}
                className="login-btn"
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#10b981';
                }}
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                style={currentStyles.signUpBtn}
                className="signup-btn"
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={currentStyles.mobileMenuBtn}
          className="mobile-menu-btn"
          aria-label="Toggle mobile menu"
        >
          <span style={currentStyles.hamburger}>
            <span style={{
              ...currentStyles.hamburgerLine,
              transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></span>
            <span style={{
              ...currentStyles.hamburgerLine,
              opacity: mobileMenuOpen ? 0 : 1
            }}></span>
            <span style={{
              ...currentStyles.hamburgerLine,
              transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={currentStyles.mobileMenu} className="mobile-menu mobile-menu-container">
          <div style={currentStyles.mobileMenuContent}>
            {/* Mobile Theme Toggle */}
            <div style={currentStyles.mobileThemeToggle}>
              <span style={currentStyles.themeLabel}>Theme</span>
              <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            </div>

            <a 
              href="#features" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'features')}
              className="mobile-nav-link"
            >
              <span style={currentStyles.mobileNavIcon}>✨</span>
              Features
            </a>
            <a 
              href="#about" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'about')}
              className="mobile-nav-link"
            >
              <span style={currentStyles.mobileNavIcon}>ℹ️</span>
              About
            </a>
            <a 
              href="#contact" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'contact')}
              className="mobile-nav-link"
            >
              <span style={currentStyles.mobileNavIcon}>📧</span>
              Contact
            </a>
            
            {user ? (
              <div style={currentStyles.mobileUserSection}>
                <div style={currentStyles.mobileUserInfo}>
                  <img 
                    src={getMobileProfileImageSrc()}
                    alt="Profile"
                    style={currentStyles.mobileAvatar}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=10b981&color=fff&size=40`;
                    }}
                  />
                  <div style={currentStyles.mobileUserDetails}>
                    <span style={currentStyles.mobileUserName}>
                      {getDisplayName(true)} {/* Full name in mobile */}
                    </span>
                    <div style={currentStyles.mobileUserEmail}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    router.push('/profile');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileDashboardBtn}
                  className="mobile-btn"
                >
                  👤 Profile
                </button>
                <button 
                  onClick={() => {
                    router.push('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileDashboardBtn}
                  className="mobile-btn"
                >
                  📊 Dashboard
                </button>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileSignOutBtn}
                  className="mobile-btn"
                >
                  🚪 Sign Out
                </button>
              </div>
            ) : (
              <div style={currentStyles.mobileAuthButtons}>
                <button 
                  onClick={() => {
                    router.push('/login');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileLoginBtn}
                  className="mobile-btn"
                >
                  🔐 Login
                </button>
                <button 
                  onClick={() => {
                    router.push('/signup');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileSignUpBtn}
                  className="mobile-btn"
                >
                  🚀 Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// Base Styles with Enhanced Mobile Responsiveness
const baseStyles = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 16px", // Reduced for mobile
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px", // Reduced height for mobile
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Reduced gap for mobile
    fontSize: "20px", // Smaller on mobile
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  logoIcon: {
    fontSize: "24px", // Smaller on mobile
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px", // Reduced gap
  },
  navLink: {
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px", // Smaller font
    transition: "color 0.3s ease",
    position: "relative",
    padding: "8px 0",
    cursor: "pointer",
  },
  userMenu: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Reduced gap
    cursor: "pointer",
    padding: "6px 10px", // Smaller padding
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
  },
  avatar: {
    width: "32px", // Smaller avatar
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },
  userName: {
    fontSize: "13px", // Smaller text
    fontWeight: "500",
  },
  dropdownArrow: {
    fontSize: "10px", // Smaller arrow
    transition: "transform 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    minWidth: "160px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 1001,
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
  },
  dropdownItemDanger: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    color: "#dc3545",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
  },
  authButtons: {
    display: "flex",
    gap: "12px", // Reduced gap
  },
  loginBtn: {
    padding: "8px 16px", // Smaller padding
    background: "transparent",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#10b981",
    fontWeight: "600",
    fontSize: "13px", // Smaller font
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  signUpBtn: {
    padding: "8px 16px", // Smaller padding
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    fontSize: "13px", // Smaller font
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  mobileMenuBtn: {
    display: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "background-color 0.3s ease",
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    width: "22px", // Slightly smaller
    height: "16px",
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "#10b981",
    transition: "all 0.3s ease",
    transformOrigin: "center",
    borderRadius: "1px",
  },
  mobileMenu: {
    display: "none",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: "calc(100vh - 60px)",
    overflowY: "auto",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    animation: "slideDown 0.3s ease",
  },
  mobileMenuContent: {
    padding: "16px", // Reduced padding
    display: "flex",
    flexDirection: "column",
    gap: "12px", // Reduced gap
  },
  mobileThemeToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    marginBottom: "8px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  themeLabel: {
    fontSize: "14px",
    fontWeight: "500",
  },
  mobileNavLink: {
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "16px",
    padding: "14px 16px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileNavIcon: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center",
  },
  mobileUserSection: {
    marginTop: "8px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  mobileAvatar: {
    width: "40px", // Larger avatar for mobile
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },
  mobileUserDetails: {
    flex: 1,
    minWidth: 0,
  },
  mobileUserName: {
    fontWeight: "600",
    fontSize: "16px",
    display: "block",
    marginBottom: "2px",
  },
  mobileUserEmail: {
    fontSize: "12px",
    opacity: 0.7,
    fontWeight: "400",
  },
  mobileAuthButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileLoginBtn: {
    padding: "14px 16px",
    background: "transparent",
    border: "2px solid #10b981",
    borderRadius: "12px",
    color: "#10b981",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  mobileSignUpBtn: {
    padding: "14px 16px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  mobileDashboardBtn: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  mobileSignOutBtn: {
    padding: "12px 16px",
    background: "transparent",
    border: "2px solid #dc3545",
    borderRadius: "12px",
    color: "#dc3545",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

// Light Theme Styles
const lightStyles = {
  ...baseStyles,
  nav: {
    ...baseStyles.nav,
    background: "rgba(255,255,255,0.95)",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  logoText: {
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navLink: {
    ...baseStyles.navLink,
    color: "#334155",
  },
  userName: {
    ...baseStyles.userName,
    color: "#334155",
  },
  themeLabel: {
    ...baseStyles.themeLabel,
    color: "#334155",
  },
  mobileUserName: {
    ...baseStyles.mobileUserName,
    color: "#334155",
  },
  mobileUserEmail: {
    ...baseStyles.mobileUserEmail,
    color: "#334155",
  },
  profileContainer: {
    ...baseStyles.profileContainer,
  },
  mobileMenuBtn: {
    ...baseStyles.mobileMenuBtn,
  },
  dropdown: {
    ...baseStyles.dropdown,
    background: "white",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  dropdownItem: {
    ...baseStyles.dropdownItem,
    color: "#334155",
  },
  mobileMenu: {
    ...baseStyles.mobileMenu,
    background: "rgba(255,255,255,0.98)",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  mobileNavLink: {
    ...baseStyles.mobileNavLink,
    color: "#334155",
  },
  mobileThemeToggle: {
    ...baseStyles.mobileThemeToggle,
    background: "rgba(248,250,252,0.5)",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  mobileUserInfo: {
    ...baseStyles.mobileUserInfo,
    background: "rgba(248,250,252,0.5)",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  mobileUserSection: {
    ...baseStyles.mobileUserSection,
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  mobileAuthButtons: {
    ...baseStyles.mobileAuthButtons,
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
};

// Dark Theme Styles
const darkStyles = {
  ...lightStyles,
  nav: {
    ...baseStyles.nav,
    background: "rgba(26,26,26,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoText: {
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navLink: {
    ...baseStyles.navLink,
    color: "#f1f5f9",
  },
  userName: {
    ...baseStyles.userName,
    color: "#f1f5f9",
  },
  themeLabel: {
    ...baseStyles.themeLabel,
    color: "#f1f5f9",
  },
  mobileUserName: {
    ...baseStyles.mobileUserName,
    color: "#f1f5f9",
  },
  mobileUserEmail: {
    ...baseStyles.mobileUserEmail,
    color: "#f1f5f9",
  },
  dropdown: {
    ...baseStyles.dropdown,
    background: "#2d2d2d",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  dropdownItem: {
    ...baseStyles.dropdownItem,
    color: "#f1f5f9",
  },
  mobileMenu: {
    ...baseStyles.mobileMenu,
    background: "rgba(26,26,26,0.98)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileNavLink: {
    ...baseStyles.mobileNavLink,
    color: "#f1f5f9",
  },
  mobileThemeToggle: {
    ...baseStyles.mobileThemeToggle,
    background: "rgba(45,45,45,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  mobileUserInfo: {
    ...baseStyles.mobileUserInfo,
    background: "rgba(45,45,45,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  mobileUserSection: {
    ...baseStyles.mobileUserSection,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileAuthButtons: {
    ...baseStyles.mobileAuthButtons,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};

// Enhanced CSS animations and media queries
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Mobile-first responsive design */
    @media (max-width: 768px) {
      .nav-links {
        display: none !important;
      }
      
      .mobile-menu-btn {
        display: block !important;
      }
      
      .mobile-menu {
        display: block !important;
      }
      
      .theme-toggle-desktop {
        display: none !important;
      }
      
      .user-name-desktop {
        display: none !important;
      }
      
      .auth-buttons-desktop .login-btn,
      .auth-buttons-desktop .signup-btn {
        padding: 6px 12px !important;
        font-size: 12px !important;
      }
    }
    
    @media (max-width: 480px) {
      .navbar .logo {
        font-size: 18px !important;
      }
      
      .navbar .logo span:first-child {
        font-size: 20px !important;
      }
      
      .mobile-menu-content {
        padding: 12px !important;
      }
    }
    
    @media (max-width: 320px) {
      .navbar {
        height: 55px !important;
      }
      
      .nav-container {
        height: 55px !important;
        padding: 0 12px !important;
      }
      
      .logo {
        font-size: 16px !important;
        gap: 6px !important;
      }
      
      .logo span:first-child {
        font-size: 18px !important;
      }
    }
    
    /* Desktop hover effects */
    @media (min-width: 769px) {
      .logo:hover {
        transform: scale(1.05);
      }
      
      .nav-link:hover::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
        animation: slideIn 0.3s ease;
      }
      
      .profile-container:hover {
        background-color: rgba(16, 185, 129, 0.05) !important;
      }
      
      .dropdown-item:hover {
        background-color: rgba(16, 185, 129, 0.05) !important;
      }
    }
    
    /* Mobile touch improvements */
    @media (max-width: 768px) {
      .mobile-nav-link:hover,
      .mobile-nav-link:active {
        background-color: rgba(16, 185, 129, 0.1) !important;
        transform: translateX(4px);
      }
      
      .mobile-btn:hover,
      .mobile-btn:active {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .mobile-menu-btn:hover {
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
    }
    
    @keyframes slideIn {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }

    /* Smooth scrolling for the entire page */
    html {
      scroll-behavior: smooth;
    }
    
    /* Improve touch targets */
    @media (max-width: 768px) {
      .mobile-nav-link,
      .mobile-btn {
        min-height: 44px;
        display: flex;
        align-items: center;
      }
    }
    
    /* Hide scrollbar but keep functionality */
    .mobile-menu {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .mobile-menu::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}