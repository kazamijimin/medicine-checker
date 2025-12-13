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
  const [searchMode, setSearchMode] = useState('auto'); // 'auto' or 'manual'
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [dataSource, setDataSource] = useState(''); // Track if data is real or fallback

  const router = useRouter();

  const turkishCities = [
    'Ankara', 'Istanbul', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Mersin', 'Diyarbakir', 'Kayseri', 'Eskisehir', 'Urfa'
  ];

  const districts = {
    'Ankara': ['Cankaya', 'Kecioren', 'Yenimahalle', 'Mamak', 'Sincan'],
    'Istanbul': ['Kadikoy', 'Besiktas', 'Sisli', 'Fatih', 'Beyoglu'],
    'Izmir': ['Konak', 'Bornova', 'Karsiyaka', 'Buca', 'Gaziemir']
  };

  const locationData = {
    provinces: ['Metro Manila', 'Laguna', 'Cavite', 'Rizal', 'Bulacan', 'Batangas'],
    cities: {
      'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Muntinlupa'],
      'Laguna': ['Santa Rosa', 'Santa Cruz', 'Biñan', 'San Pedro', 'Calamba', 'Los Baños'],
      'Cavite': ['Imus', 'Dasmariñas', 'Bacoor', 'General Trias', 'Kawit', 'Noveleta']
    },
    barangays: {
      'Santa Cruz': ['Poblacion', 'Alipit', 'Bagumbayan', 'Bubukal', 'Calios', 'Duhat'],
      'Santa Rosa': ['Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita', 'Don Jose'],
      'Imus': ['Alapan I-A', 'Alapan I-B', 'Anabu I-A', 'Anabu I-B', 'Bayan Luma I']
    }
  };

  const coordinates = {
    // METRO MANILA
    'Manila, Metro Manila': { lat: 14.5995, lng: 120.9842 },
    'Quezon City, Metro Manila': { lat: 14.6760, lng: 121.0437 },
    'Makati, Metro Manila': { lat: 14.5547, lng: 121.0244 },
    'Pasig, Metro Manila': { lat: 14.5764, lng: 121.0851 },
    'Taguig, Metro Manila': { lat: 14.5176, lng: 121.0509 },
    'Muntinlupa, Metro Manila': { lat: 14.3753, lng: 121.0399 },

    // LAGUNA - Including your area!
    'Santa Rosa, Laguna': { lat: 14.3119, lng: 121.1148 },
    'Santa Cruz, Laguna': { lat: 14.2867, lng: 121.4169 }, // ✅ Your area!
    'Biñan, Laguna': { lat: 14.3350, lng: 121.0831 },
    'San Pedro, Laguna': { lat: 14.3583, lng: 121.0575 },
    'Calamba, Laguna': { lat: 14.2117, lng: 121.1653 },
    'Los Baños, Laguna': { lat: 14.1650, lng: 121.2400 },

    // CAVITE
    'Imus, Cavite': { lat: 14.4297, lng: 120.9370 },
    'Dasmariñas, Cavite': { lat: 14.3294, lng: 120.9367 },
    'Bacoor, Cavite': { lat: 14.4593, lng: 120.9516 },
    'General Trias, Cavite': { lat: 14.3875, lng: 120.8800 },
    'Kawit, Cavite': { lat: 14.4471, lng: 120.9025 },
    'Noveleta, Cavite': { lat: 14.4256, lng: 120.8767 },

    // RIZAL
    'Antipolo, Rizal': { lat: 14.5932, lng: 121.1815 },
    'Cainta, Rizal': { lat: 14.5786, lng: 121.1222 },

    // BULACAN
    'Malolos, Bulacan': { lat: 14.8433, lng: 120.8113 },
    'San Jose del Monte, Bulacan': { lat: 14.8136, lng: 121.0458 },

    // BATANGAS
    'Batangas City, Batangas': { lat: 13.7565, lng: 121.0583 },
    'Lipa, Batangas': { lat: 13.9411, lng: 121.1653 }
  };

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push('/login');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Detect location and fetch pharmacies
  const getCurrentLocation = () => {
    setLoadingPharmacies(true);
    setErrorMessage('');
    setPharmacies([]);
    setDataSource('');

    if (!navigator.geolocation) {
      setErrorMessage("❌ Geolocation not supported by this browser.");
      setLoadingPharmacies(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          // Get address from coordinates
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const country = geoData.address?.country_code?.toUpperCase();
          setCurrentAddress(geoData.display_name || "Location detected");

          if (country === "PH") {
            setSelectedCountry("Philippines");
            await searchPhilippinesPharmacies(latitude, longitude);
          } else if (country === "TR") {
            setSelectedCountry("Turkey");
            // For Turkey, we need city selection first
            setErrorMessage("🇹🇷 Turkey detected. Please select a city to find duty pharmacies.");
            setLoadingPharmacies(false);
          } else {
            setSelectedCountry("Philippines");
            setErrorMessage("🌍 Location detected outside PH/TR. Searching for Philippines pharmacies...");
            await searchPhilippinesPharmacies(latitude, longitude);
          }
        } catch (error) {
          setErrorMessage("❌ Failed to detect location. Please try manual search.");
          setLoadingPharmacies(false);
        }
      },
      (error) => {
        let errorMsg = "❌ ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Location access denied. Please enable location services and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
          default:
            errorMsg += "Unknown location error.";
        }
        setErrorMessage(errorMsg);
        setLoadingPharmacies(false);
      }
    );
  };

  // Add helper to compute distance in km
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Replace the Philippines search to call OSM (free, real data)
  const searchPhilippinesPharmacies = async (lat, lng) => {
    setLoadingPharmacies(true);
    setErrorMessage('');
    setPharmacies([]);

    try {
      const res = await fetch(`/api/osm-pharmacies?lat=${lat}&lng=${lng}&radius=2500`);
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const formatted = data.results.map((p, i) => {
          const dist = haversineKm(lat, lng, p.lat, p.lng);
          return {
            id: `osm_${p.id || i}`,
            name: p.name || 'Pharmacy',
            address: p.address || 'Address not available',
            phone: p.phone || 'Phone not available',
            city: 'Philippines',
            type: 'Pharmacy',
            distance: `${dist.toFixed(1)} km`,
            isOpen: true,
            hours: p.opening_hours ? p.opening_hours : 'Hours not available',
            rating: '—',
            services: ['Prescription Medicines', 'Health Products'],
            isRealData: true,
            lat: p.lat,
            lng: p.lng
          };
        }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        setPharmacies(formatted);
        setDataSource('real');
        setErrorMessage(`✅ Found ${formatted.length} pharmacies near you (OpenStreetMap)`);
      } else {
        setErrorMessage('⚠️ No pharmacies found in this area.');
      }
    } catch (error) {
      console.error('OSM API Error:', error);
      setErrorMessage(`❌ Failed to fetch pharmacy data: ${error.message}`);
    }

    setLoadingPharmacies(false);
  };

  // API call for Turkey (CollectAPI)
  const searchTurkeyPharmacies = async (city, district) => {
    if (!city) {
      setErrorMessage("❌ Please select a city first.");
      return;
    }

    setLoadingPharmacies(true);
    setErrorMessage('');
    setPharmacies([]);

    try {
      console.log(`🇹🇷 Searching Turkey pharmacies in: ${city}, ${district || 'All districts'}`);
      
      const res = await fetch(`/api/turkeyPharmacies?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district || '')}`);
      
      if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('Turkey API Response:', data);

      if (data.success && data.result && data.result.length > 0) {
        const formatted = data.result.map((p, i) => ({
          id: `tr_${i}`,
          name: p.name || 'Eczane',
          address: p.address || `${district || 'Merkez'}, ${city}`,
          phone: p.phone || 'Phone not available',
          city,
          district: p.district || district || 'Merkez',
          type: "Duty Pharmacy",
          isOpen: true,
          hours: "24 Hours (On Duty)",
          rating: "Duty Pharmacy",
          services: ["Emergency Medicine", "24/7 Service"],
          isRealData: true
        }));
        
        setPharmacies(formatted);
        setDataSource('real');
        setErrorMessage(`✅ Found ${formatted.length} duty pharmacies from Turkish Health Ministry`);
      } else {
        setErrorMessage("⚠️ No duty pharmacies found for this location.");
      }
    } catch (error) {
      console.error('Turkey API Error:', error);
      setErrorMessage(`❌ Failed to fetch duty pharmacy data: ${error.message}`);
    }
    
    setLoadingPharmacies(false);
  };

  // Manual search handler
  const handleSearch = () => {
    if (!selectedCountry) {
      setErrorMessage("❌ Please select a country first.");
      return;
    }

    if (selectedCountry === "Philippines") {
      if (userLocation) {
        searchPhilippinesPharmacies(userLocation.lat, userLocation.lng);
      } else {
        setErrorMessage("❌ Please allow location access first, or click 'Find Nearest Pharmacies'.");
      }
    } else if (selectedCountry === "Turkey") {
      if (selectedCity) {
        searchTurkeyPharmacies(selectedCity, selectedDistrict);
      } else {
        setErrorMessage("❌ Please select a city for Turkish pharmacy search.");
      }
    }
  };

  const callPharmacy = (phone) => {
    if (phone && phone !== "Contact for phone number" && phone !== "Phone not available") {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    } else {
      setErrorMessage("❌ Phone number not available for this pharmacy.");
    }
  };

  const getDirections = (pharmacy) => {
    const url = (pharmacy.lat && pharmacy.lng)
      ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`)}`;
    window.open(url, "_blank");
  };

  // Add function to search by chosen location
  const searchByChosenLocation = async () => {
    if (!selectedProvince || !selectedCity) {
      setErrorMessage('❌ Please select both province and city');
      return;
    }

    const locationKey = `${selectedCity}, ${selectedProvince}`;
    const coords = coordinates[locationKey];
    
    if (!coords) {
      setErrorMessage('❌ Coordinates not available for this location');
      return;
    }

    console.log(`🗺️ Searching in chosen location: ${selectedBarangay ? selectedBarangay + ', ' : ''}${selectedCity}, ${selectedProvince}`);
    console.log(`📍 Using coordinates: ${coords.lat}, ${coords.lng}`);

    await searchPhilippinesPharmacies(coords.lat, coords.lng);
  };

  if (loading) {
    const currentStyles = isDarkMode ? darkStyles : lightStyles;
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.spinner}></div>
          <p style={currentStyles.loadingText}>Loading pharmacy locator...</p>
        </div>
      </>
    );
  }

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pharmacy-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      `}</style>

      <div style={currentStyles.container}>
        {/* Hero Header */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroContent}>
            <div style={currentStyles.heroIcon}>🏥</div>
            <h1 style={currentStyles.heroTitle}>Pharmacy Locator</h1>
            <p style={currentStyles.heroSubtitle}>Find verified pharmacies near you with real-time data</p>
            {currentAddress && (
              <div style={currentStyles.currentLocationBadge}>
                <span style={currentStyles.locationIcon}>📍</span>
                <span style={currentStyles.locationText}>{currentAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div style={currentStyles.searchSection}>
          <div style={currentStyles.searchCard}>
            {/* Mode Toggle */}
            <div style={currentStyles.modeToggleContainer}>
              <button
                onClick={() => setSearchMode('auto')}
                style={{
                  ...currentStyles.modeToggleButton,
                  ...(searchMode === 'auto' ? currentStyles.modeToggleActive : currentStyles.modeToggleInactive)
                }}
              >
                <span style={currentStyles.buttonIcon}>📍</span>
                <span>My Location</span>
              </button>
              <button
                onClick={() => setSearchMode('manual')}
                style={{
                  ...currentStyles.modeToggleButton,
                  ...(searchMode === 'manual' ? currentStyles.modeToggleActive : currentStyles.modeToggleInactive)
                }}
              >
                <span style={currentStyles.buttonIcon}>🗺️</span>
                <span>Choose Location</span>
              </button>
            </div>

            {/* Search Content */}
            {searchMode === 'auto' ? (
              <div style={currentStyles.searchContent}>
                <p style={currentStyles.searchDescription}>
                  Allow location access to find pharmacies near your current position
                </p>
                <button
                  onClick={getCurrentLocation}
                  style={currentStyles.primaryButton}
                  disabled={loadingPharmacies}
                >
                  {loadingPharmacies ? (
                    <>
                      <span style={currentStyles.buttonSpinner}></span>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span style={currentStyles.buttonIcon}>🔍</span>
                      <span>Find Nearest Pharmacies</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={currentStyles.searchContent}>
                <p style={currentStyles.searchDescription}>
                  Select a location in the Philippines to search for pharmacies
                </p>
                
                <div style={currentStyles.formGrid}>
                  <div style={currentStyles.formField}>
                    <label style={currentStyles.label}>Province</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedCity('');
                        setSelectedBarangay('');
                      }}
                      style={currentStyles.select}
                    >
                      <option value="">Select Province</option>
                      {locationData.provinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProvince && (
                    <div style={currentStyles.formField}>
                      <label style={currentStyles.label}>City / Municipality</label>
                      <select 
                        value={selectedCity} 
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setSelectedBarangay('');
                        }}
                        style={currentStyles.select}
                      >
                        <option value="">Select City</option>
                        {locationData.cities[selectedProvince]?.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCity && locationData.barangays[selectedCity] && (
                    <div style={currentStyles.formField}>
                      <label style={currentStyles.label}>Barangay <span style={currentStyles.optionalText}>(Optional)</span></label>
                      <select 
                        value={selectedBarangay} 
                        onChange={(e) => setSelectedBarangay(e.target.value)}
                        style={currentStyles.select}
                      >
                        <option value="">All Barangays</option>
                        {locationData.barangays[selectedCity]?.map((barangay) => (
                          <option key={barangay} value={barangay}>{barangay}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedProvince && selectedCity && (
                  <button 
                    onClick={searchByChosenLocation} 
                    style={currentStyles.secondaryButton}
                    disabled={loadingPharmacies}
                  >
                    {loadingPharmacies ? (
                      <>
                        <span style={currentStyles.buttonSpinner}></span>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span style={currentStyles.buttonIcon}>🔍</span>
                        <span>Search in {selectedBarangay ? `${selectedBarangay}, ` : ''}{selectedCity}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Status Message */}
            {errorMessage && (
              <div style={{
                ...currentStyles.statusMessage,
                ...(errorMessage.includes('✅') ? currentStyles.statusSuccess : currentStyles.statusError)
              }}>
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div style={currentStyles.resultsSection}>
          {loadingPharmacies ? (
            <div style={currentStyles.loadingResults}>
              <div style={currentStyles.spinner}></div>
              <p style={currentStyles.loadingText}>Searching for pharmacies...</p>
            </div>
          ) : pharmacies.length > 0 ? (
            <>
              <div style={currentStyles.resultsHeader}>
                <div>
                  <h2 style={currentStyles.resultsTitle}>
                    {pharmacies.length} {pharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'} Found
                  </h2>
                  <p style={currentStyles.resultsSubtitle}>Sorted by distance from your location</p>
                </div>
                {dataSource === 'real' && (
                  <div style={currentStyles.realTimeBadge}>
                    <span style={currentStyles.pulseDot}></span>
                    <span>Real-time Data</span>
                  </div>
                )}
              </div>
              
              <div style={currentStyles.pharmacyGrid}>
                {pharmacies.map((pharmacy, index) => (
                  <div 
                    key={pharmacy.id} 
                    className="pharmacy-card"
                    style={{
                      ...currentStyles.pharmacyCard,
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div style={currentStyles.cardTop}>
                      <div style={currentStyles.cardHeader}>
                        <h3 style={currentStyles.pharmacyName}>{pharmacy.name}</h3>
                        <span style={{
                          ...currentStyles.statusBadge,
                          ...(pharmacy.isOpen ? currentStyles.statusOpen : currentStyles.statusClosed)
                        }}>
                          <span style={currentStyles.statusDot}></span>
                          {pharmacy.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      
                      {pharmacy.distance && (
                        <div style={currentStyles.distanceChip}>
                          <span style={currentStyles.distanceIcon}>📏</span>
                          <span style={currentStyles.distanceText}>{pharmacy.distance} away</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={currentStyles.cardBody}>
                      <div style={currentStyles.infoRow}>
                        <span style={currentStyles.infoIcon}>📍</span>
                        <span style={currentStyles.infoText}>{pharmacy.address}</span>
                      </div>
                      <div style={currentStyles.infoRow}>
                        <span style={currentStyles.infoIcon}>📞</span>
                        <span style={currentStyles.infoText}>{pharmacy.phone}</span>
                      </div>
                      <div style={currentStyles.infoRow}>
                        <span style={currentStyles.infoIcon}>🕒</span>
                        <span style={currentStyles.infoText}>{pharmacy.hours}</span>
                      </div>
                      <div style={currentStyles.infoRow}>
                        <span style={currentStyles.infoIcon}>⭐</span>
                        <span style={currentStyles.infoText}>{pharmacy.rating}</span>
                      </div>
                    </div>

              <div style={currentStyles.cardActions}>
                <button 
                  onClick={() => callPharmacy(pharmacy.phone)}
                  style={currentStyles.callButton}
                >
                  <span style={currentStyles.buttonIcon}>📞</span>
                  <span>Call Now</span>
                </button>
                <button 
                  onClick={() => getDirections(pharmacy)}
                  style={currentStyles.directionsButton}
                >
                  <span style={currentStyles.buttonIcon}>🧭</span>
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
              <h3 style={currentStyles.emptyTitle}>No Pharmacies Found</h3>
              <p style={currentStyles.emptyText}>
                Try searching in a different location or check your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Light Mode Styles
const lightStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: '80px',
    paddingBottom: '4rem',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  loadingText: {
    marginTop: '20px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '500',
  },

  // Hero Section
  hero: {
    padding: '60px 20px',
    textAlign: 'center',
    color: 'white',
  },

  heroContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },

  heroIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
  },

  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 0 15px 0',
    textShadow: '0 2px 20px rgba(0,0,0,0.2)',
  },

  heroSubtitle: {
    fontSize: '1.3rem',
    margin: '0 0 25px 0',
    opacity: '0.95',
    fontWeight: '400',
  },

  currentLocationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '500',
  },

  locationIcon: {
    fontSize: '1.2rem',
  },

  locationText: {
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Search Section
  searchSection: {
    maxWidth: '900px',
    margin: '0 auto 50px',
    padding: '0 20px',
  },

  searchCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  modeToggleContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    padding: '6px',
    background: '#f5f7fa',
    borderRadius: '12px',
  },

  modeToggleButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  modeToggleActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },

  modeToggleInactive: {
    background: 'transparent',
    color: '#6c757d',
  },

  searchContent: {
    marginTop: '30px',
  },

  searchDescription: {
    fontSize: '1rem',
    color: '#6c757d',
    marginBottom: '25px',
    textAlign: 'center',
  },

  formGrid: {
    display: 'grid',
    gap: '20px',
    marginBottom: '30px',
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3748',
  },

  optionalText: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#a0aec0',
  },

  select: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: 'white',
    color: '#2d3748',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  primaryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },

  secondaryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
  },

  buttonIcon: {
    fontSize: '1.2rem',
  },

  buttonSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  statusMessage: {
    marginTop: '25px',
    padding: '16px 20px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'center',
  },

  statusSuccess: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },

  statusError: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },

  // Results Section
  resultsSection: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },

  loadingResults: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '30px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  resultsTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 8px 0',
  },

  resultsSubtitle: {
    fontSize: '1rem',
    color: '#718096',
    margin: 0,
  },

  realTimeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
  },

  pulseDot: {
    width: '10px',
    height: '10px',
    background: 'white',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },

  pharmacyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '25px',
  },

  pharmacyCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
  },

  cardTop: {
    marginBottom: '20px',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },

  pharmacyName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: 0,
    lineHeight: '1.3',
    flex: 1,
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },

  statusOpen: {
    background: '#d4edda',
    color: '#155724',
  },

  statusClosed: {
    background: '#f8d7da',
    color: '#721c24',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'currentColor',
  },

  distanceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },

  distanceIcon: {
    fontSize: '1rem',
  },

  distanceText: {
    whiteSpace: 'nowrap',
  },

  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    background: '#f7fafc',
    borderRadius: '12px',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },

  infoIcon: {
    fontSize: '1.1rem',
    marginTop: '2px',
    flexShrink: 0,
  },

  infoText: {
    fontSize: '0.95rem',
    color: '#4a5568',
    lineHeight: '1.5',
  },

  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },

  callButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  directionsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '10px',
  },

  emptyText: {
    fontSize: '1rem',
    color: '#718096',
    maxWidth: '400px',
    margin: '0 auto',
  },
};

// Dark Mode Styles
const darkStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    paddingTop: '80px',
    paddingBottom: '4rem',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(102, 126, 234, 0.3)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  loadingText: {
    marginTop: '20px',
    color: '#cbd5e0',
    fontSize: '1.1rem',
    fontWeight: '500',
  },

  // Hero Section
  hero: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#e2e8f0',
  },

  heroContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },

  heroIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))',
  },

  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 0 15px 0',
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
    color: '#ffffff',
  },

  heroSubtitle: {
    fontSize: '1.3rem',
    margin: '0 0 25px 0',
    opacity: '0.9',
    fontWeight: '400',
    color: '#cbd5e0',
  },

  currentLocationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(102, 126, 234, 0.2)',
    backdropFilter: 'blur(10px)',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '500',
    border: '1px solid rgba(102, 126, 234, 0.3)',
  },

  locationIcon: {
    fontSize: '1.2rem',
  },

  locationText: {
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#e2e8f0',
  },

  // Search Section
  searchSection: {
    maxWidth: '900px',
    margin: '0 auto 50px',
    padding: '0 20px',
  },

  searchCard: {
    background: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  modeToggleContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    padding: '6px',
    background: 'rgba(45, 55, 72, 0.5)',
    borderRadius: '12px',
  },

  modeToggleButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  modeToggleActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },

  modeToggleInactive: {
    background: 'transparent',
    color: '#cbd5e0',
  },

  searchContent: {
    marginTop: '30px',
  },

  searchDescription: {
    fontSize: '1rem',
    color: '#cbd5e0',
    marginBottom: '25px',
    textAlign: 'center',
  },

  formGrid: {
    display: 'grid',
    gap: '20px',
    marginBottom: '30px',
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },

  optionalText: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#94a3b8',
  },

  select: {
    padding: '14px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: 'rgba(45, 55, 72, 0.6)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  primaryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },

  secondaryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
  },

  buttonIcon: {
    fontSize: '1.2rem',
  },

  buttonSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  statusMessage: {
    marginTop: '25px',
    padding: '16px 20px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'center',
  },

  statusSuccess: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },

  statusError: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },

  // Results Section
  resultsSection: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },

  loadingResults: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '30px',
    background: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  resultsTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },

  resultsSubtitle: {
    fontSize: '1rem',
    color: '#94a3b8',
    margin: 0,
  },

  realTimeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },

  pulseDot: {
    width: '10px',
    height: '10px',
    background: '#22c55e',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },

  pharmacyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '25px',
  },

  pharmacyCard: {
    background: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  cardTop: {
    marginBottom: '20px',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },

  pharmacyName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    lineHeight: '1.3',
    flex: 1,
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },

  statusOpen: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },

  statusClosed: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'currentColor',
  },

  distanceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(102, 126, 234, 0.2)',
    color: '#a5b4fc',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: '1px solid rgba(102, 126, 234, 0.3)',
  },

  distanceIcon: {
    fontSize: '1rem',
  },

  distanceText: {
    whiteSpace: 'nowrap',
  },

  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(45, 55, 72, 0.4)',
    borderRadius: '12px',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },

  infoIcon: {
    fontSize: '1.1rem',
    marginTop: '2px',
    flexShrink: 0,
  },

  infoText: {
    fontSize: '0.95rem',
    color: '#cbd5e0',
    lineHeight: '1.5',
  },

  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },

  callButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  directionsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(102, 126, 234, 0.2)',
    color: '#a5b4fc',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '10px',
  },

  emptyText: {
    fontSize: '1rem',
    color: '#94a3b8',
    maxWidth: '400px',
    margin: '0 auto',
  },
};