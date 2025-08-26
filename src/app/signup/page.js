"use client";

import { useState } from "react";
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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "#dc3545"
  });
  
  const router = useRouter();

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
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
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
        return true;

      case 'middleName':
        return true; // Optional step

      case 'lastName':
        if (!formData.lastName.trim()) {
          setErrorMessage("Last name is required");
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
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
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
                    width={56}
                    height={56}
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
                Choose Profile Picture
              </label>
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
              style={currentStyles.input}
              autoFocus
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
              style={currentStyles.input}
              autoFocus
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
              style={currentStyles.input}
              autoFocus
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
              onChange={(e) => handleInputChange("email", e.target.value)}
              style={currentStyles.input}
              autoFocus
            />
          </div>
        );

      case 'gender':
        return (
          <div style={currentStyles.stepContent}>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
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
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                style={currentStyles.input}
                autoFocus
              />
              {formData.password && (
                <div style={currentStyles.passwordStrength}>
                  <div style={{
                    ...currentStyles.strengthBar,
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}></div>
                  <span style={{...currentStyles.strengthText, color: passwordStrength.color}}>
                    {passwordStrength.feedback}
                  </span>
                </div>
              )}
            </div>
            <div style={currentStyles.passwordContainer}>
              <input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                style={currentStyles.input}
              />
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
                I agree to the <a href="/terms" style={currentStyles.link}>Terms & Conditions</a> and <a href="/privacy" style={currentStyles.link}>Privacy Policy</a>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStyles = isDarkMode ? darkStyles : lightStyles;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Import Poppins Font */}

      
      <div style={currentStyles.container}>
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={currentStyles.themeToggle}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Left Side - Image Section */}
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
              <p style={currentStyles.error}>{errorMessage}</p>
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
                  disabled={isLoading}
                  style={{
                    ...currentStyles.submitButton,
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
  rightSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflow: "auto",
    minHeight: "100vh"
  },
  formContainer: {
    width: "100%",
    maxWidth: "450px",
    padding: "20px",
    boxSizing: "border-box"
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
    marginBottom: "30px"
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
    objectFit: "cover"
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
    textDecoration: "underline",
    fontWeight: "500",
    padding: "8px 16px",
    border: "2px solid #28a745",
    borderRadius: "8px",
    backgroundColor: "transparent",
    transition: "all 0.3s ease"
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    border: "2px solid #e9ecef",
    borderRadius: "12px",
    fontSize: "16px",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px"
  },
  passwordContainer: {
    position: "relative",
    marginBottom: "16px"
  },
  passwordStrength: {
    marginTop: "8px",
    marginBottom: "16px"
  },
  strengthBar: {
    height: "4px",
    borderRadius: "2px",
    transition: "all 0.3s ease",
    marginBottom: "6px",
    backgroundColor: "#e9ecef"
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
    width: "16px",
    height: "16px"
  },
  checkboxLabel: {
    fontSize: "14px",
    lineHeight: "1.5",
    fontWeight: "400"
  },
  link: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "500"
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px"
  },
  backButton: {
    flex: 1,
    background: "transparent",
    color: "#6c757d",
    border: "2px solid #e9ecef",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif"
  },
  nextButton: {
    flex: 2,
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    fontFamily: "'Poppins', sans-serif"
  },
  submitButton: {
    flex: 2,
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    fontFamily: "'Poppins', sans-serif"
  },
  error: {
    fontSize: "14px",
    textAlign: "center",
    margin: "0 0 20px 0",
    fontWeight: "500",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#ffe6e6"
  },
  loginLink: {
    textAlign: "center",
    fontSize: "14px",
    margin: "0",
    fontWeight: "400"
  }
};

// Light mode styles
const lightStyles = {
  ...baseStyles,
  rightSection: {
    ...baseStyles.rightSection,
    backgroundColor: "white",
  },
  title: {
    color: "#2c5530",
    fontSize: "clamp(24px, 4vw, 32px)",
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
    color: "#333"
  },
  checkboxContainer: {
    ...baseStyles.checkboxContainer,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef"
  },
  checkboxLabel: {
    ...baseStyles.checkboxLabel,
    color: "#6c757d"
  },
  backButton: {
    ...baseStyles.backButton,
    backgroundColor: "white",
    color: "#6c757d",
    borderColor: "#e9ecef"
  },
  nextButton: {
    ...baseStyles.nextButton
  },
  submitButton: {
    ...baseStyles.submitButton
  },
  error: {
    ...baseStyles.error,
    color: "#dc3545",
    backgroundColor: "#ffe6e6"
  },
  loginLink: {
    ...baseStyles.loginLink,
    color: "#6c757d"
  }
};

// Dark mode styles
const darkStyles = {
  ...baseStyles,
  rightSection: {
    ...baseStyles.rightSection,
    backgroundColor: "#1a1a1a",
  },
  title: {
    color: "#ffffff",
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: 0,
    fontWeight: "400"
  },
  progressText: {
    ...baseStyles.progressText,
    color: "#b0b0b0"
  },
  input: {
    ...baseStyles.input,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    border: "2px solid #404040"
  },
  checkboxContainer: {
    ...baseStyles.checkboxContainer,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  checkboxLabel: {
    ...baseStyles.checkboxLabel,
    color: "#b0b0b0"
  },
  backButton: {
    ...baseStyles.backButton,
    backgroundColor: "#2d2d2d",
    color: "#b0b0b0",
    borderColor: "#404040"
  },
  nextButton: {
    ...baseStyles.nextButton
  },
  submitButton: {
    ...baseStyles.submitButton
  },
  error: {
    ...baseStyles.error,
    color: "#ff6b6b",
    backgroundColor: "#2d1a1a"
  },
  loginLink: {
    ...baseStyles.loginLink,
    color: "#b0b0b0"
  }
};