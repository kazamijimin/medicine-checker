"use client";

import { useState } from "react";
import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Function to upload profile picture to Supabase
  const uploadProfilePicture = async (photoURL, userId) => {
    try {
      if (!photoURL) return null;

      // Fetch the image from Google
      const response = await fetch(photoURL);
      const blob = await response.blob();

      // Create a unique filename
      const fileName = `profiles/${userId}/profile-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return null;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return null;
    }
  };

  // Function to save user data to Firestore
  const saveUserToFirestore = async (user, supabasePhotoURL = null) => {
    try {
      const userRef = doc(db, "users", user.uid);

      // Check if user already exists
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user - create document
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: supabasePhotoURL || user.photoURL || null,
          originalGooglePhotoURL: user.photoURL || null,
          phoneNumber: user.phoneNumber || null,
          emailVerified: user.emailVerified,
          provider: user.providerData[0]?.providerId || "email",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          role: "user",
          profile: {
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
            dateOfBirth: null,
            gender: null,
            location: null,
            bio: null,
          },
          preferences: {
            theme: "light",
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            privacy: {
              profileVisible: true,
              dataSharing: false,
            },
          },
          healthData: {
            allergies: [],
            medications: [],
            conditions: [],
            emergencyContact: null,
          },
        };

        await setDoc(userRef, userData);
        console.log("New user created in Firestore:", userData);
      } else {
        // Existing user - update last login and photo if needed
        const existingData = userSnap.data();
        const updateData = {
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          emailVerified: user.emailVerified,
        };

        // Update photo URL if new Supabase URL is provided
        if (supabasePhotoURL && supabasePhotoURL !== existingData.photoURL) {
          updateData.photoURL = supabasePhotoURL;
          updateData.originalGooglePhotoURL = user.photoURL;
        }

        await setDoc(userRef, updateData, { merge: true });
        console.log("Existing user updated in Firestore");
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  };

  // Function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    console.log("Error code received:", errorCode);
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or sign up.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again or reset your password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/configuration-not-found":
        return "Firebase configuration error. Please contact support.";
      case "auth/api-key-not-valid":
        return "Firebase API key is invalid. Please contact support.";
      case "auth/app-not-authorized":
        return "This app is not authorized to use Firebase Authentication.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked. Please allow popups and try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email. Please sign in with your original method.";
      default:
        return `Login failed: ${
          errorCode || "Unknown error"
        }. Please try again.`;
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }

    if (!email.includes("@")) {
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

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save/update user in Firestore
      await saveUserToFirestore(userCredential.user);

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In function with Firestore and Supabase integration
  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.addScope("email");
      provider.addScope("profile");

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google sign-in successful:", user);

      // Upload profile picture to Supabase if available
      let supabasePhotoURL = null;
      if (user.photoURL) {
        console.log("Uploading profile picture to Supabase...");
        supabasePhotoURL = await uploadProfilePicture(user.photoURL, user.uid);
        console.log("Supabase photo URL:", supabasePhotoURL);
      }

      // Save user data to Firestore
      await saveUserToFirestore(user, supabasePhotoURL);

      // Get access token if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log("User successfully authenticated and saved to database");

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsGoogleLoading(false);
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
    

      <div style={currentStyles.container}>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={currentStyles.themeToggle}
        >
          {isDarkMode ? "☀️" : "🌙"}
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
                    borderColor:
                      error && !email
                        ? "#dc3545"
                        : currentStyles.input.borderColor,
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
                      borderColor:
                        error && !password
                          ? "#dc3545"
                          : currentStyles.input.borderColor,
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={currentStyles.passwordToggle}
                  >
                    {showPassword ? "🙈" : "👁️"}
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
                disabled={isLoading || isGoogleLoading}
                style={{
                  ...currentStyles.submitButton,
                  opacity: isLoading || isGoogleLoading ? 0.6 : 1,
                  cursor:
                    isLoading || isGoogleLoading ? "not-allowed" : "pointer",
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
              Don't have an account?{" "}
              <a href="/signup" style={currentStyles.link}>
                Sign up here
              </a>
            </p>

            {/* Divider */}
            <div style={currentStyles.divider}>
              <span style={currentStyles.dividerText}>or continue with</span>
            </div>

            {/* Social Login Buttons */}
            <div style={currentStyles.socialButtons}>
              <button
                type="button"
                style={{
                  ...currentStyles.socialButton,
                  opacity: isLoading || isGoogleLoading ? 0.6 : 1,
                  cursor:
                    isLoading || isGoogleLoading ? "not-allowed" : "pointer",
                }}
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <span style={currentStyles.spinner}></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span style={currentStyles.socialIcon}>🔵</span>
                    Google
                  </>
                )}
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
              <h2 style={currentStyles.overlayTitle}>
                Welcome Back to MediChecker
              </h2>
              <p style={currentStyles.overlayText}>
                Continue your healthcare journey with our trusted medicine
                verification and health management platform.
              </p>
              <div style={currentStyles.features}>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>💊</span>
                  <span style={currentStyles.featureText}>
                    Verify Medicines
                  </span>
                </div>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>📊</span>
                  <span style={currentStyles.featureText}>
                    Track Health Data
                  </span>
                </div>
                <div style={currentStyles.feature}>
                  <span style={currentStyles.featureIcon}>🔒</span>
                  <span style={currentStyles.featureText}>
                    Secure & Private
                  </span>
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
    backdropFilter: "blur(10px)",
  },
  leftSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflow: "auto",
    minHeight: "100vh",
  },
  rightSection: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
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
    justifyContent: "center",
  },
  overlayContent: {
    textAlign: "center",
    color: "white",
    padding: "40px",
    maxWidth: "400px",
  },
  overlayTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "20px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  overlayText: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: "1.6",
    marginBottom: "40px",
    opacity: 0.95,
    fontWeight: "400",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "clamp(13px, 2vw, 15px)",
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
    backdropFilter: "blur(10px)",
  },
  featureText: {
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
    maxWidth: "450px",
    padding: "20px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  form: {
    marginBottom: "30px",
  },
  inputContainer: {
    marginBottom: "20px",
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
    alignItems: "center",
  },
  passwordToggle: {
    position: "absolute",
    right: "15px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "5px",
  },
  forgotPasswordContainer: {
    textAlign: "right",
    marginBottom: "30px",
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
    marginBottom: "20px",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    marginBottom: "20px",
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
    lineHeight: "1.4",
  },
  errorIcon: {
    fontSize: "16px",
    marginTop: "1px",
    flexShrink: 0,
  },
  signupLink: {
    textAlign: "center",
    fontSize: "14px",
    margin: "0 0 30px 0",
    fontWeight: "400",
  },
  link: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "500",
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "30px 0",
    borderTop: "1px solid #e9ecef",
  },
  dividerText: {
    background: "white",
    padding: "0 20px",
    color: "#6c757d",
    fontSize: "14px",
    position: "relative",
    top: "-10px",
  },
  socialButtons: {
    display: "flex",
    gap: "15px",
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
    fontFamily: "'Poppins', sans-serif",
  },
  socialIcon: {
    fontSize: "18px",
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
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: 0,
    fontWeight: "400",
  },
  input: {
    ...baseStyles.input,
    backgroundColor: "white",
    color: "#333",
    borderColor: "#e9ecef",
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#6c757d",
  },
  dividerText: {
    ...baseStyles.dividerText,
    background: "white",
  },
  socialButton: {
    ...baseStyles.socialButton,
    backgroundColor: "white",
    color: "#333",
    borderColor: "#e9ecef",
  },
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
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: 0,
    fontWeight: "400",
  },
  input: {
    ...baseStyles.input,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    borderColor: "#404040",
  },
  signupLink: {
    ...baseStyles.signupLink,
    color: "#b0b0b0",
  },
  divider: {
    ...baseStyles.divider,
    borderTop: "1px solid #404040",
  },
  dividerText: {
    ...baseStyles.dividerText,
    background: "#1a1a1a",
    color: "#b0b0b0",
  },
  socialButton: {
    ...baseStyles.socialButton,
    backgroundColor: "#2d2d2d",
    color: "#b0b0b0",
    borderColor: "#404040",
  },
  error: {
    ...baseStyles.error,
    color: "#ff6b6b",
    backgroundColor: "#2d1a1a",
    borderColor: "#5a2a2a",
  },
};

// Add CSS for spinner animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// In your login component or auth handler

const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create user document with Google profile data
      await setDoc(userDocRef, {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        hasProfilePicture: !!user.photoURL,
        profilePictureUrl: user.photoURL, // Google's photo URL
        provider: "google",
      });
    }

    router.push("/dashboard");
  } catch (error) {
    console.error("Google login error:", error);
  }
};
