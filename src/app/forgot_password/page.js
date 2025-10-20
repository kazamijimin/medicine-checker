"use client";

import { useState } from "react";
import { auth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const router = useRouter();

  // Function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    console.log("Error code received:", errorCode);
    switch (errorCode) {
      case 'auth/user-not-found':
        return "No account found with this email address. Please check your email or sign up.";
      case 'auth/invalid-email':
        return "Please enter a valid email address.";
      case 'auth/too-many-requests':
        return "Too many password reset requests. Please try again later.";
      case 'auth/network-request-failed':
        return "Network error. Please check your internet connection and try again.";
      case 'auth/configuration-not-found':
        return "Firebase configuration error. Please contact support.";
      case 'auth/api-key-not-valid':
        return "Firebase API key is invalid. Please contact support.";
      case 'auth/app-not-authorized':
        return "This app is not authorized to use Firebase Authentication.";
      default:
        return `Password reset failed: ${errorCode || 'Unknown error'}. Please try again.`;
    }
  };

  // Validate email before submission
  const validateEmail = () => {
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent successfully! Check your inbox and spam folder.");
      setEmailSent(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (success) setSuccess("");
  };

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
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
          {!emailSent ? (
            <>
              {/* Header */}
              <div style={currentStyles.header}>
                <h1 style={currentStyles.title}>Forgot Password?</h1>
                <p style={currentStyles.subtitle}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>
              
              {/* Reset Password Form */}
              <form onSubmit={handleResetPassword} style={currentStyles.form}>
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

                {/* Error Message */}
                {error && (
                  <div style={currentStyles.errorContainer}>
                    <p style={currentStyles.error}>
                      <span style={currentStyles.errorIcon}>⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div style={currentStyles.successContainer}>
                    <p style={currentStyles.success}>
                      <span style={currentStyles.successIcon}>✅</span>
                      {success}
                    </p>
                  </div>
                )}

                {/* Reset Button */}
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
                      Sending Email...
                    </span>
                  ) : (
                    "Send Reset Email"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div style={currentStyles.header}>
                <div style={currentStyles.successIconLarge}>📧</div>
                <h1 style={currentStyles.title}>Check Your Email</h1>
                <p style={currentStyles.subtitle}>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div style={currentStyles.instructionsContainer}>
                <h3 style={currentStyles.instructionsTitle}>What to do next:</h3>
                <ul style={currentStyles.instructionsList}>
                  <li style={currentStyles.instructionItem}>
                    <span style={currentStyles.instructionIcon}>1️⃣</span>
                    Check your email inbox for a message from us
                  </li>
                  <li style={currentStyles.instructionItem}>
                    <span style={currentStyles.instructionIcon}>2️⃣</span>
                    If you don&apos;t see it, check your spam/junk folder
                  </li>
                  <li style={currentStyles.instructionItem}>
                    <span style={currentStyles.instructionIcon}>3️⃣</span>
                    Click the reset link in the email to create a new password
                  </li>
                </ul>
              </div>

              {/* Resend Email Button */}
              <button 
                onClick={() => {
                  setEmailSent(false);
                  setSuccess("");
                  setError("");
                }}
                style={currentStyles.resendButton}
              >
                Send Another Email
              </button>
            </>
          )}

          {/* Back to Login Link */}
          <div style={currentStyles.backToLoginContainer}>
            <button 
              onClick={() => router.push('/login')}
              style={currentStyles.backButton}
            >
              ← Back to Sign In
            </button>
          </div>

          {/* Sign Up Link */}
          <p style={currentStyles.signupLink}>
            Don&apos;t have an account? <a href="/signup" style={currentStyles.link}>Sign up here</a>
          </p>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div style={currentStyles.rightSection}>
        <div style={currentStyles.imageContainer}>
          <div style={currentStyles.overlayContent}>
            <h2 style={currentStyles.overlayTitle}>Secure Password Reset</h2>
            <p style={currentStyles.overlayText}>
              We&apos;ll help you get back into your account securely. Your data and privacy are our top priority.
            </p>
            <div style={currentStyles.features}>
              <div style={currentStyles.feature}>
                <span style={currentStyles.featureIcon}>🔒</span>
                <span style={currentStyles.featureText}>Secure Reset Process</span>
              </div>
              <div style={currentStyles.feature}>
                <span style={currentStyles.featureIcon}>⚡</span>
                <span style={currentStyles.featureText}>Quick & Easy</span>
              </div>
              <div style={currentStyles.feature}>
                <span style={currentStyles.featureIcon}>🔐</span>
                <span style={currentStyles.featureText}>Email Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
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
  successIconLarge: {
    fontSize: "64px",
    marginBottom: "20px"
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
  resendButton: {
    width: "100%",
    background: "transparent",
    color: "#28a745",
    border: "2px solid #28a745",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
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
  successContainer: {
    marginBottom: "20px"
  },
  success: {
    fontSize: "14px",
    textAlign: "left",
    margin: "0",
    fontWeight: "500",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#e6f7e6",
    color: "#28a745",
    border: "1px solid #c6f5c6",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    lineHeight: "1.4"
  },
  successIcon: {
    fontSize: "16px",
    marginTop: "1px",
    flexShrink: 0
  },
  instructionsContainer: {
    marginBottom: "30px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9ecef"
  },
  instructionsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
    margin: "0 0 15px 0"
  },
  instructionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  instructionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
    fontSize: "14px",
    lineHeight: "1.5"
  },
  instructionIcon: {
    fontSize: "16px",
    flexShrink: 0,
    marginTop: "2px"
  },
  backToLoginContainer: {
    marginBottom: "20px"
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#28a745",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 0",
    fontFamily: "'Poppins', sans-serif",
    transition: "color 0.3s ease"
  },
  signupLink: {
    textAlign: "center",
    fontSize: "14px",
    margin: "0",
    fontWeight: "400"
  },
  link: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "500"
  },
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
  instructionsContainer: {
    ...baseStyles.instructionsContainer,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef"
  },
  instructionsTitle: {
    ...baseStyles.instructionsTitle,
    color: "#2c5530"
  },
  instructionItem: {
    ...baseStyles.instructionItem,
    color: "#495057"
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#6c757d"
  },
  backButton: {
    ...baseStyles.backButton,
    color: "#28a745"
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
  instructionsContainer: {
    ...baseStyles.instructionsContainer,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  instructionsTitle: {
    ...baseStyles.instructionsTitle,
    color: "#ffffff"
  },
  instructionItem: {
    ...baseStyles.instructionItem,
    color: "#b0b0b0"
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#b0b0b0"
  },
  backButton: {
    ...baseStyles.backButton,
    color: "#28a745"
  },
  error: {
    ...baseStyles.error,
    color: "#ff6b6b",
    backgroundColor: "#2d1a1a",
    borderColor: "#5a2a2a"
  },
  success: {
    ...baseStyles.success,
    color: "#4caf50",
    backgroundColor: "#1a2d1a",
    borderColor: "#2a5a2a"
  },
  resendButton: {
    ...baseStyles.resendButton,
    backgroundColor: "transparent",
    color: "#28a745",
    borderColor: "#28a745"
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
    
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      
      .rightSection {
        display: none;
      }
      
      .leftSection {
        flex: 1;
        min-height: 100vh;
      }
    }
  `;
  document.head.appendChild(style);
}