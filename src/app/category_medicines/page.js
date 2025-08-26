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
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to get medicine icon based on name or type
  const getMedicineIcon = (medicineName, category) => {
    const name = medicineName.toLowerCase();
    
    // Medicine-specific icons
    const medicineIcons = {
      // Pain relievers
      'tylenol': '🟡',
      'acetaminophen': '🟡',
      'ibuprofen': '🔴',
      'advil': '🔴',
      'motrin': '🔴',
      'aspirin': '⚪',
      'bayer': '⚪',
      
      // Antibiotics
      'amoxicillin': '💊',
      'penicillin': '💉',
      'azithromycin': '💊',
      'doxycycline': '💊',
      
      // Heart medications
      'lisinopril': '❤️',
      'metoprolol': '💓',
      'atorvastatin': '💊',
      'lipitor': '💊',
      'amlodipine': '❤️',
      
      // Diabetes
      'metformin': '📊',
      'insulin': '💉',
      'glipizide': '📊',
      
      // Digestive
      'omeprazole': '🟢',
      'prilosec': '🟢',
      'lansoprazole': '🟢',
      
      // Allergy
      'cetirizine': '🌸',
      'zyrtec': '🌸',
      'loratadine': '🌸',
      'claritin': '🌸',
      
      // Mental health
      'sertraline': '🧠',
      'zoloft': '🧠',
      'fluoxetine': '🧠',
      'prozac': '🧠',
    };

    // Check for specific medicine name first
    if (medicineIcons[name]) {
      return medicineIcons[name];
    }

    // Check for partial matches
    for (const [key, icon] of Object.entries(medicineIcons)) {
      if (name.includes(key) || key.includes(name)) {
        return icon;
      }
    }

    // Default by category
    const categoryIcons = {
      'pain': '🟡',
      'antibiotic': '💊',
      'cardiovascular': '❤️',
      'diabetes': '📊',
      'allergy': '🌸',
      'digestive': '🟢',
      'mental': '🧠',
    };

    if (category) {
      const cat = category.toLowerCase();
      for (const [key, icon] of Object.entries(categoryIcons)) {
        if (cat.includes(key)) {
          return icon;
        }
      }
    }

    return '💊'; // Default
  };

  // Function to get medicine image placeholder
  const getMedicineImage = (medicineName, source, category) => {
    const colorMap = {
      'Pain Relief': 'ff6b6b',
      'Cardiovascular': 'e74c3c',
      'Diabetes': '3498db',
      'Antibiotics': '2ecc71',
      'Digestive': '95a5a6',
      'Allergy': 'f39c12',
      'Mental Health': '9b59b6',
      'tylenol': 'ff6b6b',
      'ibuprofen': '4ecdc4',
      'aspirin': '45b7d1',
      'metformin': '96ceb4',
      'lisinopril': 'feca57',
      'omeprazole': '6c5ce7',
      'atorvastatin': 'fd79a8',
    };

    const name = medicineName.toLowerCase();
    let color = '28a745'; // default green

    // Check for category colors first
    if (category && colorMap[category]) {
      color = colorMap[category];
    } else {
      // Check for specific medicine colors
      for (const [med, medColor] of Object.entries(colorMap)) {
        if (name.includes(med)) {
          color = medColor;
          break;
        }
      }
    }

    // Different color for different sources
    if (source === 'rxnav') {
      color = '007bff';
    }

    const shortName = medicineName.length > 8 ? 
      medicineName.substring(0, 8) + '...' : 
      medicineName;

    return `https://via.placeholder.com/120x80/${color}/ffffff?text=${encodeURIComponent(shortName)}`;
  };

  // Enhanced search function with categories
  const searchMedicines = useCallback(async (query, category = 'all') => {
    if (!query.trim()) {
      setMedicines([]);
      return;
    }

    setApiLoading(true);
    setError(null);

    try {
      let allResults = [];

      // Strategy 1: Search in local categories first
      let localResults = [];
      Object.entries(medicineCategories).forEach(([categoryName, categoryMedicines]) => {
        // If a specific category is selected, only search in that category
        if (category !== 'all' && category !== categoryName) {
          return;
        }

        categoryMedicines.forEach(medicine => {
          if (
            medicine.name.toLowerCase().includes(query.toLowerCase()) ||
            medicine.genericName.toLowerCase().includes(query.toLowerCase()) ||
            medicine.category.toLowerCase().includes(query.toLowerCase())
          ) {
            localResults.push({
              ...medicine,
              source: 'local',
              imageUrl: getMedicineImage(medicine.name, 'local', medicine.category)
            });
          }
        });
      });

      allResults = [...localResults];

      // Strategy 2: FDA API with multiple search fields
      const fdaSearches = [
        `openfda.brand_name:"${query}"`,
        `openfda.generic_name:"${query}"`,
        `active_ingredient:"${query}"`,
        `openfda.brand_name:${query}*`, // Wildcard search
        `openfda.generic_name:${query}*`,
        `active_ingredient:${query}*`
      ];

      for (const searchQuery of fdaSearches) {
        try {
          console.log(`Searching FDA with: ${searchQuery}`);
          const response = await fetch(
            `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchQuery)}&limit=10`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              console.log(`Found ${data.results.length} results from FDA`);
              allResults = [...allResults, ...data.results];
            }
          }
        } catch (err) {
          console.log(`FDA search failed for: ${searchQuery}`, err.message);
        }
      }

      // Strategy 3: RxNav API as backup
      try {
        console.log(`Searching RxNav for: ${query}`);
        const rxNavResponse = await fetch(
          `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`
        );

        if (rxNavResponse.ok) {
          const rxNavData = await rxNavResponse.json();
          if (rxNavData.drugGroup?.conceptGroup) {
            console.log(`Found results from RxNav`);
            // Convert RxNav results to FDA-like format
            rxNavData.drugGroup.conceptGroup.forEach(group => {
              if (group.conceptProperties) {
                group.conceptProperties.forEach(drug => {
                  allResults.push({
                    openfda: {
                      brand_name: [drug.name],
                      generic_name: [drug.name],
                      rxcui: [drug.rxcui]
                    },
                    description: [`RxNav drug: ${drug.name}`],
                    _source: 'rxnav',
                    _rxcui: drug.rxcui,
                    _tty: group.tty
                  });
                });
              }
            });
          }
        }
      } catch (err) {
        console.log('RxNav search failed:', err.message);
      }

      // Remove duplicates and format results
      const uniqueResults = [];
      const seen = new Set();

      allResults.forEach(drug => {
        let name, source, isLocal;
        
        if (drug.source === 'local') {
          name = drug.name;
          source = 'local';
          isLocal = true;
        } else {
          name = drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || 'Unknown';
          source = drug._source || 'fda';
          isLocal = false;
        }
        
        const key = name.toLowerCase();
        
        if (!seen.has(key)) {
          seen.add(key);
          if (isLocal) {
            uniqueResults.push(drug);
          } else {
            uniqueResults.push(drug);
          }
        }
      });

      const formattedMedicines = uniqueResults.slice(0, 20).map((drug, index) => {
        if (drug.source === 'local') {
          return drug; // Local medicines are already formatted
        }

        const name = drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || 'Unknown';
        const source = drug._source || 'fda';
        
        return {
          id: drug._rxcui || `${source}_${index}`,
          name,
          genericName: drug.openfda?.generic_name?.[0] || drug.openfda?.brand_name?.[0] || 'Unknown',
          manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Unknown',
          dosage: drug.dosage_and_administration?.[0]?.substring(0, 100) + '...' || 'Not specified',
          indications: drug.indications_and_usage?.[0]?.substring(0, 200) + '...' || 'Not specified',
          warnings: drug.warnings?.[0]?.substring(0, 200) + '...' || 'Not specified',
          adverseReactions: drug.adverse_reactions?.[0]?.substring(0, 200) + '...' || 'Not specified',
          description: drug.description?.[0]?.substring(0, 300) + '...' || 'No description available',
          activeIngredient: drug.active_ingredient?.[0] || 'Not specified',
          purpose: drug.purpose?.[0] || 'Not specified',
          routeOfAdministration: drug.openfda?.route?.[0] || 'Not specified',
          substanceCategory: drug.openfda?.substance_name?.[0] || 'Not specified',
          rxcui: drug.openfda?.rxcui?.[0] || drug._rxcui || null,
          source,
          tty: drug._tty || null,
          category: 'API Result',
          icon: getMedicineIcon(name),
          imageUrl: getMedicineImage(name, source, 'API Result')
        };
      });

      console.log(`Total formatted results: ${formattedMedicines.length}`);
      setMedicines(formattedMedicines);

      // Add to search history
      if (formattedMedicines.length > 0) {
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
          return newHistory;
        });
      }

    } catch (err) {
      console.error('Search Error:', err);
      setError(`Failed to fetch medicine data: ${err.message}. Try a different search term.`);
      setMedicines([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Fixed debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchMedicines(searchTerm, selectedCategory);
      } else {
        setMedicines([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, searchMedicines]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Quick search for common medicines
  const quickSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (searchTerm.trim()) {
      searchMedicines(searchTerm, category);
    }
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
            Search for medicines using FDA, RxNav databases and categories
          </p>
        </div>

        {/* Category Filter */}
        <div style={currentStyles.categoryFilter}>
          <button
            onClick={() => handleCategoryChange('all')}
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
              onClick={() => handleCategoryChange(category)}
              style={selectedCategory === category ? 
                {...currentStyles.categoryButton, ...currentStyles.categoryButtonActive} : 
                currentStyles.categoryButton
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Section */}
        <div style={currentStyles.searchSection}>
          <div style={currentStyles.searchContainer}>
            <input
              type="text"
              placeholder={`Search for medicines${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''} (e.g., Tylenol, Ibuprofen, Metformin)...`}
              value={searchTerm}
              onChange={handleSearch}
              style={currentStyles.searchInput}
            />
            <span style={currentStyles.searchIcon}>🔍</span>
          </div>
          
          {apiLoading && (
            <div style={currentStyles.loadingIndicator}>
              Searching {selectedCategory !== 'all' ? `${selectedCategory} category and ` : ''}FDA and RxNav databases for "{searchTerm}"...
            </div>
          )}

          {/* Quick Search Buttons */}
          <div style={currentStyles.quickSearch}>
            <span style={currentStyles.quickSearchLabel}>Quick search: </span>
            {['Tylenol', 'Ibuprofen', 'Aspirin', 'Metformin', 'Lisinopril', 'Omeprazole'].map(term => (
              <button
                key={term}
                onClick={() => quickSearch(term)}
                style={currentStyles.quickSearchButton}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div style={currentStyles.searchHistory}>
              <span style={currentStyles.historyLabel}>Recent searches: </span>
              {searchHistory.map(term => (
                <button
                  key={term}
                  onClick={() => quickSearch(term)}
                  style={currentStyles.historyButton}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={currentStyles.errorMessage}>
            <span style={currentStyles.errorIcon}>⚠️</span>
            {error}
            <div style={currentStyles.errorSuggestions}>
              Try searching for: "Tylenol", "Aspirin", "Ibuprofen", or "Metformin"
            </div>
          </div>
        )}

        {/* Results Count */}
        {medicines.length > 0 && (
          <div style={currentStyles.resultsCount}>
            Found {medicines.length} medicine(s) for "{searchTerm}"
            {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
          </div>
        )}

        {/* Medicine Grid */}
        {medicines.length > 0 && (
          <div style={currentStyles.medicineGrid}>
            {medicines.map(medicine => (
              <div
                key={medicine.id}
                style={currentStyles.medicineCard}
                onClick={() => setSelectedMedicine(medicine)}
              >
                <div style={currentStyles.medicineImageContainer}>
                  <img 
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
                {medicine.genericName !== medicine.name && (
                  <p style={currentStyles.medicineGeneric}>
                    Generic: {medicine.genericName}
                  </p>
                )}
                <p style={currentStyles.medicineManufacturer}>
                  Manufacturer: {medicine.manufacturer}
                </p>
                <div style={currentStyles.categoryTag}>
                  {medicine.category}
                </div>
                <div style={currentStyles.sourceTag}>
                  {medicine.source.toUpperCase()}
                </div>
                {medicine.tty && (
                  <div style={currentStyles.medicineType}>
                    Type: {medicine.tty}
                  </div>
                )}
                {medicine.rxcui && (
                  <div style={currentStyles.rxcui}>
                    RxCUI: {medicine.rxcui}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchTerm && !apiLoading && medicines.length === 0 && !error && (
          <div style={currentStyles.noResults}>
            <h3>No medicines found for "{searchTerm}"
              {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
            </h3>
            <p>This could happen because:</p>
            <ul style={currentStyles.reasonsList}>
              <li>The medicine name might be spelled differently</li>
              <li>It might not be in the {selectedCategory !== 'all' ? `${selectedCategory} category or ` : ''}FDA or RxNav databases</li>
              <li>Try searching with brand name or generic name</li>
              <li>Try partial names (e.g., "Tylen" instead of "Tylenol")</li>
              <li>Try selecting "All Categories" to search in all categories</li>
            </ul>
            <div style={currentStyles.suggestions}>
              <strong>Try these common medicines:</strong>
              <div style={currentStyles.suggestionButtons}>
                {['Acetaminophen', 'Ibuprofen', 'Aspirin', 'Metformin', 'Atorvastatin'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => quickSearch(suggestion)}
                    style={currentStyles.suggestionButton}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!searchTerm && (
          <div style={currentStyles.instructions}>
            <h3>Search Tips:</h3>
            <ul>
              <li><strong>Categories:</strong> Filter by medicine category for focused search</li>
              <li><strong>Brand names:</strong> Tylenol, Advil, Motrin, Lipitor</li>
              <li><strong>Generic names:</strong> Acetaminophen, Ibuprofen, Atorvastatin</li>
              <li><strong>Active ingredients:</strong> Search by what's in the medicine</li>
              <li><strong>Partial matches:</strong> Try "Ibup" if "Ibuprofen" doesn't work</li>
            </ul>
            
            <h4>Database Coverage:</h4>
            <p>We search local medicine categories, FDA OpenFDA and RxNav databases to give you the most comprehensive results.</p>
            
            <h4>Categories Available:</h4>
            <div style={currentStyles.categoryList}>
              {Object.keys(medicineCategories).map(category => (
                <span key={category} style={currentStyles.categoryItem}>
                  {category}
                </span>
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
                <img 
                  src={selectedMedicine.imageUrl}
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
                {selectedMedicine.genericName !== selectedMedicine.name && (
                  <p style={currentStyles.modalGeneric}>
                    Generic: {selectedMedicine.genericName}
                  </p>
                )}
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
                {selectedMedicine.activeIngredient && (
                  <p><strong>Active Ingredient:</strong> {selectedMedicine.activeIngredient}</p>
                )}
                {selectedMedicine.purpose && (
                  <p><strong>Purpose:</strong> {selectedMedicine.purpose}</p>
                )}
                {selectedMedicine.routeOfAdministration && (
                  <p><strong>Route:</strong> {selectedMedicine.routeOfAdministration}</p>
                )}
                {selectedMedicine.rxcui && (
                  <p><strong>RxCUI:</strong> {selectedMedicine.rxcui}</p>
                )}
              </div>

              {selectedMedicine.description && (
                <div style={currentStyles.modalSection}>
                  <h3>Description</h3>
                  <p>{selectedMedicine.description}</p>
                </div>
              )}

              {selectedMedicine.indications && (
                <div style={currentStyles.modalSection}>
                  <h3>Indications and Usage</h3>
                  <p>{selectedMedicine.indications}</p>
                </div>
              )}

              {selectedMedicine.dosage && selectedMedicine.source !== 'local' && (
                <div style={currentStyles.modalSection}>
                  <h3>Dosage and Administration</h3>
                  <p>{selectedMedicine.dosage}</p>
                </div>
              )}

              {selectedMedicine.warnings && (
                <div style={currentStyles.modalSection}>
                  <h3>Warnings</h3>
                  <div style={currentStyles.warningBox}>
                    <p>{selectedMedicine.warnings}</p>
                  </div>
                </div>
              )}

              {selectedMedicine.adverseReactions && (
                <div style={currentStyles.modalSection}>
                  <h3>Adverse Reactions</h3>
                  <p>{selectedMedicine.adverseReactions}</p>
                </div>
              )}

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

// Complete Styles with Poppins font
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: "20px",
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
  },
  subtitle: {
    fontSize: "18px",
    opacity: 0.8,
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "400",
  },
  categoryFilter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "30px",
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
    fontFamily: "'Poppins', sans-serif",
  },
  categoryButtonActive: {
    backgroundColor: "#28a745",
    color: "white",
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
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
  },
  quickSearch: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
  },
  quickSearchLabel: {
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.8,
    fontFamily: "'Poppins', sans-serif",
  },
  quickSearchButton: {
    padding: "6px 12px",
    borderRadius: "16px",
    border: "1px solid #28a745",
    backgroundColor: "transparent",
    color: "#28a745",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
  },
  searchHistory: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
  },
  historyLabel: {
    fontSize: "12px",
    opacity: 0.6,
    fontFamily: "'Poppins', sans-serif",
  },
  historyButton: {
    padding: "4px 8px",
    borderRadius: "12px",
    border: "1px solid #6c757d",
    backgroundColor: "transparent",
    color: "#6c757d",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "'Poppins', sans-serif",
  },
  errorMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    marginBottom: "24px",
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  errorIcon: {
    fontSize: "18px",
  },
  errorSuggestions: {
    marginTop: "8px",
    fontSize: "12px",
    opacity: 0.8,
  },
  resultsCount: {
    textAlign: "center",
    padding: "12px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "8px",
    marginBottom: "24px",
    fontWeight: "500",
    fontFamily: "'Poppins', sans-serif",
  },
  medicineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
  },
  medicineGeneric: {
    fontSize: "14px",
    opacity: 0.7,
    marginBottom: "8px",
    margin: "0 0 8px 0",
    fontFamily: "'Poppins', sans-serif",
  },
  medicineManufacturer: {
    fontSize: "14px",
    marginBottom: "12px",
    margin: "0 0 12px 0",
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
  },
  sourceTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "500",
    backgroundColor: "#007bff",
    color: "white",
    marginBottom: "8px",
    marginRight: "8px",
    fontFamily: "'Poppins', sans-serif",
  },
  medicineType: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#6f42c1",
    color: "white",
    marginBottom: "8px",
    fontFamily: "'Poppins', sans-serif",
  },
  rxcui: {
    fontSize: "12px",
    opacity: 0.6,
    fontFamily: "'Courier New', monospace",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    opacity: 0.7,
    fontFamily: "'Poppins', sans-serif",
  },
  reasonsList: {
    textAlign: "left",
    marginBottom: "20px",
    fontFamily: "'Poppins', sans-serif",
  },
  suggestions: {
    marginTop: "20px",
  },
  suggestionButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
    justifyContent: "center",
  },
  suggestionButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #28a745",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
  },
  instructions: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    fontFamily: "'Poppins', sans-serif",
  },
  categoryList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  categoryItem: {
    padding: "4px 12px",
    borderRadius: "16px",
    backgroundColor: "#e9ecef",
    fontSize: "12px",
    fontWeight: "500",
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
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
    fontFamily: "'Poppins', sans-serif",
  },
  modalGeneric: {
    fontSize: "16px",
    opacity: 0.7,
    margin: "0 0 8px 0",
    fontFamily: "'Poppins', sans-serif",
  },
  modalCategoryTag: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#28a745",
    color: "white",
    fontFamily: "'Poppins', sans-serif",
  },
  modalContent: {
    padding: "0 24px 24px",
    fontFamily: "'Poppins', sans-serif",
  },
  modalSection: {
    marginBottom: "24px",
  },
  warningBox: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    color: "#856404",
    fontFamily: "'Poppins', sans-serif",
  },
  disclaimer: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#e7f3ff",
    border: "1px solid #b8daff",
    color: "#004085",
    fontSize: "14px",
    marginTop: "24px",
    fontFamily: "'Poppins', sans-serif",
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
  medicineCard: {
    ...baseStyles.medicineCard,
    backgroundColor: "#ffffff",
  },
  modal: {
    ...baseStyles.modal,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  categoryItem: {
    ...baseStyles.categoryItem,
    backgroundColor: "#e9ecef",
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
  searchInput: {
    ...baseStyles.searchInput,
    backgroundColor: "#2d2d2d",
    color: "#ffffff",
    borderColor: "#404040",
  },
  quickSearchButton: {
    ...baseStyles.quickSearchButton,
    borderColor: "#28a745",
    color: "#28a745",
    backgroundColor: "transparent",
  },
  historyButton: {
    ...baseStyles.historyButton,
    borderColor: "#6c757d",
    color: "#6c757d",
    backgroundColor: "transparent",
  },
  errorMessage: {
    ...baseStyles.errorMessage,
    backgroundColor: "#2d1a1a",
    borderColor: "#5a2a2a",
    color: "#ff6b6b",
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
  instructions: {
    ...baseStyles.instructions,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff",
  },
  categoryItem: {
    ...baseStyles.categoryItem,
    backgroundColor: "#404040",
    color: "#ffffff",
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
  warningBox: {
    ...baseStyles.warningBox,
    backgroundColor: "#2d2a1a",
    borderColor: "#5a5a2a",
    color: "#ffd60a",
  },
  disclaimer: {
    ...baseStyles.disclaimer,
    backgroundColor: "#1a2d3a",
    borderColor: "#2a5a8a",
    color: "#87ceeb",
  },
};

// Add CSS animations and Google Fonts
if (typeof document !== 'undefined') {
  // Add Google Fonts
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .medicine-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.15) !important;
    }
    
    .quick-search-button:hover {
      background-color: #28a745 !important;
      color: white !important;
    }
    
    .suggestion-button:hover {
      background-color: #20c997 !important;
    }
    
    .category-button:hover:not(.active) {
      background-color: rgba(40, 167, 69, 0.1) !important;
    }
    
    @media (max-width: 768px) {
      .medicine-grid {
        grid-template-columns: 1fr !important;
      }
      
      .quick-search {
        justify-content: center;
      }
      
      .search-history {
        justify-content: center;
      }
      
      .category-filter {
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
}