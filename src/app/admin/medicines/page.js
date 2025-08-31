"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminMedicinesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    genericName: "",
    description: "",
    dosage: "",
    sideEffects: "",
    category: "",
    manufacturer: "",
    activeIngredient: "",
    warnings: "",
    price: ""
  });
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminStatus(currentUser.uid);
        if (!adminStatus) {
          setUnauthorized(true);
        } else {
          await loadMedicines();
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, selectedCategory]);

  const checkAdminStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const adminStatus = userData.role === 'admin' || userData.isAdmin === true;
        setIsAdmin(adminStatus);
        return adminStatus;
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const loadMedicines = async () => {
    try {
      const medicinesSnapshot = await getDocs(collection(db, "medicines"));
      const medicinesData = medicinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedicines(medicinesData);
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
  };

  const resetForm = () => {
    setNewMedicine({
      name: "",
      genericName: "",
      description: "",
      dosage: "",
      sideEffects: "",
      category: "",
      manufacturer: "",
      activeIngredient: "",
      warnings: "",
      price: ""
    });
    setIsEditing(false);
    setEditingId(null);
    setShowAddForm(false);
  };

  const addMedicine = async () => {
    try {
      if (!newMedicine.name || !newMedicine.category) {
        setMessage('Please fill in at least the medicine name and category.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      await addDoc(collection(db, "medicines"), {
        ...newMedicine,
        createdAt: new Date(),
        createdBy: user.uid,
        updatedAt: new Date()
      });
      
      setMessage('Medicine added successfully!');
      setTimeout(() => setMessage(''), 3000);
      resetForm();
      await loadMedicines();
    } catch (error) {
      console.error("Error adding medicine:", error);
      setMessage('Error adding medicine. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const editMedicine = (medicine) => {
    setNewMedicine({
      name: medicine.name || "",
      genericName: medicine.genericName || "",
      description: medicine.description || "",
      dosage: medicine.dosage || "",
      sideEffects: medicine.sideEffects || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      activeIngredient: medicine.activeIngredient || "",
      warnings: medicine.warnings || "",
      price: medicine.price || ""
    });
    setIsEditing(true);
    setEditingId(medicine.id);
    setShowAddForm(true);
  };

  const updateMedicine = async () => {
    try {
      if (!newMedicine.name || !newMedicine.category) {
        setMessage('Please fill in at least the medicine name and category.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      await updateDoc(doc(db, "medicines", editingId), {
        ...newMedicine,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
      
      setMessage('Medicine updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      resetForm();
      await loadMedicines();
    } catch (error) {
      console.error("Error updating medicine:", error);
      setMessage('Error updating medicine. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteMedicine = async (medicineId, medicineName) => {
    if (confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "medicines", medicineId));
        setMessage('Medicine deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
        await loadMedicines();
      } catch (error) {
        console.error("Error deleting medicine:", error);
        setMessage('Error deleting medicine. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const categories = [
    "Pain Relief", "Antibiotics", "Cardiovascular", "Respiratory", 
    "Gastrointestinal", "Neurological", "Endocrine", "Dermatology", 
    "Mental Health", "Allergy", "Other"
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      "Pain Relief": "💊",
      "Antibiotics": "🧬",
      "Cardiovascular": "❤️",
      "Respiratory": "🫁",
      "Gastrointestinal": "🍃",
      "Neurological": "🧠",
      "Endocrine": "⚡",
      "Dermatology": "🧴",
      "Mental Health": "🧘",
      "Allergy": "🤧",
      "Other": "🔬"
    };
    return icons[category] || "💊";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Pain Relief": "#ef4444",
      "Antibiotics": "#10b981",
      "Cardiovascular": "#f59e0b",
      "Respiratory": "#3b82f6",
      "Gastrointestinal": "#84cc16",
      "Neurological": "#8b5cf6",
      "Endocrine": "#f97316",
      "Dermatology": "#06b6d4",
      "Mental Health": "#ec4899",
      "Allergy": "#eab308",
      "Other": "#6b7280"
    };
    return colors[category] || "#6b7280";
  };

  // Base styles (same as profile page structure)
  const baseStyles = {
    container: {
      minHeight: "100vh",
      paddingTop: "60px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      transition: "all 0.3s ease"
    },

    hero: {
      minHeight: "30vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },

    heroBackground: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      width: "100%",
      minHeight: "30vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    },

    heroContent: {
      textAlign: "center",
      color: "white",
      maxWidth: "800px",
      padding: "40px 20px"
    },

    heroTitle: {
      fontSize: "clamp(28px, 5vw, 42px)",
      fontWeight: "700",
      marginBottom: "12px",
      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px"
    },

    heroIcon: {
      fontSize: "48px"
    },

    heroSubtitle: {
      fontSize: "16px",
      opacity: 0.9,
      marginBottom: "24px"
    },

    mainContent: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "40px 20px"
    },

    section: {
      marginBottom: "40px",
      padding: "32px",
      borderRadius: "16px",
      border: "1px solid",
      fontFamily: "'Poppins', sans-serif"
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
      flexWrap: "wrap",
      gap: "16px"
    },

    sectionTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#10b981",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: 0
    },

    sectionIcon: {
      fontSize: "28px"
    },

    button: {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "'Poppins', sans-serif"
    },

    primaryButton: {
      backgroundColor: "#10b981",
      color: "white"
    },

    secondaryButton: {
      border: "2px solid",
      backgroundColor: "transparent"
    },

    controlsSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      alignItems: "center",
      marginBottom: "24px"
    },

    searchContainer: {
      position: "relative"
    },

    searchInput: {
      width: "100%",
      padding: "16px 48px 16px 20px",
      border: "2px solid",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "500",
      outline: "none",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
      fontFamily: "'Poppins', sans-serif"
    },

    searchIcon: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "20px"
    },

    filtersSection: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap"
    },

    categoryFilter: {
      padding: "12px 16px",
      border: "2px solid",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif"
    },

    viewToggle: {
      display: "flex",
      gap: "4px",
      border: "2px solid",
      borderRadius: "8px",
      padding: "4px"
    },

    viewButton: {
      padding: "8px 12px",
      border: "none",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "transparent",
      fontFamily: "'Poppins', sans-serif",
      fontWeight: "500"
    },

    activeViewButton: {
      background: "#10b981",
      color: "white"
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "32px"
    },

    statsCard: {
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid",
      textAlign: "center",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif"
    },

    statsIcon: {
      fontSize: "32px",
      marginBottom: "12px",
      display: "block"
    },

    statsNumber: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#10b981",
      margin: "0 0 4px 0",
      fontFamily: "'Poppins', sans-serif"
    },

    statsLabel: {
      fontSize: "14px",
      fontWeight: "500",
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      marginBottom: "32px"
    },

    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    },

    inputLabel: {
      fontSize: "14px",
      fontWeight: "600",
      fontFamily: "'Poppins', sans-serif"
    },

    input: {
      padding: "16px 20px",
      border: "2px solid",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      outline: "none",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif"
    },

    textarea: {
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "'Poppins', sans-serif"
    },

    medicinesList: {
      display: "grid",
      gridTemplateColumns: viewMode === 'grid' 
        ? "repeat(auto-fill, minmax(400px, 1fr))" 
        : "1fr",
      gap: "24px"
    },

    medicineCard: {
      borderRadius: "16px",
      padding: "28px",
      border: "1px solid",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Poppins', sans-serif"
    },

    cardGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
    },

    medicineHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "20px",
      gap: "16px"
    },

    medicineInfo: {
      flex: 1
    },

    medicineName: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#10b981",
      margin: "0 0 8px 0",
      lineHeight: "1.2",
      fontFamily: "'Poppins', sans-serif"
    },

    medicineGeneric: {
      fontSize: "14px",
      fontStyle: "italic",
      marginBottom: "12px",
      fontFamily: "'Poppins', sans-serif"
    },

    categoryPill: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      color: "white",
      fontFamily: "'Poppins', sans-serif"
    },

    actionButtons: {
      display: "flex",
      gap: "8px",
      flexDirection: "column"
    },

    iconButton: {
      width: "44px",
      height: "44px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden"
    },

    editButton: {
      backgroundColor: "#f59e0b",
      color: "white"
    },

    deleteButton: {
      backgroundColor: "#ef4444",
      color: "white"
    },

    medicineDetails: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginTop: "20px"
    },

    detailItem: {
      borderRadius: "8px",
      padding: "12px 16px",
      border: "1px solid"
    },

    detailLabel: {
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
      fontFamily: "'Poppins', sans-serif"
    },

    detailValue: {
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "1.4",
      fontFamily: "'Poppins', sans-serif"
    },

    message: {
      position: "fixed",
      top: "80px",
      right: "20px",
      padding: "16px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      zIndex: 1001,
      animation: "slideIn 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "'Poppins', sans-serif"
    },

    successMessage: {
      backgroundColor: "#10b981",
      color: "white"
    },

    errorMessage: {
      backgroundColor: "#ef4444",
      color: "white"
    },

    emptyState: {
      textAlign: "center",
      padding: "80px 20px",
      gridColumn: "1 / -1",
      fontFamily: "'Poppins', sans-serif"
    },

    emptyIcon: {
      fontSize: "80px",
      marginBottom: "24px",
      display: "block",
      opacity: 0.5
    },

    emptyTitle: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "12px",
      fontFamily: "'Poppins', sans-serif"
    },

    emptyText: {
      fontSize: "16px",
      lineHeight: "1.5",
      fontFamily: "'Poppins', sans-serif"
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    },

    loadingSpinner: {
      textAlign: "center"
    },

    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #10b981",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px"
    },

    loadingText: {
      fontSize: "16px",
      color: "#6c757d",
      fontFamily: "'Poppins', sans-serif"
    }
  };

  // Light theme styles (exact same as profile page)
  const lightStyles = {
    ...baseStyles,
    container: {
      ...baseStyles.container,
      backgroundColor: "#ffffff",
      color: "#333333"
    },
    section: {
      ...baseStyles.section,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    secondaryButton: {
      ...baseStyles.secondaryButton,
      borderColor: "#6c757d",
      color: "#6c757d"
    },
    searchInput: {
      ...baseStyles.searchInput,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      color: "#333333"
    },
    searchIcon: {
      ...baseStyles.searchIcon,
      color: "rgba(0, 0, 0, 0.5)"
    },
    categoryFilter: {
      ...baseStyles.categoryFilter,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      color: "#333333"
    },
    viewToggle: {
      ...baseStyles.viewToggle,
      borderColor: "#e9ecef",
      backgroundColor: "#ffffff"
    },
    viewButton: {
      ...baseStyles.viewButton,
      color: "#333333"
    },
    statsCard: {
      ...baseStyles.statsCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    statsLabel: {
      ...baseStyles.statsLabel,
      color: "#6c757d"
    },
    inputLabel: {
      ...baseStyles.inputLabel,
      color: "#374151"
    },
    input: {
      ...baseStyles.input,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      color: "#333333"
    },
    medicineCard: {
      ...baseStyles.medicineCard,
      backgroundColor: "#ffffff",
      borderColor: "#e9ecef",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    },
    medicineGeneric: {
      ...baseStyles.medicineGeneric,
      color: "#6c757d"
    },
    detailItem: {
      ...baseStyles.detailItem,
      backgroundColor: "#f8f9fa",
      borderColor: "#e9ecef"
    },
    detailLabel: {
      ...baseStyles.detailLabel,
      color: "#6c757d"
    },
    detailValue: {
      ...baseStyles.detailValue,
      color: "#333333"
    },
    emptyTitle: {
      ...baseStyles.emptyTitle,
      color: "#374151"
    },
    emptyText: {
      ...baseStyles.emptyText,
      color: "#6c757d"
    }
  };

  // Dark theme styles (exact same as profile page)
  const darkStyles = {
    ...baseStyles,
    container: {
      ...baseStyles.container,
      backgroundColor: "#1a1a1a",
      color: "#ffffff"
    },
    section: {
      ...baseStyles.section,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040",
      color: "#ffffff"
    },
    secondaryButton: {
      ...baseStyles.secondaryButton,
      borderColor: "#e9ecef",
      color: "#e9ecef"
    },
    searchInput: {
      ...baseStyles.searchInput,
      backgroundColor: "#404040",
      borderColor: "#555555",
      color: "#ffffff"
    },
    searchIcon: {
      ...baseStyles.searchIcon,
      color: "rgba(255, 255, 255, 0.5)"
    },
    categoryFilter: {
      ...baseStyles.categoryFilter,
      backgroundColor: "#404040",
      borderColor: "#555555",
      color: "#ffffff"
    },
    viewToggle: {
      ...baseStyles.viewToggle,
      borderColor: "#555555",
      backgroundColor: "#404040"
    },
    viewButton: {
      ...baseStyles.viewButton,
      color: "#ffffff"
    },
    statsCard: {
      ...baseStyles.statsCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    statsLabel: {
      ...baseStyles.statsLabel,
      color: "#b0b0b0"
    },
    inputLabel: {
      ...baseStyles.inputLabel,
      color: "#e9ecef"
    },
    input: {
      ...baseStyles.input,
      backgroundColor: "#404040",
      borderColor: "#555555",
      color: "#ffffff"
    },
    medicineCard: {
      ...baseStyles.medicineCard,
      backgroundColor: "#2d2d2d",
      borderColor: "#404040"
    },
    medicineGeneric: {
      ...baseStyles.medicineGeneric,
      color: "#b0b0b0"
    },
    detailItem: {
      ...baseStyles.detailItem,
      backgroundColor: "#404040",
      borderColor: "#555555"
    },
    detailLabel: {
      ...baseStyles.detailLabel,
      color: "#b0b0b0"
    },
    detailValue: {
      ...baseStyles.detailValue,
      color: "#ffffff"
    },
    emptyTitle: {
      ...baseStyles.emptyTitle,
      color: "#e9ecef"
    },
    emptyText: {
      ...baseStyles.emptyText,
      color: "#b0b0b0"
    }
  };

  // Current styles based on theme (same as profile page)
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .medicine-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
    
    .search-input:focus, .input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    * {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;

  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.loadingContainer}>
            <div style={currentStyles.loadingSpinner}>
              <div style={currentStyles.spinner}></div>
              <p style={currentStyles.loadingText}>Loading Medicines Database...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (unauthorized) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.emptyState}>
            <span style={currentStyles.emptyIcon}>🚫</span>
            <h2 style={currentStyles.emptyTitle}>Access Denied</h2>
            <p style={currentStyles.emptyText}>
              You don&apos;t have permission to manage medicines.<br/>
              Please contact an administrator for access.
            </p>
            <button 
              onClick={() => router.push('/admin')} 
              style={{...currentStyles.button, ...currentStyles.primaryButton, marginTop: "24px"}}
            >
              ← Back to Admin Panel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssAnimations}</style>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Hero Section */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <h1 style={currentStyles.heroTitle}>
                <span style={currentStyles.heroIcon}>💊</span>
                Medicine Database
              </h1>
              <p style={currentStyles.heroSubtitle}>
                Manage your pharmaceutical inventory with ease
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>

          {/* Message */}
          {message && (
            <div style={{
              ...currentStyles.message,
              ...(message.includes('Error') ? currentStyles.errorMessage : currentStyles.successMessage)
            }}>
              <span>{message.includes('Error') ? '⚠️' : '✅'}</span>
              {message}
            </div>
          )}

          {/* Header Controls */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>🏥</span>
                Medicine Management
              </h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{...currentStyles.button, ...currentStyles.primaryButton}}
                  className="button"
                >
                  {showAddForm ? '✕ Cancel' : '+ Add Medicine'}
                </button>
                <button 
                  onClick={() => router.push('/admin')} 
                  style={{...currentStyles.button, ...currentStyles.secondaryButton}}
                  className="button"
                >
                  ← Back to Admin
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={currentStyles.statsGrid}>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>📊</span>
                <h3 style={currentStyles.statsNumber}>{medicines.length}</h3>
                <p style={currentStyles.statsLabel}>Total Medicines</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>🔍</span>
                <h3 style={currentStyles.statsNumber}>{filteredMedicines.length}</h3>
                <p style={currentStyles.statsLabel}>Showing Results</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>🏷️</span>
                <h3 style={currentStyles.statsNumber}>{new Set(medicines.map(m => m.category)).size}</h3>
                <p style={currentStyles.statsLabel}>Categories</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>🏭</span>
                <h3 style={currentStyles.statsNumber}>{new Set(medicines.map(m => m.manufacturer)).size}</h3>
                <p style={currentStyles.statsLabel}>Manufacturers</p>
              </div>
            </div>

            {/* Controls */}
            <div style={currentStyles.controlsSection}>
              <div style={currentStyles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search medicines, generics, manufacturers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={currentStyles.searchInput}
                  className="search-input"
                />
                <span style={currentStyles.searchIcon}>🔍</span>
              </div>
              
              <div style={currentStyles.filtersSection}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={currentStyles.categoryFilter}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                  ))}
                </select>
                
                <div style={currentStyles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      ...currentStyles.viewButton,
                      ...(viewMode === 'grid' ? currentStyles.activeViewButton : {})
                    }}
                  >
                    ▦ Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      ...currentStyles.viewButton,
                      ...(viewMode === 'list' ? currentStyles.activeViewButton : {})
                    }}
                  >
                    ☰ List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div style={currentStyles.section}>
              <div style={currentStyles.sectionHeader}>
                <h3 style={currentStyles.sectionTitle}>
                  <span>{isEditing ? '✏️' : '➕'}</span>
                  {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                </h3>
                <button 
                  onClick={resetForm} 
                  style={{...currentStyles.button, ...currentStyles.secondaryButton}}
                >
                  ✕ Cancel
                </button>
              </div>
              
              <div style={currentStyles.formGrid}>
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Medicine Name *</label>
                  <input
                    style={currentStyles.input}
                    placeholder="Enter medicine name"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Generic Name</label>
                  <input
                    style={currentStyles.input}
                    placeholder="Enter generic name"
                    value={newMedicine.genericName}
                    onChange={(e) => setNewMedicine({...newMedicine, genericName: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Category *</label>
                  <select
                    style={currentStyles.input}
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                    ))}
                  </select>
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Manufacturer</label>
                  <input
                    style={currentStyles.input}
                    placeholder="Enter manufacturer"
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Dosage</label>
                  <input
                    style={currentStyles.input}
                    placeholder="e.g., 500mg, 1 tablet"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Active Ingredient</label>
                  <input
                    style={currentStyles.input}
                    placeholder="Enter active ingredient"
                    value={newMedicine.activeIngredient}
                    onChange={(e) => setNewMedicine({...newMedicine, activeIngredient: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Price</label>
                  <input
                    style={currentStyles.input}
                    placeholder="Enter price"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              
              <div style={currentStyles.formGrid}>
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Description</label>
                  <textarea
                    style={{...currentStyles.input, ...currentStyles.textarea}}
                    placeholder="Enter medicine description"
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Side Effects</label>
                  <textarea
                    style={{...currentStyles.input, ...currentStyles.textarea}}
                    placeholder="Enter side effects"
                    value={newMedicine.sideEffects}
                    onChange={(e) => setNewMedicine({...newMedicine, sideEffects: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div style={currentStyles.inputGroup}>
                  <label style={currentStyles.inputLabel}>Warnings & Precautions</label>
                  <textarea
                    style={{...currentStyles.input, ...currentStyles.textarea}}
                    placeholder="Enter warnings and precautions"
                    value={newMedicine.warnings}
                    onChange={(e) => setNewMedicine({...newMedicine, warnings: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              
              <button 
                onClick={isEditing ? updateMedicine : addMedicine} 
                style={{...currentStyles.button, ...currentStyles.primaryButton}}
                className="button"
              >
                <span>{isEditing ? '✏️' : '➕'}</span>
                {isEditing ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          )}

          {/* Medicines List */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h3 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>💊</span>
                Medicines Database
              </h3>
            </div>

            <div style={currentStyles.medicinesList}>
              {filteredMedicines.length === 0 ? (
                <div style={currentStyles.emptyState}>
                  <span style={currentStyles.emptyIcon}>🔍</span>
                  <h3 style={currentStyles.emptyTitle}>No medicines found</h3>
                  <p style={currentStyles.emptyText}>
                    {medicines.length === 0 
                      ? "Your medicine database is empty. Add your first medicine to get started!" 
                      : "No medicines match your search criteria. Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                filteredMedicines.map((medicine) => (
                  <div key={medicine.id} style={currentStyles.medicineCard} className="medicine-card">
                    <div style={currentStyles.cardGradient}></div>
                    
                    <div style={currentStyles.medicineHeader}>
                      <div style={currentStyles.medicineInfo}>
                        <h3 style={currentStyles.medicineName}>{medicine.name}</h3>
                        {medicine.genericName && (
                          <p style={currentStyles.medicineGeneric}>Generic: {medicine.genericName}</p>
                        )}
                        <div 
                          style={{
                            ...currentStyles.categoryPill,
                            backgroundColor: getCategoryColor(medicine.category)
                          }}
                        >
                          <span>{getCategoryIcon(medicine.category)}</span>
                          {medicine.category}
                        </div>
                      </div>
                      <div style={currentStyles.actionButtons}>
                        <button 
                          onClick={() => editMedicine(medicine)}
                          style={{...currentStyles.iconButton, ...currentStyles.editButton}}
                          className="button"
                          title="Edit Medicine"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteMedicine(medicine.id, medicine.name)}
                          style={{...currentStyles.iconButton, ...currentStyles.deleteButton}}
                          className="button"
                          title="Delete Medicine"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div style={currentStyles.medicineDetails}>
                      {medicine.manufacturer && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Manufacturer</div>
                          <div style={currentStyles.detailValue}>{medicine.manufacturer}</div>
                        </div>
                      )}
                      {medicine.dosage && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Dosage</div>
                          <div style={currentStyles.detailValue}>{medicine.dosage}</div>
                        </div>
                      )}
                      {medicine.activeIngredient && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Active Ingredient</div>
                          <div style={currentStyles.detailValue}>{medicine.activeIngredient}</div>
                        </div>
                      )}
                      {medicine.price && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Price</div>
                          <div style={currentStyles.detailValue}>{medicine.price}</div>
                        </div>
                      )}
                      {medicine.description && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Description</div>
                          <div style={currentStyles.detailValue}>
                            {medicine.description.length > 100 
                              ? `${medicine.description.substring(0, 100)}...` 
                              : medicine.description}
                          </div>
                        </div>
                      )}
                      {medicine.sideEffects && (
                        <div style={currentStyles.detailItem}>
                          <div style={currentStyles.detailLabel}>Side Effects</div>
                          <div style={currentStyles.detailValue}>
                            {medicine.sideEffects.length > 100 
                              ? `${medicine.sideEffects.substring(0, 100)}...` 
                              : medicine.sideEffects}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}