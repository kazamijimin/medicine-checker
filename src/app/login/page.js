"use client";

import { useState } from "react";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  // Function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    console.log("Error code received:", errorCode); // Debug log
    switch (errorCode) {
      case 'auth/user-not-found':
        return "No account found with this email address. Please check your email or sign up.";
      case 'auth/wrong-password':
        return "Incorrect password. Please try again or reset your password.";
      case 'auth/invalid-email':
        return "Please enter a valid email address.";
      case 'auth/user-disabled':
        return "This account has been disabled. Please contact support.";
      case 'auth/too-many-requests':
        return "Too many failed login attempts. Please try again later.";
      case 'auth/network-request-failed':
        return "Network error. Please check your internet connection and try again.";
      case 'auth/invalid-credential':
        return "Invalid email or password. Please check your credentials and try again.";
      case 'auth/missing-password':
        return "Please enter your password.";
      case 'auth/configuration-not-found':
        return "Firebase configuration error. Please contact support.";
      case 'auth/api-key-not-valid':
        return "Firebase API key is invalid. Please contact support.";
      case 'auth/app-not-authorized':
        return "This app is not authorized to use Firebase Authentication.";
      default:
        return `Login failed: ${errorCode || 'Unknown error'}. Please try again.`;
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return false;
    }
    
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Debug logs
    console.log("Login attempt started");
    console.log("Auth object:", auth);
    console.log("Email:", email);
    console.log("Password length:", password.length);
    
    // Validate form first
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    setIsLoading(true);

    try {
      // Check if auth is properly initialized
      if (!auth) {
        throw new Error("Firebase auth not initialized");
      }

      console.log("Attempting Firebase sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error details:", {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      // Set user-friendly error message
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <>
      {/* Import Poppins Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      
      <div style={currentStyles.container}>
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={currentStyles.themeToggle}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Left Side - Form Section */}
        <div style={currentStyles.leftSection}>
          <div style={currentStyles.formContainer}>
            {/* Header */}
            <div style={currentStyles.header}>
              <h1 style={currentStyles.title}>Welcome Back</h1>
              <p style={currentStyles.subtitle}>Sign in to your account</p>
            </div>
            
            {/* Login Form */}
            <form onSubmit={handleLogin} style={currentStyles.form}>
              <div style={currentStyles.inputContainer}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  style={{
                    ...currentStyles.input,
                    borderColor: error && !email ? "#dc3545" : currentStyles.input.borderColor
                  }}
                  required
                  autoFocus
                />
              </div>

              <div style={currentStyles.inputContainer}>
                <div style={currentStyles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    style={{
                      ...currentStyles.input,
                      borderColor: error && !password ? "#dc3545" : currentStyles.input.borderColor
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={currentStyles.passwordToggle}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={currentStyles.forgotPasswordContainer}>
                <a href="/forgot-password" style={currentStyles.link}>
                  Forgot your password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div style={currentStyles.errorContainer}>
                  <p style={currentStyles.error}>
                    <span style={currentStyles.errorIcon}>⚠️</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <button 
                type="submit"
                disabled={isLoading}
                style={{
                  ...currentStyles.submitButton,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer"
                }}
              >
                {isLoading ? (
                  <span style={currentStyles.loadingContent}>
                    <span style={currentStyles.spinner}></span>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Signup Link */}
            <p style={currentStyles.signupLink}>
              Don't have an account? <a href="/signup" style={currentStyles.link}>Sign up here</a>
            </p>

            {/* Divider */}
            <div style={currentStyles.divider}>
              <span style={currentStyles.dividerText}>or continue with</span>
            </div>

            {/* Social Login Buttons */}
            <div style={currentStyles.socialButtons}>
              <button 
                type="button"
                style={currentStyles.socialButton}
                onClick={() => setError("Google login is not available yet.")}
              >
                <span style={currentStyles.socialIcon}>🔵</span>
                Google
              </button>
              <button 
                type="button"
                style={currentStyles.socialButton}
                onClick={() => setError("Facebook login is not available yet.")}
              >
                <span style={currentStyles.socialIcon}>📘</span>
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Image Section */}
        <div style={currentStyles.rightSection}>
          <div style={currentStyles.imageContainer}>
            <div style={currentStyles.overlayContent}>
              <h2 style={currentStyles.overlayTitle}>Welcome Back to MediChecker</h2>
              <p style={currentStyles.overlayText}>
                Continue your healthcare journey with our trusted medicine verification and health management platform.
              </p>
              <div style={currentStyles.features}>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>💊</span>
                  <span style={currentStyles.featureText}>Verify Medicines</span>
                </div>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>📊</span>
                  <span style={currentStyles.featureText}>Track Health Data</span>
                </div>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>🔒</span>
                  <span style={currentStyles.featureText}>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Base styles with responsive design
const baseStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
  },
  themeToggle: {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 1000,
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)"
  },
  leftSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflow: "auto",
    minHeight: "100vh"
  },
  rightSection: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px"
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(rgba(102, 126, 234, 0.7), rgba(118, 75, 162, 0.7)),
      url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  overlayContent: {
    textAlign: "center",
    color: "white",
    padding: "40px",
    maxWidth: "400px"
  },
  overlayTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "20px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
  },
  overlayText: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: "1.6",
    marginBottom: "40px",
    opacity: 0.95,
    fontWeight: "400"
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "clamp(13px, 2vw, 15px)"
  },
  featureIcon: {
    fontSize: "22px",
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)"
  },
  featureText: {
    fontWeight: "500"
  },
  formContainer: {
    width: "100%",
    maxWidth: "450px",
    padding: "20px",
    boxSizing: "border-box"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  form: {
    marginBottom: "30px"
  },
  inputContainer: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#e9ecef",
    borderRadius: "12px",
    fontSize: "16px",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  passwordToggle: {
    position: "absolute",
    right: "15px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "5px"
  },
  forgotPasswordContainer: {
    textAlign: "right",
    marginBottom: "30px"
  },
  submitButton: {
    width: "100%",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    fontFamily: "'Poppins', sans-serif",
    marginBottom: "20px"
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  errorContainer: {
    marginBottom: "20px"
  },
  error: {
    fontSize: "14px",
    textAlign: "left",
    margin: "0",
    fontWeight: "500",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#ffe6e6",
    color: "#dc3545",
    border: "1px solid #f5c6cb",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    lineHeight: "1.4"
  },
  errorIcon: {
    fontSize: "16px",
    marginTop: "1px",
    flexShrink: 0
  },
  signupLink: {
    textAlign: "center",
    fontSize: "14px",
    margin: "0 0 30px 0",
    fontWeight: "400"
  },
  link: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "500"
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "30px 0",
    borderTop: "1px solid #e9ecef"
  },
  dividerText: {
    background: "white",
    padding: "0 20px",
    color: "#6c757d",
    fontSize: "14px",
    position: "relative",
    top: "-10px"
  },
  socialButtons: {
    display: "flex",
    gap: "15px"
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#e9ecef",
    borderRadius: "10px",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif"
  },
  socialIcon: {
    fontSize: "18px"
  }
};

// Light mode styles
const lightStyles = {
  ...baseStyles,
  leftSection: {
    ...baseStyles.leftSection,
    backgroundColor: "white",
  },
  title: {
    color: "#2c5530",
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: 0,
    fontWeight: "400"
  },
  input: {
    ...baseStyles.input,
    backgroundColor: "white",
    color: "#333",
    borderColor: "#e9ecef"
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#6c757d"
  },
  dividerText: {
    ...baseStyles.dividerText,
    background: "white"
  },
  socialButton: {
    ...baseStyles.socialButton,
    backgroundColor: "white",
    color: "#333",
    borderColor: "#e9ecef"
  }
};

// Dark mode styles
const darkStyles = {
  ...baseStyles,
  leftSection: {
    ...baseStyles.leftSection,
    backgroundColor: "#1a1a1a",
  },
  title: {
    color: "#ffffff",
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: 0,
    fontWeight: "400"
  },
  input: {
    ...baseStyles.input,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    borderColor: "#404040"
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#b0b0b0"
  },
  divider: {
    ...baseStyles.divider,
    borderTop: "1px solid #404040"
  },
  dividerText: {
    ...baseStyles.dividerText,
    background: "#1a1a1a",
    color: "#b0b0b0"
  },
  socialButton: {
    ...baseStyles.socialButton,
    backgroundColor: "#2d2d2d",
    color: "#b0b0b0",
    borderColor: "#404040"
  },
  error: {
    ...baseStyles.error,
    color: "#ff6b6b",
    backgroundColor: "#2d1a1a",
    borderColor: "#5a2a2a"
  }
};

// Add CSS for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
