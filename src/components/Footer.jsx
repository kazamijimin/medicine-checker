import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // 👈 Add this import

const Footer = ({ isDarkTheme }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const medicineFilters = ['All', '#', '0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Local medicine database for quick filtering
  const localMedicines = {
    'A': ['Acetaminophen', 'Aspirin', 'Amoxicillin', 'Atorvastatin', 'Amlodipine'],
    'B': ['Benadryl', 'Buspirone', 'Buproprion', 'Baclofen'],
    'C': ['Cetirizine', 'Claritin', 'Ciprofloxacin', 'Citalopram'],
    'D': ['Doxycycline', 'Duloxetine', 'Diazepam', 'Dextromethorphan'],
    'E': ['Escitalopram', 'Esomeprazole', 'Enalapril', 'Epinephrine'],
    'F': ['Fluoxetine', 'Fexofenadine', 'Furosemide', 'Finasteride'],
    'G': ['Gabapentin', 'Glipizide', 'Guaifenesin', 'Glyburide'],
    'H': ['Hydrochlorothiazide', 'Hydrocortisone', 'Hydroxyzine', 'Hydrocodone'],
    'I': ['Ibuprofen', 'Insulin', 'Irbesartan', 'Isosorbide'],
    'L': ['Lisinopril', 'Levothyroxine', 'Loratadine', 'Losartan'],
    'M': ['Metformin', 'Metoprolol', 'Montelukast', 'Morphine'],
    'O': ['Omeprazole', 'Oxycodone', 'Ondansetron', 'Olanzapine'],
    'P': ['Prednisone', 'Prozac', 'Pantoprazole', 'Pravastatin'],
    'S': ['Sertraline', 'Simvastatin', 'Sildenafil', 'Spironolactone'],
    'T': ['Tylenol', 'Tramadol', 'Trazodone', 'Topiramate'],
    'Z': ['Zoloft', 'Zyrtec', 'Zantac', 'Ziprasidone']
  };

  // Function to fetch medicines from API
  const fetchMedicinesFromAPI = async (filter) => {
    setLoading(true);
    setError(null);
    
    try {
      let searchQueries = [];
      
      // Generate search queries based on filter
      if (filter === 'All') {
        searchQueries = ['tylenol', 'aspirin', 'ibuprofen', 'metformin', 'lisinopril'];
      } else if (filter === '#' || filter === '0-9') {
        // For numbers, we'll show some common numeric medicine codes
        setMedicines([
          { name: '5-ASA (Mesalamine)', description: 'Anti-inflammatory for IBD', source: 'local' },
          { name: '5-HTP (5-Hydroxytryptophan)', description: 'Serotonin precursor supplement', source: 'local' }
        ]);
        setLoading(false);
        return;
      } else {
        // Get local medicines starting with the letter
        const localMeds = localMedicines[filter] || [];
        searchQueries = localMeds.slice(0, 3); // Limit to 3 API calls
      }

      let allMedicines = [];
      
      // First, add local medicines if available
      if (filter !== 'All' && filter !== '#' && filter !== '0-9') {
        const localMeds = localMedicines[filter] || [];
        allMedicines = localMeds.map(med => ({
          name: med,
          description: 'Local database medicine',
          source: 'local'
        }));
      }

      // Then fetch from APIs
      for (const query of searchQueries) {
        try {
          // Try FDA API first
          const fdaResponse = await fetch(
            `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"&limit=5`
          );
          
          if (fdaResponse.ok) {
            const fdaData = await fdaResponse.json();
            if (fdaData.results) {
              fdaData.results.forEach(drug => {
                const name = drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0];
                if (name && (filter === 'All' || name.charAt(0).toUpperCase() === filter)) {
                  allMedicines.push({
                    name: name,
                    description: drug.description?.[0]?.substring(0, 100) + '...' || 'FDA approved medicine',
                    manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Unknown',
                    source: 'FDA'
                  });
                }
              });
            }
          }
        } catch (err) {
          console.log(`FDA API failed for ${query}:`, err.message);
        }

        // Try RxNav API as backup
        try {
          const rxNavResponse = await fetch(
            `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`
          );
          
          if (rxNavResponse.ok) {
            const rxNavData = await rxNavResponse.json();
            if (rxNavData.drugGroup?.conceptGroup) {
              rxNavData.drugGroup.conceptGroup.forEach(group => {
                if (group.conceptProperties) {
                  group.conceptProperties.forEach(drug => {
                    if (filter === 'All' || drug.name.charAt(0).toUpperCase() === filter) {
                      allMedicines.push({
                        name: drug.name,
                        description: `RxNav database medicine - ${group.tty || 'Generic'}`,
                        rxcui: drug.rxcui,
                        source: 'RxNav'
                      });
                    }
                  });
                }
              });
            }
          }
        } catch (err) {
          console.log(`RxNav API failed for ${query}:`, err.message);
        }
      }

      // Remove duplicates and limit results
      const uniqueMedicines = [];
      const seen = new Set();
      
      allMedicines.forEach(med => {
        const key = med.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMedicines.push(med);
        }
      });

      setMedicines(uniqueMedicines.slice(0, 20)); // Limit to 20 results
      
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to fetch medicine data. Showing local data only.');
      
      // Fallback to local data
      if (filter !== 'All' && filter !== '#' && filter !== '0-9') {
        const localMeds = localMedicines[filter] || [];
        setMedicines(localMeds.map(med => ({
          name: med,
          description: 'Local database medicine',
          source: 'local'
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch medicines when filter changes
  useEffect(() => {
    if (selectedFilter !== 'All') {
      fetchMedicinesFromAPI(selectedFilter);
    } else {
      // Show featured medicines for 'All'
      setMedicines([
        { name: 'Acetaminophen', description: 'Pain reliever and fever reducer', source: 'featured' },
        { name: 'Ibuprofen', description: 'Anti-inflammatory pain reliever', source: 'featured' },
        { name: 'Aspirin', description: 'Pain reliever and blood thinner', source: 'featured' },
        { name: 'Metformin', description: 'Type 2 diabetes medication', source: 'featured' },
        { name: 'Lisinopril', description: 'ACE inhibitor for high blood pressure', source: 'featured' }
      ]);
    }
  }, [selectedFilter]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setError(null);
  };

  // Define the footer links with proper URLs
  const helpLinks = [
    { name: 'Contact', href: '#contact' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Privacy Policy', href: '/settings/privacy' }, // 👈 Your privacy page
    { name: 'Terms of Service', href: '/settings/terms' }   // 👈 Create this page
  ];

  const medicineLinks = [
    { name: 'Medicine Database', href: '#' },
    { name: 'Drug Interactions', href: '#' },
    { name: 'Popular Searches', href: '#' },
    { name: 'Emergency Medicines', href: '#' }
  ];

  return (
    <div className={`min-h-screen font-['Poppins',sans-serif] transition-all duration-300 ${
      isDarkTheme ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header Section */}
      <div className={`p-3 sm:p-4 lg:p-6 transition-colors duration-300 ${
        isDarkTheme ? 'bg-slate-800' : 'bg-white shadow-sm border-b border-gray-200'
      }`}>
        {/* Top Bar with Language */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-xs sm:text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
              EN/ES
            </span>
          </div>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-emerald-500">Loading...</span>
            </div>
          )}
        </div>

        {/* Medicine Directory Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 tracking-wide ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            MEDICINE DIRECTORY
          </h1>
          <p className={`text-xs sm:text-sm lg:text-base leading-relaxed ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Search and verify medicines by alphabetical order A to Z. Data from FDA and RxNav APIs.
          </p>
        </div>

        {/* Alphabetical Filter Navigation */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {medicineFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 min-w-[32px] sm:min-w-[40px] ${
                selectedFilter === filter
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : isDarkTheme
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-emerald-400'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-emerald-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Display Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
            <span className="font-medium">⚠️ {error}</span>
          </div>
        )}

        {medicines.length > 0 ? (
          <div>
            <div className="mb-6">
              <h2 className={`text-xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Medicines starting with &quot;{selectedFilter}&quot;
              </h2>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                Found {medicines.length} medicine(s) • Data from multiple sources
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${
                    isDarkTheme 
                      ? 'bg-slate-800 border-slate-700 hover:border-emerald-500' 
                      : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {medicine.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      medicine.source === 'FDA' 
                        ? 'bg-blue-100 text-blue-800' 
                        : medicine.source === 'RxNav'
                        ? 'bg-green-100 text-green-800'
                        : medicine.source === 'local'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {medicine.source}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                    {medicine.description}
                  </p>
                  
                  {medicine.manufacturer && (
                    <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                      Manufacturer: {medicine.manufacturer}
                    </p>
                  )}
                  
                  {medicine.rxcui && (
                    <p className={`text-xs font-mono ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                      RxCUI: {medicine.rxcui}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className={`text-center py-12 sm:py-16 lg:py-20 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
            <div className="mb-4 sm:mb-6">
              <div className="relative mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-medium px-4">
              Loading medicines starting with &quot;{selectedFilter}&quot;...
            </p>
            <p className={`text-xs sm:text-sm lg:text-base mt-2 px-4 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`}>
              Fetching data from FDA and RxNav APIs
            </p>
          </div>
        ) : (
          <div className={`text-center py-12 sm:py-16 lg:py-20 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
            <div className="mb-4 sm:mb-6">
              <div className="relative mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-teal-500 rounded-full animate-bounce"></div>
              </div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-medium px-4">
              No medicines found starting with &quot;{selectedFilter}&quot;
            </p>
            <p className={`text-xs sm:text-sm lg:text-base mt-2 px-4 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`}>
              Try selecting a different letter or check &quot;All&quot; for featured medicines
            </p>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className={`p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkTheme ? 'bg-slate-800' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    Medicine Checker
                  </span>
                  <p className="text-emerald-400 text-xs font-semibold">Drug Verification System</p>
                </div>
              </div>
              
              <p className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                Copyright © Medicine Checker. All Rights Reserved
              </p>
              
              <p className={`text-xs mb-3 sm:mb-4 leading-relaxed ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                Data sources: FDA OpenFDA API, RxNav API, and curated medicine database.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-2 sm:space-x-3">
                {['twitter', 'facebook', 'email'].map((platform, index) => (
                  <div key={platform} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                    isDarkTheme 
                      ? 'bg-slate-600 hover:bg-emerald-600 text-slate-300 hover:text-white' 
                      : 'bg-gray-200 hover:bg-emerald-500 text-gray-600 hover:text-white'
                  }`}>
                    <span className="text-sm sm:text-base">📱</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-gray-800'}`}>
                Help
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') ? (
                      <a 
                        href={link.href} 
                        className={`text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 transform block py-1 ${
                          isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        href={link.href}
                        className={`text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 transform block py-1 ${
                          isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links Section */}
            <div>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-gray-800'}`}>
                Medicine Links
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {medicineLinks.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') ? (
                      <a 
                        href={link.href} 
                        className={`text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 transform block py-1 ${
                          isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        href={link.href}
                        className={`text-xs sm:text-sm transition-all duration-200 hover:translate-x-1 transform block py-1 ${
                          isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Disclaimer */}
          <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t transition-colors duration-300 ${
            isDarkTheme ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Medical Disclaimer: This platform provides information from FDA and RxNav APIs. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;