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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // 👇 DIFFERENT APPROACH: Using onMouseDown instead of onClick
  const handleProfileMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🏠 PROFILE MOUSE DOWN - Starting navigation...");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    
    setTimeout(() => {
      window.location.href = '/profile';
      console.log("✅ Profile navigation initiated");
    }, 100);
  };

  const handleDashboardMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("📊 DASHBOARD MOUSE DOWN - Starting navigation...");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    
    setTimeout(() => {
      window.location.href = '/dashboard';
      console.log("✅ Dashboard navigation initiated");
    }, 100);
  };

  const handleSignOutMouseDown = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🚪 SIGN OUT MOUSE DOWN - Starting sign out...");
    
    if (isSigningOut) {
      console.log("⚠️ Already signing out, ignoring click");
      return;
    }
    
    setIsSigningOut(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    
    try {
      console.log("🔥 Calling Firebase signOut...");
      await signOut(auth);
      console.log("✅ Firebase sign out successful");
      
      setTimeout(() => {
        window.location.href = '/';
        console.log("✅ Redirecting to home page");
      }, 100);
      
    } catch (error) {
      console.error("❌ Sign out error:", error);
      alert(`Sign out failed: ${error.message}`);
      setIsSigningOut(false);
    }
  };

  // 👇 ALTERNATIVE: Create clickable divs instead of buttons
  const ProfileDiv = ({ children, onClick, className = "", style = {} }) => (
    <div
      onClick={onClick}
      onMouseDown={onClick}
      onTouchStart={onClick}
      className={`clickable-div ${className}`}
      style={{
        ...style,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
        touchAction: 'manipulation',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {children}
    </div>
  );

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
    setMobileMenuOpen(false);
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

          if (user.photoURL) {
            console.log("Using Google photoURL:", user.photoURL);
            setUserProfilePicture(user.photoURL);
            setLoading(false);
            return;
          }

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

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Function to get profile image source with better fallback
  const getProfileImageSrc = () => {
    if (loading) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=35`;
    }
    
    if (userProfilePicture) {
      return userProfilePicture;
    }
    
    if (user?.photoURL) {
      return user.photoURL;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=35`;
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
        return user.displayName;
      } else {
        return user.displayName.split(' ')[0];
      }
    }
    
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <nav style={currentStyles.nav} className="navbar">
      <div style={currentStyles.navContainer}>
        {/* Logo */}
        <div style={currentStyles.logo} onClick={() => router.push('/home')} className="logo">
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
          {user && (
            <button
              onClick={() => router.push('/pharmacy-locator')}
              style={currentStyles.navLink}
              className="nav-link"
            >
              🏥 Pharmacies
            </button>
          )}
          
          {/* Theme Toggle */}
          <div className="theme-toggle-desktop">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </div>
          
          {user ? (
            <div style={currentStyles.userMenu}>
              <div 
                style={currentStyles.profileContainer}
                onClick={() => {
                  console.log("🎯 Profile container clicked!");
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="profile-container"
              >
                <img 
                  src={getProfileImageSrc()}
                  alt="Profile"
                  style={currentStyles.avatar}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=10b981&color=fff&size=35`;
                  }}
                />
                <span style={currentStyles.userName} className="user-name-desktop">
                  {getDisplayName()}
                </span>
                <span style={{
                  ...currentStyles.dropdownArrow,
                  transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
              
              {/* 👇 NEW APPROACH: Using clickable divs instead of buttons */}
              {profileDropdownOpen && (
                <div 
                  style={currentStyles.dropdown}
                  className="dropdown"
                >
                  <div style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "12px",
                    color: "#10b981",
                    fontWeight: "600"
                  }}>
                    {getDisplayName(true)}
                  </div>
                  

                  
                  {/* 👇 Profile div */}
                  <ProfileDiv
                    onClick={handleProfileMouseDown}
                    style={currentStyles.dropdownItem}
                    className="dropdown-profile-btn"
                  >
                    👤 Profile
                  </ProfileDiv>
                  
                  {/* 👇 Dashboard div */}
                  <ProfileDiv
                    onClick={handleDashboardMouseDown}
                    style={currentStyles.dropdownItem}
                    className="dropdown-dashboard-btn"
                  >
                    📊 Dashboard
                  </ProfileDiv>
                  
                  {/* 👇 Sign out div */}
                  <ProfileDiv
                    onClick={handleSignOutMouseDown}
                    style={{
                      ...currentStyles.dropdownItemDanger,
                      opacity: isSigningOut ? 0.6 : 1,
                      cursor: isSigningOut ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSigningOut ? '⏳ Signing Out...' : '🚪 Sign Out'}
                  </ProfileDiv>
                </div>
              )}
            </div>
          ) : (
            <div style={currentStyles.authButtons} className="auth-buttons-desktop">
              <button 
                onClick={() => router.push('/login')}
                style={currentStyles.loginBtn}
                className="login-btn"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                style={currentStyles.signUpBtn}
                className="signup-btn"
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
            
            {user && (
              <button
                onClick={() => {
                  router.push('/pharmacy-locator');
                  setMobileMenuOpen(false);
                }}
                style={currentStyles.mobileNavLink}
                className="mobile-nav-link"
              >
                <span style={currentStyles.mobileNavIcon}>🏥</span>
                Find Pharmacy
              </button>
            )}
            
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
                      {getDisplayName(true)}
                    </span>
                    <div style={currentStyles.mobileUserEmail}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                {/* 👇 Mobile clickable divs */}
                <ProfileDiv
                  onClick={handleProfileMouseDown}
                  style={currentStyles.mobileDashboardBtn}
                  className="mobile-btn mobile-profile-btn"
                >
                  👤 Profile
                </ProfileDiv>
                
                <ProfileDiv
                  onClick={handleDashboardMouseDown}
                  style={currentStyles.mobileDashboardBtn}
                  className="mobile-btn mobile-dashboard-btn"
                >
                  📊 Dashboard
                </ProfileDiv>
                
                <ProfileDiv
                  onClick={handleSignOutMouseDown}
                  style={{
                    ...currentStyles.mobileSignOutBtn,
                    opacity: isSigningOut ? 0.6 : 1,
                    cursor: isSigningOut ? 'not-allowed' : 'pointer'
                  }}
                  className="mobile-btn"
                >
                  {isSigningOut ? '⏳ Signing Out...' : '🚪 Sign Out'}
                </ProfileDiv>
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

// 👇 KEEP: All your existing styles
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
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  logoIcon: {
    fontSize: "24px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  navLink: {
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "color 0.3s ease",
    position: "relative",
    padding: "8px 0",
    cursor: "pointer",
    background: "transparent",
    border: "none",
  },
  userMenu: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    pointerEvents: "auto",
    userSelect: "none",
    position: "relative",
    zIndex: 50,
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "500",
  },
  dropdownArrow: {
    fontSize: "10px",
    transition: "transform 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    minWidth: "180px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 9999,
    pointerEvents: "auto",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
    pointerEvents: "auto",
    userSelect: "none",
    display: "block",
  },
  dropdownItemDanger: {
    width: "100%",
    padding: "12px 16px",
    color: "#dc3545",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
    pointerEvents: "auto",
    userSelect: "none",
    display: "block",
  },
  authButtons: {
    display: "flex",
    gap: "12px",
  },
  loginBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#10b981",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  signUpBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    fontSize: "13px",
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
    width: "22px",
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
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
    width: "40px",
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
    pointerEvents: "auto",
    userSelect: "none",
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
    pointerEvents: "auto",
    userSelect: "none",
  },
};

// 👇 KEEP: Light and dark styles (same as before)
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

const darkStyles = {
  ...lightStyles,
  nav: {
    ...baseStyles.nav,
    background: "#1a1a1a",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
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

// 👇 NEW: Enhanced CSS for clickable divs
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    /* Ensure clickable divs work */
    .clickable-div {
      pointer-events: auto !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
    
    .clickable-div:hover {
      background-color: rgba(16, 185, 129, 0.1) !important;
    }
    
    .clickable-div:active {
      background-color: rgba(16, 185, 129, 0.2) !important;
    }
    
    /* Remove any conflicting styles */
    .navbar *, .dropdown *, .mobile-menu * {
      pointer-events: auto !important;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .nav-links { display: none !important; }
      .mobile-menu-btn { display: block !important; }
      .mobile-menu { display: block !important; }
      .theme-toggle-desktop { display: none !important; }
      .user-name-desktop { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}