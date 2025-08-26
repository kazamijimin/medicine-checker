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
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=30`;
    }
    
    if (userProfilePicture) {
      return userProfilePicture;
    }
    
    if (user?.photoURL) {
      return user.photoURL;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=10b981&color=fff&size=30`;
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
    <nav style={currentStyles.nav}>
      <div style={currentStyles.navContainer}>
        {/* Logo */}
        <div style={currentStyles.logo} onClick={() => router.push('/')}>
          <span style={currentStyles.logoIcon}>💊</span>
          <span style={currentStyles.logoText}>MediChecker</span>
        </div>

        {/* Desktop Navigation */}
        <div style={currentStyles.navLinks}>
          <a 
            href="#features" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>
          <a 
            href="#about" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
          <a 
            href="#contact" 
            style={currentStyles.navLink}
            onClick={(e) => handleNavClick(e, 'contact')}
          >
            Contact
          </a>
          
          {/* Theme Toggle */}
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          
          {user ? (
            <div style={currentStyles.userMenu}>
              <div 
                style={currentStyles.profileContainer}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
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
                <span style={currentStyles.userName}>
                  {getDisplayName()} {/* This will show only first name or email username */}
                </span>
                <span style={currentStyles.dropdownArrow}>▼</span>
              </div>
              
              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div style={currentStyles.dropdown}>
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
            <div style={currentStyles.authButtons}>
              <button 
                onClick={() => router.push('/login')}
                style={currentStyles.loginBtn}
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
        <div style={currentStyles.mobileMenu}>
          <div style={currentStyles.mobileMenuContent}>
            <a 
              href="#features" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'features')}
            >
              Features
            </a>
            <a 
              href="#about" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a 
              href="#contact" 
              style={currentStyles.mobileNavLink}
              onClick={(e) => handleNavClick(e, 'contact')}
            >
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
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=10b981&color=fff&size=30`;
                    }}
                  />
                  <div>
                    <span style={currentStyles.mobileUserName}>
                      {getDisplayName()} {/* First name only */}
                    </span>
                    <div style={{
                      fontSize: "12px",
                      color: "#10b981",
                      fontWeight: "500"
                    }}>
                      {getDisplayName(true)} {/* Full name below */}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    router.push('/profile');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileDashboardBtn}
                >
                  Profile
                </button>
                <button 
                  onClick={() => {
                    router.push('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileDashboardBtn}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileSignOutBtn}
                >
                  Sign Out
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
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    router.push('/signup');
                    setMobileMenuOpen(false);
                  }}
                  style={currentStyles.mobileSignUpBtn}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// Base Styles with Emerald/Teal Theme
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
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "70px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "24px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  logoIcon: {
    fontSize: "28px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },
  navLink: {
    textDecoration: "none",
    fontWeight: "500",
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
    gap: "10px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },
  dropdownArrow: {
    fontSize: "12px",
    transition: "transform 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    minWidth: "150px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
    transition: "background-color 0.3s ease",
  },
  authButtons: {
    display: "flex",
    gap: "15px",
  },
  loginBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#10b981",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  signUpBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
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
    borderRadius: "4px",
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    width: "24px",
    height: "18px",
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "#333",
    transition: "all 0.3s ease",
    transformOrigin: "center",
  },
  mobileMenu: {
    display: "none",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    animation: "slideDown 0.3s ease",
  },
  mobileMenuContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  mobileNavLink: {
    textDecoration: "none",
    fontWeight: "500",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    transition: "color 0.3s ease",
    cursor: "pointer",
  },
  mobileUserSection: {
    marginTop: "10px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  mobileUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  mobileAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },
  mobileAuthButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileLoginBtn: {
    padding: "12px",
    background: "transparent",
    border: "2px solid #10b981",
    borderRadius: "8px",
    color: "#10b981",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  mobileSignUpBtn: {
    padding: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  mobileDashboardBtn: {
    padding: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  mobileSignOutBtn: {
    padding: "12px",
    background: "transparent",
    border: "2px solid #dc3545",
    borderRadius: "8px",
    color: "#dc3545",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
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
    color: "#334155",
    fontWeight: "500",
    fontSize: "14px",
  },
  mobileUserName: {
    color: "#334155",
    fontWeight: "500",
    fontSize: "14px",
  },
  profileContainer: {
    ...baseStyles.profileContainer,
    "&:hover": {
      backgroundColor: "rgba(16, 185, 129, 0.05)",
    }
  },
  dropdown: {
    ...baseStyles.dropdown,
    background: "white",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  dropdownItem: {
    ...baseStyles.dropdownItem,
    color: "#334155",
    "&:hover": {
      backgroundColor: "rgba(16, 185, 129, 0.05)",
    }
  },
  hamburgerLine: {
    ...baseStyles.hamburgerLine,
    backgroundColor: "#10b981",
  },
  mobileMenu: {
    ...baseStyles.mobileMenu,
    background: "rgba(255,255,255,0.98)",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  mobileNavLink: {
    ...baseStyles.mobileNavLink,
    color: "#334155",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
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
    color: "#f1f5f9",
    fontWeight: "500",
    fontSize: "14px",
  },
  mobileUserName: {
    color: "#f1f5f9",
    fontWeight: "500",
    fontSize: "14px",
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
  hamburgerLine: {
    ...baseStyles.hamburgerLine,
    backgroundColor: "#10b981",
  },
  mobileMenu: {
    ...baseStyles.mobileMenu,
    background: "rgba(26,26,26,0.98)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileNavLink: {
    ...baseStyles.mobileNavLink,
    color: "#f1f5f9",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
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

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
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
    }
    
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
  `;
  document.head.appendChild(style);
}