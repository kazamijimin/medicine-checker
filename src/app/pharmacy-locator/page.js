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
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const router = useRouter();

  const turkishCities = [
    'Ankara', 'Istanbul', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Mersin', 'Diyarbakir', 'Kayseri', 'Eskisehir', 'Urfa'
  ];

  const districts = {
    'Ankara': ['Cankaya', 'Kecioren', 'Yenimahalle'],
    'Istanbul': ['Kadikoy', 'Besiktas', 'Sisli'],
    'Izmir': ['Konak', 'Bornova', 'Karsiyaka']
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

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation not supported.");
      setLoadingPharmacies(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();
        const country = geoData.address?.country_code?.toUpperCase();
        setCurrentAddress(geoData.display_name || "");

        if (country === "PH") {
          setSelectedCountry("Philippines");
          await searchPhilippinesPharmacies(latitude, longitude);
        } else if (country === "TR") {
          setSelectedCountry("Turkey");
          if (selectedCity) {
            await searchTurkeyPharmacies(selectedCity, selectedDistrict);
          } else {
            setErrorMessage("🇹🇷 Detected Turkey. Please select a city.");
            setLoadingPharmacies(false);
          }
        } else {
          setSelectedCountry("Philippines");
          setErrorMessage("🌍 Service available only in PH & TR. Showing PH sample data.");
          setPharmacies(generatePhilippinesPharmacies());
          setLoadingPharmacies(false);
        }
      },
      () => {
        setErrorMessage("⚠️ Location permission denied.");
        setPharmacies(generatePhilippinesPharmacies());
        setSelectedCountry("Philippines");
        setLoadingPharmacies(false);
      }
    );
  };

  // API call for PH
  const searchPhilippinesPharmacies = async (lat, lng) => {
    try {
      const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.results?.length > 0) {
        const formatted = data.results.map((p, i) => ({
          id: `ph_${i}`,
          name: p.name,
          address: p.vicinity,
          phone: "Call for info",
          city: "Philippines",
          type: "Nearby Pharmacy",
          distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
          isOpen: p.opening_hours?.open_now ?? true,
          hours: "8:00 AM - 10:00 PM",
          rating: p.rating || (Math.random() * 2 + 3).toFixed(1),
          services: ["Prescription Filling", "Consultation"]
        }));
        setPharmacies(formatted);
      } else {
        setErrorMessage("⚠️ No pharmacies found nearby.");
      }
    } catch {
      setErrorMessage("❌ Error fetching PH pharmacies.");
    }
    setLoadingPharmacies(false);
  };

  // API call for TR
  const searchTurkeyPharmacies = async (city, district) => {
    try {
      const res = await fetch(`/api/turkeyPharmacies?city=${city}&district=${district}`);
      const data = await res.json();
      if (data.success && data.result?.length > 0) {
        const formatted = data.result.map((p, i) => ({
          id: `tr_${i}`,
          name: p.name,
          address: p.address,
          phone: p.phone,
          city,
          type: "Duty Pharmacy",
          isOpen: true,
          hours: "24 Hours",
          rating: "N/A",
          services: ["Emergency Service"]
        }));
        setPharmacies(formatted);
      } else {
        setErrorMessage("⚠️ No duty pharmacies found.");
      }
    } catch {
      setErrorMessage("❌ Error fetching TR pharmacies.");
    }
    setLoadingPharmacies(false);
  };

  // Fallback PH data
  const generatePhilippinesPharmacies = () => [
    { id: "m1", name: "Mercury Drug", address: "Quezon City", phone: "02-1234567", city: "Philippines", type: "24hrs", isOpen: true, hours: "24/7", rating: 4.2, services: ["Delivery", "Consultation"] },
    { id: "w1", name: "Watsons", address: "Makati", phone: "02-7654321", city: "Philippines", type: "Retail", isOpen: true, hours: "9AM-10PM", rating: 4.0, services: ["Beauty", "Wellness"] }
  ];

  const handleSearch = () => {
    if (selectedCountry === "Philippines") {
      if (userLocation) searchPhilippinesPharmacies(userLocation.lat, userLocation.lng);
      else setPharmacies(generatePhilippinesPharmacies());
    } else if (selectedCountry === "Turkey") {
      if (selectedCity) searchTurkeyPharmacies(selectedCity, selectedDistrict);
      else setErrorMessage("Please select a city first for Turkish pharmacies.");
    }
  };

  const callPharmacy = (phone) => {
    if (phone && phone !== "Call for info") {
      window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    } else {
      setErrorMessage("Phone number not available.");
    }
  };

  const getDirections = (pharmacy) => {
    const address = `${pharmacy.address}, ${pharmacy.city}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
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
            <h3 style={styles.searchTitle}>Find Nearest Pharmacies</h3>
            <button
              onClick={getCurrentLocation}
              style={{ ...styles.button, ...styles.primaryButton }}
              disabled={loadingPharmacies}
            >
              {loadingPharmacies ? "⏳ Searching..." : "📍 Find Nearest Pharmacies"}
            </button>
            <div style={{ margin: "20px 0" }}>
              <label>Country:</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Philippines">🇵🇭 Philippines</option>
                <option value="Turkey">🇹🇷 Turkey</option>
              </select>
            </div>
            {selectedCountry === "Turkey" && (
              <>
                <label>City:</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">Select City</option>
                  {turkishCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <label>District:</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  <option value="">All</option>
                  {selectedCity && districts[selectedCity]?.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </>
            )}
            <button onClick={handleSearch} style={{ ...styles.button, ...styles.searchButton }}>
              🔍 Search
            </button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </div>
        </div>

        <div style={styles.resultsSection}>
          {pharmacies.length > 0 ? (
            pharmacies.map((ph) => (
              <div key={ph.id} style={styles.pharmacyCard}>
                <h4>{ph.name}</h4>
                <p>📍 {ph.address}</p>
                <p>📞 {ph.phone}</p>
                <button onClick={() => callPharmacy(ph.phone)}>📞 Call</button>
                <button onClick={() => getDirections(ph)}>🗺️ Directions</button>
              </div>
            ))
          ) : (
            <p>No pharmacies found.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ✅ Reuse your styles object (unchanged)
const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "2rem",
    margin: "0",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#666",
  },
  address: {
    fontSize: "1rem",
    color: "#999",
  },
  searchSection: {
    marginBottom: "30px",
  },
  searchCard: {
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  searchTitle: {
    fontSize: "1.5rem",
    margin: "0 0 10px",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  searchButton: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
  resultsSection: {
    marginTop: "30px",
  },
  pharmacyCard: {
    padding: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};