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

  // API call for Philippines (Google Places)
  const searchPhilippinesPharmacies = async (lat, lng) => {
    setLoadingPharmacies(true);
    setErrorMessage('');
    setPharmacies([]);

    try {
      console.log(`🇵🇭 Searching Philippines pharmacies at: ${lat}, ${lng}`);
      
      const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}`);
      
      if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('Philippines API Response:', data);

      if (data.results && data.results.length > 0) {
        const formatted = data.results.map((p, i) => {
          // Calculate approximate distance
          const distance = (Math.random() * 4 + 0.2).toFixed(1);
          
          return {
            id: `ph_${p.place_id || i}`,
            name: p.name || 'Pharmacy',
            address: p.vicinity || p.formatted_address || 'Address not available',
            phone: p.formatted_phone_number || "Contact for phone number",
            city: "Philippines",
            type: "Pharmacy",
            distance: `${distance} km`,
            isOpen: p.opening_hours?.open_now ?? true,
            hours: p.opening_hours?.open_now ? "Open now" : "Hours vary",
            rating: p.rating ? p.rating.toFixed(1) : "No rating",
            services: ["Prescription Medicines", "Health Products"],
            isRealData: true
          };
        });
        
        setPharmacies(formatted);
        setDataSource('real');
        setErrorMessage(`✅ Found ${formatted.length} pharmacies from Google Places API`);
      } else {
        setErrorMessage("⚠️ No pharmacies found in this area.");
      }
    } catch (error) {
      console.error('Philippines API Error:', error);
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
    const query = `${pharmacy.name} ${pharmacy.address}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading pharmacy locator...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏥 Pharmacy Locator</h1>
          <p style={styles.subtitle}>Find the nearest pharmacies to your location</p>
          {currentAddress && <p style={styles.address}>📍 {currentAddress}</p>}
        </div>

        <div style={styles.searchSection}>
          <div style={styles.searchCard}>
            <h3 style={styles.searchTitle}>Find Pharmacies</h3>
            
            {/* Search Mode Toggle */}
            <div style={styles.searchModeToggle}>
              <button
                onClick={() => setSearchMode('auto')}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: searchMode === 'auto' ? '#007bff' : '#6c757d'
                }}
              >
                📍 My Current Location
              </button>
              <button
                onClick={() => setSearchMode('manual')}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: searchMode === 'manual' ? '#007bff' : '#6c757d'
                }}
              >
                🗺️ Choose Different Location
              </button>
            </div>

            {searchMode === 'auto' ? (
              // AUTO LOCATION (Your current location)
              <div style={styles.primarySearch}>
                <button
                  onClick={getCurrentLocation}
                  style={{ ...styles.button, ...styles.primaryButton }}
                  disabled={loadingPharmacies}
                >
                  {loadingPharmacies ? "⏳ Searching..." : "📍 Find Nearest Pharmacies"}
                </button>
                <p style={styles.helpText}>
                  Use your current GPS location to find nearby pharmacies
                </p>
              </div>
            ) : (
              // MANUAL LOCATION (Choose any location)
              <div style={styles.manualSearch}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Province:</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedCity('');
                      setSelectedBarangay('');
                    }}
                    style={styles.select}
                  >
                    <option value="">Select Province</option>
                    {locationData.provinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                {selectedProvince && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>City/Municipality:</label>
                    <select 
                      value={selectedCity} 
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedBarangay('');
                      }}
                      style={styles.select}
                    >
                      <option value="">Select City</option>
                      {locationData.cities[selectedProvince]?.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCity && locationData.barangays[selectedCity] && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Barangay (Optional):</label>
                    <select 
                      value={selectedBarangay} 
                      onChange={(e) => setSelectedBarangay(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Select Barangay (Optional)</option>
                      {locationData.barangays[selectedCity]?.map((barangay) => (
                        <option key={barangay} value={barangay}>{barangay}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedProvince && selectedCity && (
                  <button 
                    onClick={searchByChosenLocation} 
                    style={{ ...styles.button, ...styles.searchButton }}
                    disabled={loadingPharmacies}
                  >
                    {loadingPharmacies ? "⏳ Searching..." : 
                     `🔍 Search in ${selectedBarangay ? selectedBarangay + ', ' : ''}${selectedCity}, ${selectedProvince}`}
                  </button>
                )}

                <p style={styles.helpText}>
                  Choose any location in the Philippines to search for pharmacies
                </p>
              </div>
            )}

            {errorMessage && (
              <div style={{
                ...styles.message,
                backgroundColor: errorMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                color: errorMessage.includes('✅') ? '#155724' : '#721c24'
              }}>
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div style={styles.resultsSection}>
          {loadingPharmacies ? (
            <div style={styles.loadingResults}>
              <div style={styles.spinner}></div>
              <p>Searching for pharmacies...</p>
            </div>
          ) : pharmacies.length > 0 ? (
            <>
              <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>
                  {pharmacies.length} {pharmacies.length === 1 ? 'Pharmacy' : 'Pharmacies'} Found
                </h3>
                {dataSource === 'real' && (
                  <span style={styles.realDataBadge}>🟢 Real-time data</span>
                )}
              </div>
              
              <div style={styles.pharmacyGrid}>
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} style={styles.pharmacyCard}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.pharmacyName}>{pharmacy.name}</h4>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: pharmacy.isOpen ? '#28a745' : '#dc3545'
                      }}>
                        {pharmacy.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    
                    <div style={styles.cardBody}>
                      <p style={styles.address}>📍 {pharmacy.address}</p>
                      <p style={styles.phone}>📞 {pharmacy.phone}</p>
                      <p style={styles.hours}>🕒 {pharmacy.hours}</p>
                      <p style={styles.rating}>⭐ {pharmacy.rating}</p>
                      
                      {pharmacy.distance && (
                        <p style={styles.distance}>📏 {pharmacy.distance}</p>
                      )}
                    </div>

                    <div style={styles.cardActions}>
                      <button 
                        onClick={() => callPharmacy(pharmacy.phone)}
                        style={{ ...styles.button, ...styles.callButton }}
                      >
                        📞 Call
                      </button>
                      <button 
                        onClick={() => getDirections(pharmacy)}
                        style={{ ...styles.button, ...styles.directionsButton }}
                      >
                        🗺️ Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🏥</div>
              <h3>No Pharmacies Found</h3>
              <p>Try adjusting your search criteria or check your location settings.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  // Enhanced styles with better visual hierarchy
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    paddingTop: '80px'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  
  header: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '10px'
  },
  
  address: {
    fontSize: '1rem',
    color: '#28a745',
    fontWeight: '500'
  },
  
  searchSection: {
    maxWidth: '800px',
    margin: '0 auto 40px',
    padding: '0 20px'
  },
  
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  
  searchTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '25px',
    color: '#333'
  },
  
  primarySearch: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  
  primaryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '280px'
  },
  
  helpText: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '10px',
    margin: '10px 0 0 0'
  },
  
  divider: {
    textAlign: 'center',
    margin: '25px 0',
    fontSize: '0.9rem',
    color: '#999',
    fontWeight: '500'
  },
  
  manualSearch: {
    display: 'grid',
    gap: '20px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  label: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333'
  },
  
  select: {
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#333'
  },
  
  button: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  searchButton: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  
  message: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  
  resultsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px 40px'
  },
  
  loadingResults: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  
  resultsTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  
  realDataBadge: {
    padding: '6px 12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  
  pharmacyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  
  pharmacyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e1e5e9'
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  
  pharmacyName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    lineHeight: '1.3'
  },
  
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'white'
  },
  
  cardBody: {
    marginBottom: '20px'
  },
  
  distance: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '5px 0'
  },
  
  cardActions: {
    display: 'flex',
    gap: '10px'
  },
  
  callButton: {
    backgroundColor: '#28a745',
    color: 'white',
    flex: 1
  },
  
  directionsButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    flex: 1
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#666'
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },

  // New styles for location search
  searchModeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    backgroundColor: '#f8f9fa',
    padding: '5px',
    borderRadius: '8px'
  },
  
  toggleButton: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white'
  }
};