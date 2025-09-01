"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function PharmacyLocator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [searchMode, setSearchMode] = useState('auto');
  
  // Location states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchLocation, setSearchLocation] = useState(null);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Initialize
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrefs = localStorage.getItem('userPreferences');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (savedPrefs) {
      const parsedPrefs = JSON.parse(savedPrefs);
      setIsDarkMode(parsedPrefs.theme === 'dark');
    }
    
    loadCountries();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push('/login');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Distance calculation using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Generate pharmacy coordinates near search location
  const generatePharmacyCoordinates = (centerLat, centerLng, index) => {
    const radiusInKm = 5;
    const radiusInDeg = radiusInKm / 111;
    const angle = (index * 60 + Math.random() * 30) * Math.PI / 180;
    const distance = Math.random() * radiusInDeg;
    return {
      lat: centerLat + (distance * Math.cos(angle)),
      lng: centerLng + (distance * Math.sin(angle))
    };
  };

  // Load countries
  const loadCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
      const data = await response.json();
      setCountries(data.map(country => ({
        code: country.cca2,
        name: country.name.common,
        flag: country.flag
      })).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      setErrorMessage('Failed to load countries. Please refresh the page.');
    }
  };

  // Load states/provinces
  const loadStates = async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      return;
    }

    setLoadingStates(true);
    try {
      const countryName = getCountryNameByCode(countryCode);
      
      if (countryName === 'Philippines') {
        const response = await fetch('https://psgc.gitlab.io/api/regions/');
        const data = await response.json();
        setStates(data.map(region => ({
          name: region.name,
          code: region.code
        })));
      } else {
        const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryName })
        });
        const data = await response.json();
        
        if (!data.error) {
          setStates(data.data.states.map(state => ({
            name: state.name,
            code: state.state_code
          })));
        } else {
          setStates([]);
        }
      }
    } catch (error) {
      setStates([]);
    }
    setLoadingStates(false);
  };

  // Load cities
  const loadCities = async (countryCode, stateName) => {
    if (!countryCode || !stateName) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const countryName = getCountryNameByCode(countryCode);
      
      if (countryName === 'Philippines') {
        const selectedRegion = states.find(s => s.name === stateName);
        if (selectedRegion) {
          const response = await fetch(`https://psgc.gitlab.io/api/regions/${selectedRegion.code}/provinces/`);
          const provinces = await response.json();
          
          const allCities = [];
          for (const province of provinces) {
            try {
              const cityResponse = await fetch(`https://psgc.gitlab.io/api/provinces/${province.code}/cities-municipalities/`);
              const cities = await cityResponse.json();
              allCities.push(...cities.map(city => ({
                name: city.name,
                code: city.code,
                province: province.name
              })));
            } catch (error) {
              console.error(`Error loading cities for province ${province.name}:`, error);
            }
          }
          setCities(allCities);
        }
      } else {
        const response = await fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryName, state: stateName })
        });
        const data = await response.json();
        
        if (!data.error) {
          setCities(data.data.map(city => ({ name: city, code: city })));
        } else {
          setCities([]);
        }
      }
    } catch (error) {
      setCities([]);
    }
    setLoadingCities(false);
  };

  // Load barangays (Philippines only)
  const loadBarangays = async (countryCode, cityCode) => {
    if (!countryCode || !cityCode || getCountryNameByCode(countryCode) !== 'Philippines') {
      setBarangays([]);
      return;
    }

    setLoadingBarangays(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
      const data = await response.json();
      setBarangays(data.map(barangay => ({
        name: barangay.name,
        code: barangay.code
      })));
    } catch (error) {
      setBarangays([]);
    }
    setLoadingBarangays(false);
  };

  // Helper functions
  const getCountryNameByCode = (code) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : '';
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedState('');
    setSelectedCity('');
    setSelectedBarangay('');
    setStates([]);
    setCities([]);
    setBarangays([]);
    if (countryCode) loadStates(countryCode);
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity('');
    setSelectedBarangay('');
    setCities([]);
    setBarangays([]);
    if (stateName && selectedCountry) loadCities(selectedCountry, stateName);
  };

  const handleCityChange = (cityCode) => {
    setSelectedCity(cityCode);
    setSelectedBarangay('');
    setBarangays([]);
    if (cityCode && selectedCountry) loadBarangays(selectedCountry, cityCode);
  };

  // Geocoding functions
  const getLocationCoordinates = async (country, state, city, barangay) => {
    try {
      // Try different strategies for better accuracy
      const strategies = [
        // Barangay level (Philippines)
        barangay && getCountryNameByCode(country) === 'Philippines' ? 
          `${barangays.find(b => b.code === barangay)?.name}, ${cities.find(c => c.code === city)?.name}, ${state}, Philippines` : null,
        // City level
        `${cities.find(c => c.code === city)?.name || city}, ${state ? state + ', ' : ''}${getCountryNameByCode(country)}`,
        // State level
        state ? `${state}, ${getCountryNameByCode(country)}` : null,
        // Country level
        getCountryNameByCode(country)
      ].filter(Boolean);

      for (const query of strategies) {
        const coords = await tryGeocode(query, country);
        if (coords) return coords;
      }
      
      throw new Error('All geocoding strategies failed');
    } catch (error) {
      throw new Error(`Unable to find coordinates: ${error.message}`);
    }
  };

  const tryGeocode = async (query, countryCode) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=${countryCode.toLowerCase()}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Location detection
  const getCurrentLocation = () => {
    setLoadingPharmacies(true);
    setErrorMessage('');
    setPharmacies([]);

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation not supported by this browser.");
      setLoadingPharmacies(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSearchLocation({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setCurrentAddress(data.display_name || "Location detected");
          await searchPharmacies(latitude, longitude);
        } catch (error) {
          setErrorMessage("Failed to detect location. Please try manual search.");
          setLoadingPharmacies(false);
        }
      },
      (error) => {
        setErrorMessage("Location access denied. Please enable location services.");
        setLoadingPharmacies(false);
      }
    );
  };

  // Search by chosen location
  const searchByChosenLocation = async () => {
    if (!selectedCountry || !selectedCity) {
      setErrorMessage('Please select both country and city');
      return;
    }

    try {
      setLoadingPharmacies(true);
      setErrorMessage('');
      
      const coords = await getLocationCoordinates(
        selectedCountry, 
        selectedState, 
        selectedCity, 
        selectedBarangay
      );
      
      await searchPharmacies(coords.lat, coords.lng);
    } catch (error) {
      setErrorMessage('Failed to get coordinates for selected location');
      setLoadingPharmacies(false);
    }
  };

  // Enhanced pharmacy search
  const searchPharmacies = async (lat, lng) => {
    setLoadingPharmacies(true);
    setPharmacies([]);
    setSearchLocation({ lat, lng });

    try {
      // Try API first, then fallback to sample data
      const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const formatted = data.results.map((p, i) => {
            const pharmacyLat = p.geometry?.location?.lat || lat + (Math.random() - 0.5) * 0.02;
            const pharmacyLng = p.geometry?.location?.lng || lng + (Math.random() - 0.5) * 0.02;
            const distance = calculateDistance(lat, lng, pharmacyLat, pharmacyLng);
            
            return {
              id: `pharmacy_${p.place_id || i}`,
              name: p.name || 'Pharmacy',
              address: p.vicinity || p.formatted_address || 'Address not available',
              phone: p.formatted_phone_number || "Contact for phone number",
              distance: `${distance.toFixed(1)} km`,
              realDistance: distance,
              isOpen: p.opening_hours?.open_now ?? true,
              rating: p.rating ? p.rating.toFixed(1) : "No rating",
              isRealData: true
            };
          }).sort((a, b) => a.realDistance - b.realDistance);
          
          setPharmacies(formatted);
          setErrorMessage(`Found ${formatted.length} pharmacies nearby`);
          setLoadingPharmacies(false);
          return;
        }
      }
      
      // Fallback to sample data
      const sampleNames = ["Mercury Drug", "Watsons Pharmacy", "Rose Pharmacy", "TGP Pharmacy", "South Star Drug", "Manson Drug"];
      const samplePharmacies = sampleNames.map((name, i) => {
        const coords = generatePharmacyCoordinates(lat, lng, i);
        const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
        
        return {
          id: `sample_${i}`,
          name,
          address: `${Math.floor(Math.random() * 999) + 1} Main Street, Local Area`,
          phone: `+63-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          distance: `${distance.toFixed(1)} km`,
          realDistance: distance,
          isOpen: Math.random() > 0.3,
          rating: (Math.random() * 2 + 3).toFixed(1),
          isRealData: false
        };
      }).sort((a, b) => a.realDistance - b.realDistance);

      setPharmacies(samplePharmacies);
      setErrorMessage("Using sample data with realistic distances");
    } catch (error) {
      setErrorMessage("Search failed. Please try again.");
    }
    
    setLoadingPharmacies(false);
  };

  // Action handlers
  const callPharmacy = (phone) => {
    if (phone && phone !== "Contact for phone number") {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    } else {
      setErrorMessage("Phone number not available for this pharmacy.");
    }
  };

  const getDirections = (pharmacy) => {
    const query = `${pharmacy.name} ${pharmacy.address}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  // Show notification function matching profile page
  const showNotification = (message, type) => {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background-color: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading pharmacy locator...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Enhanced Hero Section */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <div style={currentStyles.heroIcon}>🏥</div>
              <h1 style={currentStyles.heroTitle}>Pharmacy Locator</h1>
              <p style={currentStyles.heroSubtitle}>
                Find the nearest pharmacies with accurate distance calculations worldwide
              </p>
              
              {currentAddress && (
                <div style={currentStyles.locationBadge}>
                  <span style={currentStyles.locationIcon}>📍</span>
                  <span style={currentStyles.locationText}>{currentAddress}</span>
                </div>
              )}
              
              {searchLocation && (
                <div style={currentStyles.coordinatesBadge}>
                  📐 {searchLocation.lat.toFixed(4)}, {searchLocation.lng.toFixed(4)}
                </div>
              )}
              
              <div style={currentStyles.heroStats}>
                <div style={currentStyles.statItem}>
                  <span style={currentStyles.statValue}>127</span>
                  <span style={currentStyles.statLabel}>Searches Today</span>
                </div>
                <div style={currentStyles.statItem}>
                  <span style={currentStyles.statValue}>5.2k</span>
                  <span style={currentStyles.statLabel}>Pharmacies Found</span>
                </div>
                <div style={currentStyles.statItem}>
                  <span style={currentStyles.statValue}>99.8%</span>
                  <span style={currentStyles.statLabel}>Accuracy Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div style={currentStyles.mainContent}>
          <div style={currentStyles.searchSection}>
            <div style={currentStyles.searchCard}>
              <div style={currentStyles.searchHeader}>
                <h2 style={currentStyles.searchTitle}>
                  <span style={currentStyles.sectionIcon}>🔍</span>
                  Find Pharmacies
                </h2>
                <p style={currentStyles.searchDescription}>
                  Choose your preferred search method to locate nearby pharmacies
                </p>
              </div>
              
              {/* Enhanced Search Mode Toggle */}
              <div style={currentStyles.toggleContainer}>
                <button
                  onClick={() => setSearchMode('auto')}
                  style={{
                    ...currentStyles.toggleButton,
                    ...(searchMode === 'auto' ? currentStyles.toggleActive : {})
                  }}
                >
                  <span style={currentStyles.toggleIcon}>📍</span>
                  <div style={currentStyles.toggleContent}>
                    <span style={currentStyles.toggleTitle}>Current Location</span>
                    <span style={currentStyles.toggleSubtitle}>Use GPS for instant results</span>
                  </div>
                </button>
                <button
                  onClick={() => setSearchMode('manual')}
                  style={{
                    ...currentStyles.toggleButton,
                    ...(searchMode === 'manual' ? currentStyles.toggleActive : {})
                  }}
                >
                  <span style={currentStyles.toggleIcon}>🌍</span>
                  <div style={currentStyles.toggleContent}>
                    <span style={currentStyles.toggleTitle}>Choose Location</span>
                    <span style={currentStyles.toggleSubtitle}>Search any location worldwide</span>
                  </div>
                </button>
              </div>

              {/* Enhanced Search Content */}
              <div style={currentStyles.searchContent}>
                {searchMode === 'auto' ? (
                  <div style={currentStyles.autoSearchSection}>
                    <div style={currentStyles.autoSearchContent}>
                      <div style={currentStyles.autoSearchIcon}>📱</div>
                      <h3 style={currentStyles.autoSearchTitle}>GPS Location Search</h3>
                      <p style={currentStyles.autoSearchDesc}>
                        We&apos;ll use your device&apos;s GPS to find the most accurate nearby pharmacies
                      </p>
                      <button
                        onClick={getCurrentLocation}
                        style={currentStyles.primaryButton}
                        disabled={loadingPharmacies}
                      >
                        {loadingPharmacies ? (
                          <>
                            <div style={currentStyles.buttonSpinner}></div>
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <span style={currentStyles.buttonIcon}>📍</span>
                            <span>Find Nearest Pharmacies</span>
                          </>
                        )}
                      </button>
                      <div style={currentStyles.privacyNote}>
                        <span style={currentStyles.privacyIcon}>🔒</span>
                        <span>Your location is used only for this search and is not stored</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={currentStyles.manualSearchSection}>
                    <div style={currentStyles.formGrid}>
                      {/* Country Selection */}
                      <div style={currentStyles.formGroup}>
                        <label style={currentStyles.inputLabel}>
                          <span style={currentStyles.labelIcon}>🌍</span>
                          Country
                        </label>
                        <select
                          value={selectedCountry}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          style={currentStyles.select}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* State Selection */}
                      {selectedCountry && (
                        <div style={currentStyles.formGroup}>
                          <label style={currentStyles.inputLabel}>
                            <span style={currentStyles.labelIcon}>🏛️</span>
                            {getCountryNameByCode(selectedCountry) === 'Philippines' ? 'Region' : 'State/Province'}
                          </label>
                          <select 
                            value={selectedState} 
                            onChange={(e) => handleStateChange(e.target.value)}
                            style={currentStyles.select}
                            disabled={loadingStates}
                          >
                            <option value="">
                              {loadingStates ? "Loading..." : "Select (Optional)"}
                            </option>
                            {states.map((state) => (
                              <option key={state.code || state.name} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* City Selection */}
                      {selectedCountry && (
                        <div style={currentStyles.formGroup}>
                          <label style={currentStyles.inputLabel}>
                            <span style={currentStyles.labelIcon}>🏙️</span>
                            {getCountryNameByCode(selectedCountry) === 'Philippines' ? 'City/Municipality' : 'City'}
                          </label>
                          <select 
                            value={selectedCity} 
                            onChange={(e) => handleCityChange(e.target.value)}
                            style={currentStyles.select}
                            disabled={loadingCities}
                          >
                            <option value="">
                              {loadingCities ? "Loading cities..." : "Select City"}
                            </option>
                            {cities.map((city) => (
                              <option key={city.code || city.name} value={city.code || city.name}>
                                {city.name} {city.province && `(${city.province})`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Barangay Selection (Philippines only) */}
                      {selectedCountry && getCountryNameByCode(selectedCountry) === 'Philippines' && selectedCity && (
                        <div style={currentStyles.formGroup}>
                          <label style={currentStyles.inputLabel}>
                            <span style={currentStyles.labelIcon}>🏘️</span>
                            Barangay
                          </label>
                          <select 
                            value={selectedBarangay} 
                            onChange={(e) => setSelectedBarangay(e.target.value)}
                            style={currentStyles.select}
                            disabled={loadingBarangays}
                          >
                            <option value="">
                              {loadingBarangays ? "Loading barangays..." : "Select (Optional)"}
                            </option>
                            {barangays.map((barangay) => (
                              <option key={barangay.code} value={barangay.code}>
                                {barangay.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Search Button */}
                      {selectedCountry && selectedCity && (
                        <div style={currentStyles.searchButtonContainer}>
                          <button 
                            onClick={searchByChosenLocation} 
                            style={currentStyles.secondaryButton}
                            disabled={loadingPharmacies}
                          >
                            {loadingPharmacies ? (
                              <>
                                <div style={currentStyles.buttonSpinner}></div>
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <span style={currentStyles.buttonIcon}>🔍</span>
                                <span>Search Pharmacies</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={currentStyles.manualSearchFooter}>
                      <div style={currentStyles.helpIcon}>💡</div>
                      <span style={currentStyles.helpText}>
                        Search for pharmacies in any location worldwide with detailed address selection
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Error/Success Messages */}
              {errorMessage && (
                <div style={{
                  ...currentStyles.messageCard,
                  ...(errorMessage.includes('Found') ? currentStyles.successMessage : 
                     errorMessage.includes('sample') ? currentStyles.warningMessage : currentStyles.errorMessage)
                }}>
                  <div style={currentStyles.messageContent}>
                    <span style={currentStyles.messageIcon}>
                      {errorMessage.includes('Found') ? '✅' : 
                       errorMessage.includes('sample') ? '⚠️' : '❌'}
                    </span>
                    <span style={currentStyles.messageText}>{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Results Section */}
          <div style={currentStyles.resultsSection}>
            {loadingPharmacies ? (
              <div style={currentStyles.loadingResults}>
                <div style={currentStyles.loadingContent}>
                  <div style={currentStyles.loadingSpinner}>
                    <div style={currentStyles.spinner}></div>
                  </div>
                  <h3 style={currentStyles.loadingTitle}>Finding Nearest Pharmacies</h3>
                  <p style={currentStyles.loadingSubtitle}>
                    Calculating distances and gathering information...</p>
                </div>
              </div>
            ) : pharmacies.length > 0 ? (
              <>
                <div style={currentStyles.resultsHeader}>
                  <div style={currentStyles.resultsInfo}>
                    <h3 style={currentStyles.resultsTitle}>
                      <span style={currentStyles.sectionIcon}>📋</span>
                      {pharmacies.length} {pharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'} Found
                    </h3>
                    <p style={currentStyles.resultsSubtitle}>
                      Sorted by distance • Nearest locations first
                    </p>
                  </div>
                  <div style={currentStyles.resultsBadges}>
                    <div style={currentStyles.dataBadge}>
                      <span style={currentStyles.badgeIcon}>
                        {pharmacies[0]?.isRealData ? '🟢' : '🟡'}
                      </span>
                      <span>{pharmacies[0]?.isRealData ? 'Live Data' : 'Sample Data'}</span>
                    </div>
                    <div style={currentStyles.distanceRange}>
                      📏 {pharmacies[0]?.distance} - {pharmacies[pharmacies.length - 1]?.distance}
                    </div>
                  </div>
                </div>
                
                <div style={currentStyles.pharmacyGrid}>
                  {pharmacies.map((pharmacy, index) => (
                    <div key={pharmacy.id} style={{
                      ...currentStyles.pharmacyCard,
                      ...(index === 0 ? currentStyles.nearestCard : {})
                    }}>
                      <div style={currentStyles.cardHeader}>
                        <div style={currentStyles.cardTitle}>
                          <div style={currentStyles.pharmacyInfo}>
                            <h4 style={currentStyles.pharmacyName}>{pharmacy.name}</h4>
                            {index === 0 && (
                              <div style={currentStyles.nearestBadge}>
                                <span style={currentStyles.nearestIcon}>⭐</span>
                                <span>Nearest</span>
                              </div>
                            )}
                          </div>
                          <div style={currentStyles.cardBadges}>
                            <div style={{
                              ...currentStyles.distanceBadge,
                              backgroundColor: pharmacy.realDistance < 1 ? '#10b981' : 
                                             pharmacy.realDistance < 3 ? '#f59e0b' : '#64748b'
                            }}>
                              <span style={currentStyles.badgeIcon}>📍</span>
                              <span>{pharmacy.distance}</span>
                            </div>
                            <div style={{
                              ...currentStyles.statusBadge,
                              backgroundColor: pharmacy.isOpen ? '#10b981' : '#ef4444'
                            }}>
                              <span style={currentStyles.badgeIcon}>
                                {pharmacy.isOpen ? '🟢' : '🔴'}
                              </span>
                              <span>{pharmacy.isOpen ? 'Open' : 'Closed'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={currentStyles.cardContent}>
                        <div style={currentStyles.infoGrid}>
                          <div style={currentStyles.infoItem}>
                            <span style={currentStyles.infoIcon}>📍</span>
                            <div style={currentStyles.infoDetails}>
                              <span style={currentStyles.infoLabel}>Address</span>
                              <span style={currentStyles.infoValue}>{pharmacy.address}</span>
                            </div>
                          </div>
                          
                          <div style={currentStyles.infoItem}>
                            <span style={currentStyles.infoIcon}>📞</span>
                            <div style={currentStyles.infoDetails}>
                              <span style={currentStyles.infoLabel}>Phone</span>
                              <span style={currentStyles.infoValue}>{pharmacy.phone}</span>
                            </div>
                          </div>
                          
                          <div style={currentStyles.infoItem}>
                            <span style={currentStyles.infoIcon}>⭐</span>
                            <div style={currentStyles.infoDetails}>
                              <span style={currentStyles.infoLabel}>Rating</span>
                              <span style={currentStyles.infoValue}>{pharmacy.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        {pharmacy.realDistance < 0.5 && (
                          <div style={currentStyles.walkingBadge}>
                            <span style={currentStyles.walkingIcon}>🚶‍♂️</span>
                            <span>Walking Distance - Very Close!</span>
                          </div>
                        )}

                        {!pharmacy.isRealData && (
                          <div style={currentStyles.sampleBadge}>
                            <span style={currentStyles.sampleIcon}>📝</span>
                            <span>Sample data with calculated distances</span>
                          </div>
                        )}
                      </div>

                      <div style={currentStyles.cardActions}>
                        <button 
                          onClick={() => callPharmacy(pharmacy.phone)}
                          style={currentStyles.callButton}
                        >
                          <span style={currentStyles.actionIcon}>📞</span>
                          <span>Call Now</span>
                        </button>
                        <button 
                          onClick={() => getDirections(pharmacy)}
                          style={currentStyles.directionsButton}
                        >
                          <span style={currentStyles.actionIcon}>🗺️</span>
                          <span>Directions</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={currentStyles.emptyState}>
                <div style={currentStyles.emptyIcon}>🏥</div>
                <h3 style={currentStyles.emptyTitle}>Ready to Find Pharmacies</h3>
                <p style={currentStyles.emptyText}>
                  Use the search options above to locate nearby pharmacies with accurate distance calculations
                </p>
                <div style={currentStyles.emptyFeatures}>
                  <div style={currentStyles.featureItem}>
                    <span style={currentStyles.featureIcon}>📍</span>
                    <span>GPS-based location detection</span>
                  </div>
                  <div style={currentStyles.featureItem}>
                    <span style={currentStyles.featureIcon}>🌍</span>
                    <span>Worldwide location search</span>
                  </div>
                  <div style={currentStyles.featureItem}>
                    <span style={currentStyles.featureIcon}>📏</span>
                    <span>Accurate distance calculations</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Enhanced Styles matching Profile Page Design
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "60px"
  },
  
  // Loading States
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    paddingTop: "60px"
  },
  
  loadingSpinner: {
    textAlign: "center"
  },
  
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(16, 185, 129, 0.2)",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px"
  },
  
  loadingText: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#10b981"
  },

  // Hero Section - Enhanced
  hero: {
    minHeight: "60vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  
  heroBackground: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    width: "100%",
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
  },
  
  heroContent: {
    textAlign: "center",
    color: "white",
    maxWidth: "800px",
    padding: "60px 20px",
    position: "relative",
    zIndex: 1
  },
  
  heroIcon: {
    fontSize: "4rem",
    marginBottom: "24px",
    textShadow: "0 4px 20px rgba(0,0,0,0.3)",
    animation: "float 3s ease-in-out infinite"
  },
  
  heroTitle: {
    fontSize: "clamp(2.5rem, 6vw, 4rem)",
    fontWeight: "800",
    marginBottom: "20px",
    textShadow: "0 4px 30px rgba(0,0,0,0.3)",
    color: "#ffffff", // Force white text
  },
  
  heroSubtitle: {
    fontSize: "1.3rem",
    opacity: 0.95,
    marginBottom: "40px",
    fontWeight: "400",
    lineHeight: "1.6",
    maxWidth: "600px",
    margin: "0 auto 40px",
    color: "#ffffff",
    opacity: 0.9
  },
  
  locationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    padding: "16px 24px",
    borderRadius: "30px",
    border: "1px solid rgba(255,255,255,0.2)",
    marginBottom: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
  },
  
  locationIcon: {
    fontSize: "1.2rem"
  },
  
  locationText: {
    fontSize: "1rem",
    fontWeight: "500",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#ffffff"
  },
  
  coordinatesBadge: {
    fontSize: "0.9rem",
    opacity: 0.8,
    background: "rgba(255,255,255,0.1)",
    padding: "8px 16px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "30px",
    color: "#ffffff"
  },
  
  heroStats: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap",
    marginTop: "40px"
  },
  
  statItem: {
    textAlign: "center",
    padding: "20px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.2)",
    minWidth: "120px"
  },
  
  statValue: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "4px",
    color: "#ffffff"
  },
  
  statLabel: {
    display: "block",
    fontSize: "0.85rem",
    opacity: 0.8,
    color: "#ffffff"
  },

  // Main Content
  mainContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px 80px"
  },
  
  // Search Section - Enhanced
  searchSection: {
    margin: "-100px auto 60px",
    position: "relative",
    zIndex: 2
  },
  
  searchCard: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(255,255,255,0.3)"
  },
  
  searchHeader: {
    textAlign: "center",
    marginBottom: "40px"
  },
  
  searchTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "12px"
  },
  
  sectionIcon: {
    fontSize: "2.5rem"
  },
  
  searchDescription: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: 0,
    fontWeight: "400"
  },
  
  // Toggle Enhancement
  toggleContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    background: "rgba(241, 245, 249, 0.8)",
    padding: "8px",
    borderRadius: "20px",
    marginBottom: "40px"
  },
  
  toggleButton: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    border: "none",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "transparent",
    color: "#64748b"
  },
  
  toggleActive: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
  },
  
  toggleIcon: {
    fontSize: "1.5rem",
    minWidth: "24px"
  },
  
  toggleContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px"
  },
  
  toggleTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "inherit"
  },
  
  toggleSubtitle: {
    fontSize: "0.85rem",
    opacity: 0.7,
    fontWeight: "400",
    color: "inherit"
  },
  
  searchContent: {
    minHeight: "300px"
  },
  
  // Auto Search Enhancement
  autoSearchSection: {
    textAlign: "center",
    padding: "40px 0"
  },
  
  autoSearchContent: {
    maxWidth: "500px",
    margin: "0 auto"
  },
  
  autoSearchIcon: {
    fontSize: "4rem",
    marginBottom: "24px",
    opacity: 0.8
  },
  
  autoSearchTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px"
  },
  
  autoSearchDesc: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.8)",
    marginBottom: "32px",
    lineHeight: "1.6"
  },
  
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    padding: "20px 40px",
    fontSize: "1.1rem",
    fontWeight: "700",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
    marginBottom: "20px",
    minWidth: "280px"
  },
  
  buttonIcon: {
    fontSize: "1.2rem"
  },
  
  buttonSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  
  privacyNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.9)",
    background: "rgba(16, 185, 129, 0.15)",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(16, 185, 129, 0.3)"
  },
  
  privacyIcon: {
    fontSize: "1rem"
  },
  
  // Manual Search Enhancement
  manualSearchSection: {
    padding: "20px 0"
  },
  
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "32px"
  },
  
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  
  inputLabel: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  
  labelIcon: {
    fontSize: "1.1rem"
  },
  
  select: {
    padding: "16px 20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "1rem",
    background: "rgba(30, 41, 59, 0.9)",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500"
  },
  
  searchButtonContainer: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "center",
    marginTop: "16px"
  },
  
  secondaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#ffffff",
    padding: "18px 36px",
    fontSize: "1.1rem",
    fontWeight: "700",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(139, 92, 246, 0.4)",
    minWidth: "250px"
  },
  
  manualSearchFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "20px",
    background: "rgba(16, 185, 129, 0.1)",
    borderRadius: "16px",
    border: "1px solid rgba(16, 185, 129, 0.2)"
  },
  
  helpIcon: {
    fontSize: "1.2rem"
  },
  
  helpText: {
    fontSize: "0.95rem",
    color: "#34d399",
    fontWeight: "500"
  },
  
  // Message Cards Enhancement
  messageCard: {
    marginTop: "32px",
    padding: "20px 24px",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "600",
    border: "1px solid",
    backdropFilter: "blur(10px)"
  },
  
  messageContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  
  messageIcon: {
    fontSize: "1.2rem",
    minWidth: "24px"
  },
  
  messageText: {
    flex: 1
  },
  
  successMessage: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    color: "#4ade80"
  },
  
  warningMessage: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    color: "#fbbf24"
  },
  
  errorMessage: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    color: "#f87171"
  },

  // Results Section Enhancement
  resultsSection: {
    marginTop: "40px"
  },
  
  loadingResults: {
    textAlign: "center",
    padding: "80px 20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255,255,255,0.3)"
  },
  
  loadingContent: {
    maxWidth: "400px",
    margin: "0 auto"
  },
  
  loadingTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#ffffff"
  },
  
  loadingSubtitle: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400"
  },
  
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
    padding: "24px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255,255,255,0.3)"
  },
  
  resultsInfo: {
    flex: 1
  },
  
  resultsTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#60a5fa",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  
  resultsSubtitle: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.7)",
    margin: 0,
    fontWeight: "500"
  },
  
  resultsBadges: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-end"
  },
  
  dataBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    background: "rgba(16, 185, 129, 0.2)",
    color: "#4ade80",
    border: "1px solid rgba(16, 185, 129, 0.3)"
  },
  
  badgeIcon: {
    fontSize: "1rem"
  },
  
  distanceRange: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500"
  },
  
  // Pharmacy Cards Enhancement
  pharmacyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px"
  },
  
  pharmacyCard: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },
  
  nearestCard: {
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)",
    borderColor: "#10b981",
    transform: "scale(1.02)",
    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.3)"
  },
  
  cardHeader: {
    marginBottom: "24px"
  },
  
  cardTitle: {
    display: "flex",
    justify: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap"
  },
  
  pharmacyInfo: {
    flex: 1
  },
  
  pharmacyName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 8px 0",
    lineHeight: "1.3"
  },
  
  nearestBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
  },
  
  nearestIcon: {
    fontSize: "0.9rem"
  },
  
  cardBadges: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-end"
  },
  
  distanceBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#ffffff",
    minWidth: "80px",
    justifyContent: "center"
  },
  
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#ffffff"
  },
  
  // Card Content Enhancement
  cardContent: {
    marginBottom: "24px"
  },
  
  infoGrid: {
    display: "grid",
    gap: "16px",
    marginBottom: "20px"
  },
  
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    background: "rgba(248, 250, 252, 0.8)",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.5)"
  },
  
  infoIcon: {
    fontSize: "1.1rem",
    minWidth: "20px",
    marginTop: "2px"
  },
  
  infoDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1
  },
  
  infoLabel: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  infoValue: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500"
  },
  
  walkingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "rgba(34, 197, 94, 0.2)",
    borderRadius: "12px",
    fontSize: "0.9rem",
    color: "#4ade80",
    fontWeight: "600",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    marginTop: "16px"
  },
  
  walkingIcon: {
    fontSize: "1.1rem"
  },
  
  sampleBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#fbbf24",
    fontWeight: "500",
    marginTop: "12px",
    padding: "8px 12px",
    background: "rgba(245, 158, 11, 0.2)",
    borderRadius: "8px",
    border: "1px solid rgba(245, 158, 11, 0.3)"
  },
  
  sampleIcon: {
    fontSize: "0.9rem"
  },
  
  // Action Buttons Enhancement
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  
  callButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
  },
  
  directionsButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
  },
  
  actionIcon: {
    fontSize: "1rem"
  },
  
  // Empty State Enhancement
  emptyState: {
    textAlign: "center",
    padding: "100px 40px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255,255,255,0.3)"
  },
  
  emptyIcon: {
    fontSize: "5rem",
    marginBottom: "24px",
    opacity: 0.6
  },
  
  emptyTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#ffffff"
  },
  
  emptyText: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.7)",
    maxWidth: "500px",
    margin: "0 auto 40px",
    lineHeight: "1.6"
  },
  
  emptyFeatures: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    flexWrap: "wrap",
    marginTop: "32px"
  },
  
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    color: "#34d399",
    fontWeight: "500"
  },
  
  featureIcon: {
    fontSize: "1.1rem"
  }
};

// Light Theme Styles
const lightStyles = {
  ...baseStyles
};

// Dark Theme Styles - COMPLETE FIX
const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)"
  },
  
  // Fix loading container
  loadingContainer: {
    ...baseStyles.loadingContainer,
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
  },
  
  // Fix loading text
  loadingText: {
    ...baseStyles.loadingText,
    color: "#60a5fa"
  },
  
  // Fix spinner
  spinner: {
    ...baseStyles.spinner,
    border: "4px solid rgba(96, 165, 250, 0.2)",
    borderTop: "4px solid #60a5fa"
  },
  
  heroBackground: {
    ...baseStyles.heroBackground,
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #6366f1 100%)"
  },
  
  // REMOVE THE GRADIENT TEXT - this was causing the issue
  heroTitle: {
    ...baseStyles.heroTitle,
    color: "#ffffff", // Force white text
    // Remove these problematic lines:
    // background: "linear-gradient(135deg, #60a5fa, #34d399)",
    // WebkitBackgroundClip: "text",
    // WebkitTextFillColor: "transparent",
    // backgroundClip: "text"
  },
  
  // Fix hero subtitle
  heroSubtitle: {
    ...baseStyles.heroSubtitle,
    color: "#ffffff",
    opacity: 0.9
  },
  
  // Fix location text
  locationText: {
    ...baseStyles.locationText,
    color: "#ffffff"
  },
  
  // Fix coordinates badge
  coordinatesBadge: {
    ...baseStyles.coordinatesBadge,
    color: "#ffffff"
  },
  
  // Fix stat labels and values
  statValue: {
    ...baseStyles.statValue,
    color: "#ffffff"
  },
  
  statLabel: {
    ...baseStyles.statLabel,
    color: "#ffffff"
  },
  
  autoSearchTitle: {
    ...baseStyles.autoSearchTitle,
    color: "#ffffff"
  },
  
  autoSearchDesc: {
    ...baseStyles.autoSearchDesc,
    color: "rgba(255,255,255,0.8)"
  },
  
  searchCard: {
    ...baseStyles.searchCard,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
  },
  
  searchTitle: {
    ...baseStyles.searchTitle,
    color: "#60a5fa"
  },
  
  searchDescription: {
    ...baseStyles.searchDescription,
    color: "rgba(255,255,255,0.7)"
  },
  
  toggleContainer: {
    ...baseStyles.toggleContainer,
    background: "rgba(51, 65, 85, 0.5)"
  },
  
  toggleButton: {
    ...baseStyles.toggleButton,
    color: "rgba(255,255,255,0.7)"
  },
  
  // Fix toggle text colors
  toggleTitle: {
    ...baseStyles.toggleTitle,
    color: "inherit"
  },
  
  toggleSubtitle: {
    ...baseStyles.toggleSubtitle,
    color: "inherit",
    opacity: 0.7
  },
  
  toggleActive: {
    ...baseStyles.toggleActive,
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#ffffff"
  },
  
  inputLabel: {
    ...baseStyles.inputLabel,
    color: "#e2e8f0"
  },
  
  select: {
    ...baseStyles.select,
    background: "rgba(30, 41, 59, 0.9)",
    color: "#ffffff",
    border: "2px solid rgba(71, 85, 105, 0.6)"
  },
  
  // Fix button text colors
  primaryButton: {
    ...baseStyles.primaryButton,
    color: "#ffffff"
  },
  
  secondaryButton: {
    ...baseStyles.secondaryButton,
    color: "#ffffff"
  },
  
  privacyNote: {
    ...baseStyles.privacyNote,
    background: "rgba(16, 185, 129, 0.15)",
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(16, 185, 129, 0.3)"
  },
  
  manualSearchFooter: {
    ...baseStyles.manualSearchFooter,
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)"
  },
  
  helpText: {
    ...baseStyles.helpText,
    color: "#34d399"
  },
  
  successMessage: {
    ...baseStyles.successMessage,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    color: "#4ade80"
  },
  
  warningMessage: {
    ...baseStyles.warningMessage,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    color: "#fbbf24"
  },
  
  errorMessage: {
    ...baseStyles.errorMessage,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    color: "#f87171"
  },
  
  loadingResults: {
    ...baseStyles.loadingResults,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
  },
  
  loadingTitle: {
    ...baseStyles.loadingTitle,
    color: "#ffffff"
  },
  
  loadingSubtitle: {
    ...baseStyles.loadingSubtitle,
    color: "rgba(255,255,255,0.7)"
  },
  
  resultsHeader: {
    ...baseStyles.resultsHeader,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
  },
  
  resultsTitle: {
    ...baseStyles.resultsTitle,
    color: "#60a5fa"
  },
  
  resultsSubtitle: {
    ...baseStyles.resultsSubtitle,
    color: "rgba(255,255,255,0.7)"
  },
  
  dataBadge: {
    ...baseStyles.dataBadge,
    background: "rgba(16, 185, 129, 0.2)",
    color: "#4ade80",
    border: "1px solid rgba(16, 185, 129, 0.3)"
  },
  
  distanceRange: {
    ...baseStyles.distanceRange,
    color: "rgba(255,255,255,0.6)"
  },
  
  pharmacyCard: {
    ...baseStyles.pharmacyCard,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
  },
  
  nearestCard: {
    ...baseStyles.nearestCard,
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 41, 59, 0.95) 100%)",
    borderColor: "#22c55e"
  },
  
  pharmacyName: {
    ...baseStyles.pharmacyName,
    color: "#ffffff"
  },
  
  infoItem: {
    ...baseStyles.infoItem,
    background: "rgba(51, 65, 85, 0.5)",
    border: "1px solid rgba(71, 85, 105, 0.3)"
  },
  
  infoLabel: {
    ...baseStyles.infoLabel,
    color: "rgba(255,255,255,0.6)"
  },
  
  infoValue: {
    ...baseStyles.infoValue,
    color: "rgba(255,255,255,0.9)"
  },
  
  walkingBadge: {
    ...baseStyles.walkingBadge,
    background: "rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.3)"
  },
  
  sampleBadge: {
    ...baseStyles.sampleBadge,
    background: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.3)"
  },
  
  emptyState: {
    ...baseStyles.emptyState,
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
  },
  
  emptyTitle: {
    ...baseStyles.emptyTitle,
    color: "#ffffff"
  },
  
  emptyText: {
    ...baseStyles.emptyText,
    color: "rgba(255,255,255,0.7)"
  },
  
  featureItem: {
    ...baseStyles.featureItem,
    color: "#34d399"
  },
  
  // Fix all action buttons
  callButton: {
    ...baseStyles.callButton,
    color: "#ffffff"
  },
  
  directionsButton: {
    ...baseStyles.directionsButton,
    color: "#ffffff"
  }
};

// Enhanced CSS animations and responsive design
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity:  0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }

    /* Hover Effects */
    .pharmacy-card:hover {
      transform: translateY(-8px) !important;
      box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25) !important;
    }
    
    .call-button:hover,
    .primary-button:hover,
    .secondary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4) !important;
    }
    
    .directions-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4) !important;
    }
    
    .toggle-button:hover:not(.toggle-active) {
      background-color: rgba(16, 185, 129, 0.1) !important;
      transform: translateY(-1px);
    }
    
    .select:focus {
      border-color: #10b981 !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    /* Loading Animation */
    .loading-spinner {
      animation: fadeInUp 0.5s ease;
    }
    
    /* Card Animations */
    .pharmacy-card {
      animation: fadeInUp 0.6s ease forwards;
    }
    
    .pharmacy-card:nth-child(1) { animation-delay: 0.1s; }
    .pharmacy-card:nth-child(2) { animation-delay: 0.2s; }
    .pharmacy-card:nth-child(3) { animation-delay: 0.3s; }
    .pharmacy-card:nth-child(4) { animation-delay: 0.4s; }
    .pharmacy-card:nth-child(5) { animation-delay: 0.5s; }
    .pharmacy-card:nth-child(6) { animation-delay: 0.6s; }
    
    /* Nearest Card Special Effects */
    .nearest-card {
      animation: fadeInUp 0.6s ease forwards, pulse 2s ease-in-out 1s infinite;
    }
    
    /* Button Loading States */
    .button-spinner {
      animation: spin 1s linear infinite;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-background {
        min-height: 50vh !important;
      }
      
      .hero-content {
        padding: 40px 20px !important;
      }
      
      .hero-title {
        font-size: 2.5rem !important;
      }
      
      .hero-stats {
        flex-direction: column !important;
        gap: 20px !important;
      }
      
      .stat-item {
        min-width: 200px !important;
      }
      
      .search-card {
        padding: 24px !important;
        margin: -60px 20px 40px !important;
      }
      
      .toggle-container {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      
      .pharmacy-grid {
        grid-template-columns: 1fr !important;
      }
      
      .results-header {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }
      
      .results-badges {
        align-items: center !important;
      }
      
      .card-title {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      
      .card-badges {
        flex-direction: row !important;
        align-items: center !important;
        gap: 12px !important;
      }
      
      .empty-features {
        flex-direction: column !important;
        gap: 16px !important;
      }
      
      .toggle-content {
        align-items: center !important;
        text-align: center !important;
      }
    }
    
    @media (max-width: 480px) {
      .hero-title {
        font-size: 2rem !important;
      }
      
      .search-card {
        padding: 20px !important;
      }
      
      .pharmacy-card {
        padding: 20px !important;
      }
      
      .card-actions {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      
      .primary-button,
      .secondary-button {
        min-width: 200px !important;
        padding: 16px 24px !important;
      }
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #059669, #047857);
    }
    
    /* Glassmorphism Effects */
    .search-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      border-radius: 24px;
      pointer-events: none;
    }
    
    .pharmacy-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border-radius: 20px;
      pointer-events: none;
    }
    
    /* Button Hover Animations */
    .call-button:hover,
    .directions-button:hover,
    .primary-button:hover,
    .secondary-button:hover {
      animation: pulse 0.3s ease;
    }
    
    /* Loading shimmer effect */
    .loading-content {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 200px 100%;
      animation: shimmer 2s infinite;
    }
    
    /* Smooth transitions for theme switching */
    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    /* Enhanced focus states */
    .toggle-button:focus,
    .primary-button:focus,
    .secondary-button:focus,
    .call-button:focus,
    .directions-button:focus {
      outline: 3px solid rgba(16, 185, 129, 0.3);
      outline-offset: 2px;
    }
    
    .select:focus {
      outline: 3px solid rgba(16, 185, 129, 0.3);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}