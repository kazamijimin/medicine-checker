"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from 'next/image';

// Password validation function
const validatePassword = (password) => {
  let score = 0;
  let feedback = "";
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  switch (score) {
    case 0:
    case 1:
      feedback = "Very Weak";
      return { score, feedback, color: "#dc3545" };
    case 2:
      feedback = "Weak";
      return { score, feedback, color: "#fd7e14" };
    case 3:
      feedback = "Fair";
      return { score, feedback, color: "#ffc107" };
    case 4:
      feedback = "Good";
      return { score, feedback, color: "#20c997" };
    case 5:
      feedback = "Strong";
      return { score, feedback, color: "#28a745" };
    default:
      return { score: 0, feedback: "Very Weak", color: "#dc3545" };
  }
};

export default function SignupPage() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
    profilePicture: null
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClient, setIsClient] = useState(false); // 👈 ADD THIS
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "#dc3545"
  });
  
  const router = useRouter();

  // 👇 FIX: Initialize client state first
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 👇 FIX: Only run window code when client-side
  useEffect(() => {
    if (!isClient) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isClient]); // 👈 Add isClient dependency

  // Define steps
  const steps = [
    { id: 'profile', title: 'Profile Picture', subtitle: 'Upload your photo (optional)' },
    { id: 'firstName', title: 'First Name', subtitle: 'What\'s your first name?' },
    { id: 'middleName', title: 'Middle Name', subtitle: 'What\'s your middle name? (optional)' },
    { id: 'lastName', title: 'Last Name', subtitle: 'What\'s your last name?' },
    { id: 'email', title: 'Email Address', subtitle: 'Enter your email address' },
    { id: 'gender', title: 'Gender', subtitle: 'Select your gender' },
    { id: 'password', title: 'Password', subtitle: 'Create a secure password' },
    { id: 'terms', title: 'Terms & Conditions', subtitle: 'Please review and accept' }
  ];

  // Input handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time password validation
    if (field === "password") {
      setPasswordStrength(validatePassword(value));
    }
    
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Profile picture must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please select a valid image file");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      setErrorMessage("");
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Validation for current step
  const validateCurrentStep = () => {
    const step = steps[currentStep];
    setErrorMessage("");

    switch (step.id) {
      case 'profile':
        return true; // Optional step

      case 'firstName':
        if (!formData.firstName.trim()) {
          setErrorMessage("First name is required");
          return false;
        }
        if (formData.firstName.trim().length < 2) {
          setErrorMessage("First name must be at least 2 characters");
          return false;
        }
        return true;

      case 'middleName':
        return true; // Optional step

      case 'lastName':
        if (!formData.lastName.trim()) {
          setErrorMessage("Last name is required");
          return false;
        }
        if (formData.lastName.trim().length < 2) {
          setErrorMessage("Last name must be at least 2 characters");
          return false;
        }
        return true;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
          setErrorMessage("Email is required");
          return false;
        }
        if (!emailRegex.test(formData.email)) {
          setErrorMessage("Please enter a valid email address");
          return false;
        }
        return true;

      case 'gender':
        if (!formData.gender) {
          setErrorMessage("Please select your gender");
          return false;
        }
        return true;

      case 'password':
        if (!formData.password) {
          setErrorMessage("Password is required");
          return false;
        }
        if (formData.password.length < 8) {
          setErrorMessage("Password must be at least 8 characters long");
          return false;
        }
        if (!formData.confirmPassword) {
          setErrorMessage("Please confirm your password");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match");
          return false;
        }
        return true;

      case 'terms':
        if (!termsAccepted) {
          setErrorMessage("You must accept the terms and conditions");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Upload profile picture to Supabase Storage
  const uploadProfilePicture = async (file, userId) => {
    try {
      console.log("Starting upload...", { fileName: file.name, fileSize: file.size, userId });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      console.log("Uploading to bucket 'profile-pictures' with filename:", fileName);
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        });

      console.log("Upload response:", { data, error });

      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log("Generated public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const performSignup = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Create user account with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Upload profile picture to Supabase if provided
      let profilePictureUrl = null;
      if (formData.profilePicture) {
        try {
          profilePictureUrl = await uploadProfilePicture(formData.profilePicture, user.uid);
          console.log("Profile picture uploaded to Supabase:", profilePictureUrl);
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
        }
      }

      // Store user data in Firebase Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        gender: formData.gender,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        hasProfilePicture: !!formData.profilePicture,
        profilePictureUrl: profilePictureUrl
      });

      console.log("User created and stored in Firebase database");
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage("An account with this email already exists. Please use a different email or sign in.");
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage("Password is too weak. Please choose a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage(error.message || "An error occurred during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === steps.length - 1) {
        performSignup();
      } else {
        nextStep();
      }
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const step = steps[currentStep];
    const currentStyles = isDarkMode ? darkStyles : lightStyles;

    switch (step.id) {
      case 'profile':
        return (
          <div style={currentStyles.stepContent}>
            <div style={currentStyles.profilePictureContainer}>
              <div style={currentStyles.profilePicture}>
                {formData.profilePicture ? (
                  <Image 
                    src={URL.createObjectURL(formData.profilePicture)} 
                    alt="Profile" 
                    width={80}
                    height={80}
                    style={currentStyles.profileImage}
                  />
                ) : (
                  <span style={currentStyles.profilePlaceholder}>📷</span>
                )}
              </div>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={currentStyles.hiddenInput}
              />
              <label htmlFor="profilePic" style={currentStyles.profileLabel}>
                {formData.profilePicture ? "Change Picture" : "Choose Profile Picture"}
              </label>
              {formData.profilePicture && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, profilePicture: null }))}
                  style={currentStyles.removeButton}
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>
        );

      case 'firstName':
        return (
          <div style={currentStyles.stepContent}>
            <input
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              onKeyPress={handleKeyPress}
              style={currentStyles.input}
              autoFocus
              maxLength={50}
            />
          </div>
        );

      case 'middleName':
        return (
          <div style={currentStyles.stepContent}>
            <input
              type="text"
              placeholder="Enter your middle name (optional)"
              value={formData.middleName}
              onChange={(e) => handleInputChange("middleName", e.target.value)}
              onKeyPress={handleKeyPress}
              style={currentStyles.input}
              autoFocus
              maxLength={50}
            />
          </div>
        );

      case 'lastName':
        return (
          <div style={currentStyles.stepContent}>
            <input
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              onKeyPress={handleKeyPress}
              style={currentStyles.input}
              autoFocus
              maxLength={50}
            />
          </div>
        );

      case 'email':
        return (
          <div style={currentStyles.stepContent}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
              onKeyPress={handleKeyPress}
              style={currentStyles.input}
              autoFocus
              autoComplete="email"
            />
          </div>
        );

      case 'gender':
        return (
          <div style={currentStyles.stepContent}>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              onKeyPress={handleKeyPress}
              style={currentStyles.input}
              autoFocus
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        );

      case 'password':
        return (
          <div style={currentStyles.stepContent}>
            <div style={currentStyles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                style={currentStyles.input}
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={currentStyles.passwordToggle}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              {formData.password && (
                <div style={currentStyles.passwordStrength}>
                  <div style={currentStyles.strengthBarContainer}>
                    <div style={{
                      ...currentStyles.strengthBar,
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}></div>
                  </div>
                  <span style={{...currentStyles.strengthText, color: passwordStrength.color}}>
                    {passwordStrength.feedback}
                  </span>
                </div>
              )}
            </div>
            <div style={currentStyles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onKeyPress={handleKeyPress}
                style={currentStyles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={currentStyles.passwordToggle}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div style={currentStyles.stepContent}>
            <div style={currentStyles.checkboxContainer}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={currentStyles.checkbox}
              />
              <label htmlFor="terms" style={currentStyles.checkboxLabel}>
                I agree to the <a href="/terms" style={currentStyles.link} target="_blank">Terms & Conditions</a> and <a href="/privacy" style={currentStyles.link} target="_blank">Privacy Policy</a>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 👇 FIX: Create styles function that's safe for SSR
  const createBaseStyles = () => ({
    container: {
      minHeight: "100vh",
      display: "flex",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: "relative",
      flexDirection: "column", // Safe default
    },
    themeToggle: {
      position: "fixed",
      top: "15px",
      right: "15px",
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      fontSize: "18px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    leftSection: {
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
        url('https://t4.ftcdn.net/jpg/02/10/45/39/360_F_210453925_spHdLHUcDJS76oWKzFp4mQeCKW8WisER.jpg')
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
      fontSize: "clamp(24px, 4vw, 32px)",
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
      fontSize: "20px",
      width: "35px",
      height: "35px",
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
    rightSection: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      overflow: "auto",
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box"
    },
    formContainer: {
      width: "100%",
      maxWidth: "420px",
      padding: "20px",
      boxSizing: "border-box",
      margin: "0 auto"
    },
    progressContainer: {
      marginBottom: "30px"
    },
    progressBar: {
      width: "100%",
      height: "4px",
      backgroundColor: "#e9ecef",
      borderRadius: "2px",
      overflow: "hidden",
      marginBottom: "8px"
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
      transition: "width 0.3s ease",
      borderRadius: "2px"
    },
    progressText: {
      fontSize: "12px",
      color: "#6c757d",
      textAlign: "center",
      margin: 0,
      fontWeight: "500"
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      paddingTop: "20px"
    },
    stepContent: {
      marginBottom: "30px"
    },
    profilePictureContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px"
    },
    profilePicture: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      border: "3px solid #28a745",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa",
      overflow: "hidden"
    },
    profileImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%"
    },
    profilePlaceholder: {
      fontSize: "36px",
      color: "#6c757d"
    },
    hiddenInput: {
      display: "none"
    },
    profileLabel: {
      color: "#28a745",
      cursor: "pointer",
      fontSize: "14px",
      textDecoration: "none",
      fontWeight: "500",
      padding: "12px 24px",
      border: "2px solid #28a745",
      borderRadius: "8px",
      backgroundColor: "transparent",
      transition: "all 0.3s ease",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      touchAction: "manipulation"
    },
    removeButton: {
      color: "#dc3545",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      padding: "8px 16px",
      border: "1px solid #dc3545",
      borderRadius: "6px",
      backgroundColor: "transparent",
      transition: "all 0.3s ease"
    },
    input: {
      width: "100%",
      padding: "14px 18px",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#e9ecef",
      borderRadius: "10px",
      fontSize: "16px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      transition: "border-color 0.3s ease",
      outline: "none",
      boxSizing: "border-box",
      marginBottom: "16px",
      WebkitAppearance: "none",
      touchAction: "manipulation",
      minHeight: "50px"
    },
    passwordContainer: {
      position: "relative",
      marginBottom: "16px"
    },
    passwordToggle: {
      position: "absolute",
      right: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      padding: "8px",
      minWidth: "40px",
      minHeight: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "5px",
      touchAction: "manipulation"
    },
    passwordStrength: {
      marginTop: "-12px",
      marginBottom: "16px"
    },
    strengthBarContainer: {
      width: "100%",
      height: "4px",
      backgroundColor: "#e9ecef",
      borderRadius: "2px",
      overflow: "hidden",
      marginBottom: "6px"
    },
    strengthBar: {
      height: "100%",
      borderRadius: "2px",
      transition: "all 0.3s ease"
    },
    strengthText: {
      fontSize: "12px",
      fontWeight: "500"
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "20px",
      border: "2px solid #e9ecef",
      borderRadius: "12px",
      backgroundColor: "#f8f9fa"
    },
    checkbox: {
      marginTop: "3px",
      flexShrink: 0,
      width: "18px",
      height: "18px",
      minWidth: "18px",
      minHeight: "18px"
    },
    checkboxLabel: {
      fontSize: "14px",
      lineHeight: "1.5",
      fontWeight: "400"
    },
    link: {
      color: "#28a745",
      textDecoration: "none",
      fontWeight: "500",
      padding: "2px",
      borderRadius: "3px"
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexDirection: "row"
    },
    backButton: {
      flex: 1,
      background: "transparent",
      color: "#6c757d",
      border: "2px solid #e9ecef",
      padding: "16px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: "50px",
      touchAction: "manipulation",
      WebkitAppearance: "none"
    },
    nextButton: {
      flex: 2,
      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
      color: "white",
      border: "none",
      padding: "16px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: "50px",
      touchAction: "manipulation",
      WebkitAppearance: "none"
    },
    submitButton: {
      flex: 2,
      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
      color: "white",
      border: "none",
      padding: "16px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "transform 0.2s ease",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: "50px",
      touchAction: "manipulation",
      WebkitAppearance: "none"
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
      lineHeight: "1.4",
      wordBreak: "break-word"
    },
    errorIcon: {
      fontSize: "16px",
      marginTop: "1px",
      flexShrink: 0
    },
    loginLink: {
      textAlign: "center",
      fontSize: "14px",
      margin: "0",
      fontWeight: "400",
      lineHeight: "1.5"
    }
  });

  // 👇 FIX: Update styles to be responsive when client-side
  const getResponsiveStyles = () => {
    const baseStyles = createBaseStyles();
    
    if (!isClient) return baseStyles;
    
    // Apply responsive styles only when client-side
    return {
      ...baseStyles,
      container: {
        ...baseStyles.container,
        flexDirection: isMobile ? "column" : "row",
      }
    };
  };

  const baseStyles = getResponsiveStyles();
  const currentStyles = isDarkMode ? { ...baseStyles, ...darkStyleOverrides } : { ...baseStyles, ...lightStyleOverrides };
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // 👇 FIX: Don't render anything until client-side
  if (!isClient) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif"
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={currentStyles.container}>
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={currentStyles.themeToggle}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Left Side - Image Section (Hidden on mobile) */}
        {!isMobile && (
          <div style={currentStyles.leftSection}>
            <div style={currentStyles.imageContainer}>
              <div style={currentStyles.overlayContent}>
                <h2 style={currentStyles.overlayTitle}>Welcome to MediChecker</h2>
                <p style={currentStyles.overlayText}>
                  Your trusted healthcare companion for medicine verification and health management.
                </p>
                <div style={currentStyles.features}>
                  <div style={currentStyles.feature}>
                    <span style={currentStyles.featureIcon}>💊</span>
                    <span style={currentStyles.featureText}>Verify Medicines</span>
                  </div>
                  <div style={currentStyles.feature}>
                    <span style={currentStyles.featureIcon}>🏥</span>
                    <span style={currentStyles.featureText}>Health Tracking</span>
                  </div>
                  <div style={currentStyles.feature}>
                    <span style={currentStyles.featureIcon}>🔒</span>
                    <span style={currentStyles.featureText}>Secure & Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Form Section */}
        <div style={currentStyles.rightSection}>
          <div style={currentStyles.formContainer}>
            {/* Progress Indicator */}
            <div style={currentStyles.progressContainer}>
              <div style={currentStyles.progressBar}>
                <div style={{
                  ...currentStyles.progressFill,
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}></div>
              </div>
              <p style={currentStyles.progressText}>
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            {/* Step Header */}
            <div style={currentStyles.header}>
              <h1 style={currentStyles.title}>{currentStepData.title}</h1>
              <p style={currentStyles.subtitle}>{currentStepData.subtitle}</p>
            </div>
            
            {/* Step Content */}
            {renderStepContent()}

            {/* Error Message */}
            {errorMessage && (
              <div style={currentStyles.errorContainer}>
                <p style={currentStyles.error}>
                  <span style={currentStyles.errorIcon}>⚠️</span>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={currentStyles.buttonContainer}>
              {currentStep > 0 && (
                <button 
                  onClick={prevStep}
                  style={currentStyles.backButton}
                  disabled={isLoading}
                >
                  Back
                </button>
              )}
              
              {isLastStep ? (
                <button 
                  onClick={performSignup}
                  disabled={isLoading || !termsAccepted}
                  style={{
                    ...currentStyles.submitButton,
                    opacity: (isLoading || !termsAccepted) ? 0.6 : 1,
                    cursor: (isLoading || !termsAccepted) ? "not-allowed" : "pointer"
                  }}
                >
                  {isLoading ? (
                    <span style={currentStyles.loadingContent}>
                      <span style={currentStyles.spinner}></span>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  style={currentStyles.nextButton}
                  disabled={isLoading}
                >
                  Next
                </button>
              )}
            </div>

            <p style={currentStyles.loginLink}>
              Already have an account? <a href="/login" style={currentStyles.link}>Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// 👇 FIX: Move style overrides outside component
const lightStyleOverrides = {
  rightSection: {
    backgroundColor: "white",
  },
  title: {
    color: "#2c5530",
    fontSize: "clamp(24px, 6vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "clamp(14px, 3vw, 16px)",
    margin: 0,
    fontWeight: "400"
  },
  input: {
    backgroundColor: "white",
    color: "#333"
  },
  checkboxContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef"
  },
  checkboxLabel: {
    color: "#6c757d"
  },
  backButton: {
    backgroundColor: "white",
    color: "#6c757d",
    borderColor: "#e9ecef"
  },
  passwordToggle: {
    color: "#6c757d"
  },
  loginLink: {
    color: "#6c757d"
  }
};

const darkStyleOverrides = {
  rightSection: {
    backgroundColor: "#1a1a1a",
  },
  title: {
    color: "#ffffff",
    fontSize: "clamp(24px, 6vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: "clamp(14px, 3vw, 16px)",
    margin: 0,
    fontWeight: "400"
  },
  progressText: {
    color: "#b0b0b0"
  },
  input: {
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    borderColor: "#404040"
  },
  checkboxContainer: {
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  checkboxLabel: {
    color: "#b0b0b0"
  },
  backButton: {
    backgroundColor: "#2d2d2d",
    color: "#b0b0b0",
    borderColor: "#404040"
  },
  error: {
    color: "#ff6b6b",
    backgroundColor: "#2d1a1a",
    borderColor: "#5a2a2a"
  },
  passwordToggle: {
    color: "#b0b0b0"
  },
  loginLink: {
    color: "#b0b0b0"
  }
};

// 👇 FIX: Only add styles when in browser
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Mobile-specific improvements */
    @media (max-width: 768px) {
      body {
        overflow-x: hidden;
      }
      
      /* Prevent zoom on input focus for iOS */
      input[type="email"],
      input[type="password"],
      input[type="text"],
      select {
        font-size: 16px !important;
      }
      
      /* Stack buttons vertically on very small screens */
      @media (max-width: 480px) {
        .button-container {
          flex-direction: column !important;
        }
      }
    }
    
    /* Focus states for accessibility */
    input:focus,
    button:focus,
    select:focus {
      outline: 2px solid #28a745;
      outline-offset: 2px;
    }
    
    /* Hover states (only on devices that support hover) */
    @media (hover: hover) {
      button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    }
    
    /* Touch feedback */
    button:active {
      transform: scale(0.98);
    }
  `;
  document.head.appendChild(style);
}