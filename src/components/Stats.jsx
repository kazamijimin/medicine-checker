"use client";

import { useState, useEffect } from "react";

export default function Stats({ isDarkMode }) {
  const [counters, setCounters] = useState({
    users: 0,
    medicines: 0,
    verifications: 0,
    accuracy: 0
  });

  useEffect(() => {
    const targets = {
      users: 10000,
      medicines: 50000,
      verifications: 250000,
      accuracy: 99.9
    };

    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => {
        const newCounters = { ...prev };
        let allComplete = true;

        Object.keys(targets).forEach(key => {
          if (newCounters[key] < targets[key]) {
            allComplete = false;
            const step = targets[key] / steps;
            newCounters[key] = Math.min(
              newCounters[key] + step,
              targets[key]
            );
          }
        });

        if (allComplete) {
          clearInterval(timer);
          return targets;
        }
        return newCounters;
      });
    }, increment);

    return () => clearInterval(timer);
  }, []);

  const currentStyles = isDarkMode ? darkStatsStyles : lightStatsStyles;

  return (
    <section style={currentStyles.section} id="stats">
      <div style={currentStyles.container}>
        <h2 style={currentStyles.title}>Trusted by Thousands</h2>
        <div style={currentStyles.statsGrid}>
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statNumber}>
              {Math.floor(counters.users).toLocaleString()}+
            </div>
            <div style={currentStyles.statLabel}>Active Users</div>
            <div style={currentStyles.statIcon}>👥</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statNumber}>
              {Math.floor(counters.medicines).toLocaleString()}+
            </div>
            <div style={currentStyles.statLabel}>Medicines Verified</div>
            <div style={currentStyles.statIcon}>💊</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statNumber}>
              {Math.floor(counters.verifications).toLocaleString()}+
            </div>
            <div style={currentStyles.statLabel}>Total Verifications</div>
            <div style={currentStyles.statIcon}>✅</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statNumber}>
              {counters.accuracy.toFixed(1)}%
            </div>
            <div style={currentStyles.statLabel}>Accuracy Rate</div>
            <div style={currentStyles.statIcon}>🎯</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const baseStatsStyles = {
  section: {
    padding: "80px 20px",
    textAlign: "center"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto"
  },
  title: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: "700",
    marginBottom: "50px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
    marginTop: "40px"
  },
  statCard: {
    padding: "40px 20px",
    borderRadius: "16px",
    position: "relative",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer"
  },
  statNumber: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "800",
    marginBottom: "10px",
    color: "#28a745"
  },
  statLabel: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "15px"
  },
  statIcon: {
    fontSize: "40px",
    position: "absolute",
    top: "20px",
    right: "20px",
    opacity: 0.3
  }
};

const lightStatsStyles = {
  ...baseStatsStyles,
  section: {
    ...baseStatsStyles.section,
    backgroundColor: "#f8f9fa"
  },
  statCard: {
    ...baseStatsStyles.statCard,
    backgroundColor: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    color: "#333"
  },
  statLabel: {
    ...baseStatsStyles.statLabel,
    color: "#666"
  }
};

const darkStatsStyles = {
  ...baseStatsStyles,
  section: {
    ...baseStatsStyles.section,
    backgroundColor: "#1a1a1a"
  },
  statCard: {
    ...baseStatsStyles.statCard,
    backgroundColor: "#2d2d2d",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    color: "#fff"
  },
  statLabel: {
    ...baseStatsStyles.statLabel,
    color: "#b0b0b0"
  }
};