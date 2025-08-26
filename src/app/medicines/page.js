"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pre-defined medicine categories with sample medicines
const medicineCategories = {
  "Pain Relief": [
    {
      id: "pain_1",
      name: "Tylenol",
      genericName: "Acetaminophen",
      manufacturer: "Johnson & Johnson",
      dosage: "500mg",
      description: "Pain reliever and fever reducer",
      icon: "🟡",
      category: "Pain Relief"
    },
    {
      id: "pain_2",
      name: "Advil",
      genericName: "Ibuprofen",
      manufacturer: "Pfizer",
      dosage: "200mg",
      description: "Anti-inflammatory pain reliever",
      icon: "🔴",
      category: "Pain Relief"
    },
    {
      id: "pain_3",
      name: "Aspirin",
      genericName: "Acetylsalicylic acid",
      manufacturer: "Bayer",
      dosage: "325mg",
      description: "Pain reliever and blood thinner",
      icon: "⚪",
      category: "Pain Relief"
    }
  ],
  "Cardiovascular": [
    {
      id: "cardio_1",
      name: "Lisinopril",
      genericName: "Lisinopril",
      manufacturer: "Merck",
      dosage: "10mg",
      description: "ACE inhibitor for high blood pressure",
      icon: "❤️",
      category: "Cardiovascular"
    },
    {
      id: "cardio_2",
      name: "Lipitor",
      genericName: "Atorvastatin",
      manufacturer: "Pfizer",
      dosage: "20mg",
      description: "Cholesterol-lowering medication",
      icon: "💊",
      category: "Cardiovascular"
    },
    {
      id: "cardio_3",
      name: "Metoprolol",
      genericName: "Metoprolol",
      manufacturer: "AstraZeneca",
      dosage: "50mg",
      description: "Beta-blocker for heart conditions",
      icon: "💓",
      category: "Cardiovascular"
    }
  ],
  "Diabetes": [
    {
      id: "diabetes_1",
      name: "Metformin",
      genericName: "Metformin HCl",
      manufacturer: "Bristol Myers Squibb",
      dosage: "500mg",
      description: "Type 2 diabetes medication",
      icon: "📊",
      category: "Diabetes"
    },
    {
      id: "diabetes_2",
      name: "Glipizide",
      genericName: "Glipizide",
      manufacturer: "Pfizer",
      dosage: "5mg",
      description: "Sulfonylurea diabetes medication",
      icon: "📊",
      category: "Diabetes"
    },
    {
      id: "diabetes_3",
      name: "Insulin",
      genericName: "Human Insulin",
      manufacturer: "Eli Lilly",
      dosage: "100 units/mL",
      description: "Hormone for diabetes management",
      icon: "💉",
      category: "Diabetes"
    }
  ],
  "Antibiotics": [
    {
      id: "antibiotic_1",
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      manufacturer: "GSK",
      dosage: "250mg",
      description: "Penicillin antibiotic",
      icon: "💊",
      category: "Antibiotics"
    },
    {
      id: "antibiotic_2",
      name: "Azithromycin",
      genericName: "Azithromycin",
      manufacturer: "Pfizer",
      dosage: "250mg",
      description: "Macrolide antibiotic",
      icon: "💊",
      category: "Antibiotics"
    },
    {
      id: "antibiotic_3",
      name: "Doxycycline",
      genericName: "Doxycycline",
      manufacturer: "Teva",
      dosage: "100mg",
      description: "Tetracycline antibiotic",
      icon: "💊",
      category: "Antibiotics"
    }
  ],
  "Digestive": [
    {
      id: "digestive_1",
      name: "Prilosec",
      genericName: "Omeprazole",
      manufacturer: "AstraZeneca",
      dosage: "20mg",
      description: "Proton pump inhibitor",
      icon: "🟢",
      category: "Digestive"
    },
    {
      id: "digestive_2",
      name: "Pepcid",
      genericName: "Famotidine",
      manufacturer: "Johnson & Johnson",
      dosage: "20mg",
      description: "H2 receptor antagonist",
      icon: "🟢",
      category: "Digestive"
    },
    {
      id: "digestive_3",
      name: "Zantac",
      genericName: "Ranitidine",
      manufacturer: "GSK",
      dosage: "150mg",
      description: "Acid reducer",
      icon: "🟢",
      category: "Digestive"
    }
  ],
  "Allergy": [
    {
      id: "allergy_1",
      name: "Zyrtec",
      genericName: "Cetirizine",
      manufacturer: "UCB",
      dosage: "10mg",
      description: "Antihistamine for allergies",
      icon: "🌸",
      category: "Allergy"
    },
    {
      id: "allergy_2",
      name: "Claritin",
      genericName: "Loratadine",
      manufacturer: "Bayer",
      dosage: "10mg",
      description: "Non-drowsy antihistamine",
      icon: "🌸",
      category: "Allergy"
    },
    {
      id: "allergy_3",
      name: "Allegra",
      genericName: "Fexofenadine",
      manufacturer: "Sanofi",
      dosage: "180mg",
      description: "24-hour allergy relief",
      icon: "🌸",
      category: "Allergy"
    }
  ],
  "Mental Health": [
    {
      id: "mental_1",
      name: "Zoloft",
      genericName: "Sertraline",
      manufacturer: "Pfizer",
      dosage: "50mg",
      description: "SSRI antidepressant",
      icon: "🧠",
      category: "Mental Health"
    },
    {
      id: "mental_2",
      name: "Prozac",
      genericName: "Fluoxetine",
      manufacturer: "Eli Lilly",
      dosage: "20mg",
      description: "SSRI antidepressant",
      icon: "🧠",
      category: "Mental Health"
    },
    {
      id: "mental_3",
      name: "Xanax",
      genericName: "Alprazolam",
      manufacturer: "Pfizer",
      dosage: "0.5mg",
      description: "Anti-anxiety medication",
      icon: "🧠",
      category: "Mental Health"
    }
  ]
};

export default function MedicinesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'search'
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to get medicine image placeholder
  const getMedicineImage = (medicineName, category) => {
    const colorMap = {
      'Pain Relief': 'ff6b6b',
      'Cardiovascular': 'e74c3c',
      'Diabetes': '3498db',
      'Antibiotics': '2ecc71',
      'Digestive': '95a5a6',
      'Allergy': 'f39c12',
      'Mental Health': '9b59b6'
    };

    const color = colorMap[category] || '28a745';
    const shortName = medicineName.length > 8 ? 
      medicineName.substring(0, 8) + '...' : 
      medicineName;

    return `https://via.placeholder.com/120x80/${color}/ffffff?text=${encodeURIComponent(shortName)}`;
  };

  // Enhanced search function (keep your existing search logic)
  const searchMedicines = useCallback(async (query) => {
    if (!query.trim()) {
      setMedicines([]);
      setViewMode('categories');
      return;
    }

    setViewMode('search');
    setApiLoading(true);
    setError(null);

    try {
      // First search in local categories
      let localResults = [];
      Object.values(medicineCategories).flat().forEach(medicine => {
        if (
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.genericName.toLowerCase().includes(query.toLowerCase()) ||
          medicine.category.toLowerCase().includes(query.toLowerCase())
        ) {
          localResults.push({
            ...medicine,
            source: 'local',
            imageUrl: getMedicineImage(medicine.name, medicine.category)
          });
        }
      });

      // Then search APIs (your existing API search logic here)
      let apiResults = [];
      
      try {
        const fdaResponse = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"&limit=10`
        );

        if (fdaResponse.ok) {
          const fdaData = await fdaResponse.json();
          if (fdaData.results) {
            apiResults = fdaData.results.map((drug, index) => ({
              id: `fda_${index}`,
              name: drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || 'Unknown',
              genericName: drug.openfda?.generic_name?.[0] || 'Unknown',
              manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Unknown',
              dosage: drug.dosage_and_administration?.[0]?.substring(0, 100) + '...' || 'Not specified',
              description: drug.description?.[0]?.substring(0, 300) + '...' || 'No description available',
              icon: '💊',
              category: 'API Result',
              source: 'fda',
              imageUrl: getMedicineImage(drug.openfda?.brand_name?.[0] || 'Medicine', 'API Result')
            }));
          }
        }
      } catch (err) {
        console.log('FDA API search failed:', err);
      }

      const allResults = [...localResults, ...apiResults];
      setMedicines(allResults);

      if (allResults.length > 0) {
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
          return newHistory;
        });
      }

    } catch (err) {
      console.error('Search Error:', err);
      setError(`Failed to fetch medicine data: ${err.message}`);
      setMedicines([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchMedicines(searchTerm);
      } else {
        setMedicines([]);
        setViewMode('categories');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMedicines]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const quickSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setViewMode('categories');
  };

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  if (loading) {
    return (
      <div style={currentStyles.loadingContainer}>
        <div style={currentStyles.spinner}></div>
        <p>Loading MediChecker...</p>
      </div>
    );
  }

  return (
    <div style={currentStyles.container}>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.content}>
        {/* Header */}
        <div style={currentStyles.header}>
          <h1 style={currentStyles.title}>Medicine Database</h1>
          <p style={currentStyles.subtitle}>
            Browse medicines by category or search the database
          </p>
        </div>

        {/* Search Section */}
        <div style={currentStyles.searchSection}>
          <div style={currentStyles.searchContainer}>
            <input
              type="text"
              placeholder="Search for medicines (e.g., Tylenol, Ibuprofen, Metformin)..."
              value={searchTerm}
              onChange={handleSearch}
              style={currentStyles.searchInput}
            />
            <span style={currentStyles.searchIcon}>🔍</span>
          </div>
          
          {apiLoading && (
            <div style={currentStyles.loadingIndicator}>
              Searching for &quot;{searchTerm}&quot;...
            </div>
          )}
        </div>

        {/* Category Filter Buttons */}
        {viewMode === 'categories' && (
          <div style={currentStyles.categoryFilter}>
            <button
              onClick={() => handleCategoryFilter('all')}
              style={selectedCategory === 'all' ? 
                {...currentStyles.categoryButton, ...currentStyles.categoryButtonActive} : 
                currentStyles.categoryButton
              }
            >
              All Categories
            </button>
            {Object.keys(medicineCategories).map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                style={selectedCategory === category ? 
                  {...currentStyles.categoryButton, ...currentStyles.categoryButtonActive} : 
                  currentStyles.categoryButton
                }
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={currentStyles.errorMessage}>
            <span style={currentStyles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Search Results */}
        {viewMode === 'search' && (
          <div>
            {medicines.length > 0 && (
              <div style={currentStyles.resultsCount}>
                Found {medicines.length} medicine(s) for &quot;{searchTerm}&quot;
              </div>
            )}
            
            <div style={currentStyles.medicineGrid}>
              {medicines.map(medicine => (
                <div
                  key={medicine.id}
                  style={currentStyles.medicineCard}
                  onClick={() => setSelectedMedicine(medicine)}
                >
                  <div style={currentStyles.medicineImageContainer}>
                    <Image
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      style={currentStyles.medicineImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      style={{
                        ...currentStyles.medicineIcon,
                        display: 'none'
                      }}
                    >
                      {medicine.icon}
                    </div>
                  </div>
                  <h3 style={currentStyles.medicineName}>{medicine.name}</h3>
                  <p style={currentStyles.medicineGeneric}>
                    Generic: {medicine.genericName}
                  </p>
                  <p style={currentStyles.medicineManufacturer}>
                    Manufacturer: {medicine.manufacturer}
                  </p>
                  <div style={currentStyles.categoryTag}>
                    {medicine.category}
                  </div>
                  {medicine.source && (
                    <div style={currentStyles.sourceTag}>
                      {medicine.source.toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {searchTerm && !apiLoading && medicines.length === 0 && !error && (
              <div style={currentStyles.noResults}>
                <h3>No medicines found for &quot;{searchTerm}&quot;</h3>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setViewMode('categories');
                  }}
                  style={currentStyles.backToCategoriesButton}
                >
                  Back to Categories
                </button>
              </div>
            )}
          </div>
        )}

        {/* Category View */}
        {viewMode === 'categories' && (
          <div style={currentStyles.categoryView}>
            {Object.entries(medicineCategories).map(([categoryName, categoryMedicines]) => {
              if (selectedCategory !== 'all' && selectedCategory !== categoryName) {
                return null;
              }

              return (
                <div key={categoryName} style={currentStyles.categorySection}>
                  <div style={currentStyles.categoryHeader}>
                    <h2 style={currentStyles.categoryTitle}>{categoryName}</h2>
                    <span style={currentStyles.categoryCount}>
                      {categoryMedicines.length} medicines
                    </span>
                  </div>
                  
                  <div style={currentStyles.medicineGrid}>
                    {categoryMedicines.map(medicine => (
                      <div
                        key={medicine.id}
                        style={currentStyles.medicineCard}
                        onClick={() => setSelectedMedicine({
                          ...medicine,
                          imageUrl: getMedicineImage(medicine.name, medicine.category)
                        })}
                      >
                        <div style={currentStyles.medicineImageContainer}>
                          <Image 
                            src={getMedicineImage(medicine.name, medicine.category)}
                            alt={medicine.name}
                            style={currentStyles.medicineImage}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div 
                            style={{
                              ...currentStyles.medicineIcon,
                              display: 'none'
                            }}
                          >
                            {medicine.icon}
                          </div>
                        </div>
                        <h3 style={currentStyles.medicineName}>{medicine.name}</h3>
                        <p style={currentStyles.medicineGeneric}>
                          Generic: {medicine.genericName}
                        </p>
                        <p style={currentStyles.medicineManufacturer}>
                          Manufacturer: {medicine.manufacturer}
                        </p>
                        <div style={currentStyles.dosageInfo}>
                          Dosage: {medicine.dosage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Access for Popular Medicines */}
        {viewMode === 'categories' && selectedCategory === 'all' && (
          <div style={currentStyles.quickAccess}>
            <h3 style={currentStyles.quickAccessTitle}>Quick Search</h3>
            <div style={currentStyles.quickSearchGrid}>
              {['Tylenol', 'Advil', 'Lisinopril', 'Metformin', 'Prilosec', 'Zyrtec'].map(term => (
                <button
                  key={term}
                  onClick={() => quickSearch(term)}
                  style={currentStyles.quickSearchButton}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <div style={currentStyles.modalOverlay} onClick={() => setSelectedMedicine(null)}>
          <div style={currentStyles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              style={currentStyles.closeButton}
              onClick={() => setSelectedMedicine(null)}
            >
              ✕
            </button>
            
            <div style={currentStyles.modalHeader}>
              <div style={currentStyles.modalImageContainer}>
                <Image
                  src={selectedMedicine.imageUrl || getMedicineImage(selectedMedicine.name, selectedMedicine.category)}
                  alt={selectedMedicine.name}
                  style={currentStyles.modalImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  style={{
                    ...currentStyles.modalIcon,
                    display: 'none'
                  }}
                >
                  {selectedMedicine.icon}
                </div>
              </div>
              <div>
                <h2 style={currentStyles.modalTitle}>{selectedMedicine.name}</h2>
                <p style={currentStyles.modalGeneric}>
                  Generic: {selectedMedicine.genericName}
                </p>
                <div style={currentStyles.modalCategoryTag}>
                  {selectedMedicine.category}
                </div>
              </div>
            </div>

            <div style={currentStyles.modalContent}>
              <div style={currentStyles.modalSection}>
                <h3>Basic Information</h3>
                <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</p>
                <p><strong>Dosage:</strong> {selectedMedicine.dosage}</p>
                <p><strong>Category:</strong> {selectedMedicine.category}</p>
              </div>

              <div style={currentStyles.modalSection}>
                <h3>Description</h3>
                <p>{selectedMedicine.description}</p>
              </div>

              <div style={currentStyles.disclaimer}>
                <strong>Disclaimer:</strong> This information is for educational purposes only. 
                Always consult with a healthcare professional before taking any medication.
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer isDarkTheme={isDarkMode} />
    </div>
  );
}

// Complete Styles with new category styles
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: "20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "3px solid #e9ecef",
    borderTop: "3px solid #28a745",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "100px 20px 40px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "18px",
    opacity: 0.8,
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
    gap: "16px",
  },
  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },
  searchInput: {
    width: "100%",
    padding: "16px 50px 16px 20px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    opacity: 0.6,
  },
  loadingIndicator: {
    fontSize: "14px",
    opacity: 0.7,
    fontStyle: "italic",
  },
  categoryFilter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "40px",
    justifyContent: "center",
  },
  categoryButton: {
    padding: "10px 20px",
    borderRadius: "25px",
    border: "2px solid #28a745",
    backgroundColor: "transparent",
    color: "#28a745",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  categoryButtonActive: {
    backgroundColor: "#28a745",
    color: "white",
  },
  categoryView: {
    marginBottom: "40px",
  },
  categorySection: {
    marginBottom: "60px",
  },
  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e9ecef",
  },
  categoryTitle: {
    fontSize: "28px",
    fontWeight: "600",
    margin: 0,
  },
  categoryCount: {
    fontSize: "14px",
    opacity: 0.7,
    fontWeight: "500",
  },
  resultsCount: {
    textAlign: "center",
    padding: "12px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "8px",
    marginBottom: "24px",
    fontWeight: "500",
  },
  medicineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  medicineCard: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  medicineImageContainer: {
    textAlign: "center",
    marginBottom: "16px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  medicineImage: {
    maxWidth: "120px",
    maxHeight: "80px",
    objectFit: "contain",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  medicineIcon: {
    fontSize: "48px",
    textAlign: "center",
  },
  medicineName: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  medicineGeneric: {
    fontSize: "14px",
    opacity: 0.7,
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  medicineManufacturer: {
    fontSize: "14px",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  dosageInfo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#28a745",
    marginBottom: "8px",
  },
  categoryTag: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#28a745",
    color: "white",
    marginBottom: "8px",
    marginRight: "8px",
  },
  sourceTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "500",
    backgroundColor: "#007bff",
    color: "white",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    opacity: 0.7,
  },
  backToCategoriesButton: {
    marginTop: "20px",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
  quickAccess: {
    marginTop: "60px",
    padding: "32px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
  },
  quickAccessTitle: {
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "24px",
    fontWeight: "600",
  },
  quickSearchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  quickSearchButton: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid #28a745",
    backgroundColor: "transparent",
    color: "#28a745",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    marginBottom: "24px",
    textAlign: "center",
    justifyContent: "center",
  },
  errorIcon: {
    fontSize: "18px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "700px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px 24px 0",
    marginBottom: "24px",
  },
  modalImageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
  },
  modalImage: {
    maxWidth: "80px",
    maxHeight: "60px",
    objectFit: "contain",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  modalIcon: {
    fontSize: "48px",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  modalGeneric: {
    fontSize: "16px",
    opacity: 0.7,
    margin: "0 0 8px 0",
  },
  modalCategoryTag: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#28a745",
    color: "white",
  },
  modalContent: {
    padding: "0 24px 24px",
  },
  modalSection: {
    marginBottom: "24px",
  },
  disclaimer: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#e7f3ff",
    border: "1px solid #b8daff",
    color: "#004085",
    fontSize: "14px",
    marginTop: "24px",
  },
};

const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  title: {
    ...baseStyles.title,
    color: "#333333",
  },
  categoryTitle: {
    ...baseStyles.categoryTitle,
    color: "#333333",
  },
  medicineCard: {
    ...baseStyles.medicineCard,
    backgroundColor: "#ffffff",
  },
  modal: {
    ...baseStyles.modal,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
};

const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
  },
  title: {
    ...baseStyles.title,
    color: "#ffffff",
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: "#b0b0b0",
  },
  searchInput: {
    ...baseStyles.searchInput,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    borderColor: "#404040",
  },
  categoryButton: {
    ...baseStyles.categoryButton,
    borderColor: "#28a745",
    color: "#28a745",
    backgroundColor: "transparent",
  },
  categoryButtonActive: {
    ...baseStyles.categoryButtonActive,
    backgroundColor: "#28a745",
    color: "white",
  },
  categoryHeader: {
    ...baseStyles.categoryHeader,
    borderBottomColor: "#404040",
  },
  categoryTitle: {
    ...baseStyles.categoryTitle,
    color: "#ffffff",
  },
  categoryCount: {
    ...baseStyles.categoryCount,
    color: "#b0b0b0",
  },
  resultsCount: {
    ...baseStyles.resultsCount,
    backgroundColor: "#1a2d1a",
    color: "#4ade80",
  },
  medicineCard: {
    ...baseStyles.medicineCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  medicineName: {
    ...baseStyles.medicineName,
    color: "#ffffff",
  },
  medicineGeneric: {
    ...baseStyles.medicineGeneric,
    color: "#b0b0b0",
  },
  medicineManufacturer: {
    ...baseStyles.medicineManufacturer,
    color: "#b0b0b0",
  },
  quickAccess: {
    ...baseStyles.quickAccess,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
  },
  quickAccessTitle: {
    ...baseStyles.quickAccessTitle,
    color: "#ffffff",
  },
  quickSearchButton: {
    ...baseStyles.quickSearchButton,
    borderColor: "#28a745",
    color: "#28a745",
  },
  backToCategoriesButton: {
    ...baseStyles.backToCategoriesButton,
    backgroundColor: "#28a745",
  },
  modal: {
    ...baseStyles.modal,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
  },
  closeButton: {
    ...baseStyles.closeButton,
    backgroundColor: "#404040",
    color: "#ffffff",
  },
  modalTitle: {
    ...baseStyles.modalTitle,
    color: "#ffffff",
  },
  modalGeneric: {
    ...baseStyles.modalGeneric,
    color: "#b0b0b0",
  },
  disclaimer: {
    ...baseStyles.disclaimer,
    backgroundColor: "#1a2d3a",
    borderColor: "#2a5a8a",
    color: "#87ceeb",
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .medicine-grid {
        grid-template-columns: 1fr !important;
      }
      
      .category-filter {
        justify-content: center;
      }
      
      .quick-search-grid {
        grid-template-columns: 1fr 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}