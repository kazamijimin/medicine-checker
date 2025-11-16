"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const Features = ({ isDarkMode }) => {
  const router = useRouter();

  const features = [
    {
      id: 1,
      icon: '🔍',
      title: 'Medicine Search',
      description: 'Quickly search our extensive database of medicines by name, brand, or generic composition.',
    },
    {
      id: 2,
      icon: '⚠️',
      title: 'Drug Interactions',
      description: 'Check for dangerous drug interactions and get safety warnings before taking medications.',
    },
    {
      id: 3,
      icon: '📊',
      title: 'Dosage Information',
      description: 'Get accurate dosage information, administration guidelines, and timing recommendations.',
    },
    {
      id: 4,
      icon: '🏥',
      title: 'Medical Guidelines',
      description: 'Access WHO and FDA approved medical guidelines and treatment protocols.',
    },
    {
      id: 5,
      icon: '💊',
      title: 'Pill Identifier',
      description: 'Identify unknown pills by shape, color, size, and imprint using our visual recognition.',
    },
    {
      id: 6,
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access medicine information anytime, anywhere with our responsive mobile interface.',
    }
  ];

  const stats = [
    { number: '50K+', label: 'Medicines', icon: '💊' },
    { number: '100K+', label: 'Users', icon: '👥' },
    { number: '99.9%', label: 'Accuracy', icon: '✅' },
    { number: '24/7', label: 'Support', icon: '🔄' }
  ];

  const handleLearnMore = () => {
    router.push('/learn-more');
  };

  const handleStartTrial = () => {
    router.push('/signup');
  };

  const handleContactSales = () => {
    router.push('/contact');
  };

  // Theme-aware styles
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section id="features" style={currentStyles.section}>
      <div style={currentStyles.container}>
        {/* Header */}
        <div style={currentStyles.header}>
          <div style={currentStyles.badge}>
            <span style={currentStyles.badgeIcon}></span>
            Powerful Features
          </div>
          
          <h2 style={currentStyles.title}>
            Everything You Need for
            <span style={currentStyles.titleHighlight}>
              Safe Medicine Use
            </span>
          </h2>
          
          <p style={currentStyles.subtitle}>
            Comprehensive tools and resources to ensure safe, effective medication management
            with real-time information and expert guidance.
          </p>
        </div>

        {/* Stats Section */}
        <div style={currentStyles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>{stat.icon}</div>
              <div style={currentStyles.statNumber}>{stat.number}</div>
              <div style={currentStyles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={currentStyles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.id} style={currentStyles.featureCard}>
              <div style={currentStyles.featureIcon}>
                {feature.icon}
              </div>
              
              <h3 style={currentStyles.featureTitle}>
                {feature.title}
              </h3>
              
              <p style={currentStyles.featureDescription}>
                {feature.description}
              </p>
              
              <button 
                style={currentStyles.featureButton}
                onClick={handleLearnMore}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div style={currentStyles.ctaContainer}>
          <div style={currentStyles.ctaCard}>
            <h3 style={currentStyles.ctaTitle}>
              Ready to Get Started?
            </h3>
            <p style={currentStyles.ctaDescription}>
              Join thousands of users who trust our platform for safe medicine management.
            </p>
            <div style={currentStyles.ctaButtons} className="ctaButtons">
              <button 
                style={currentStyles.primaryButton}
                onClick={handleStartTrial}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.2)';
                }}
              >
                🚀 Start Free Trial
              </button>
              
              <button 
                style={currentStyles.secondaryButton}
                onClick={handleContactSales}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.backgroundColor = isDarkMode ? 'rgba(40, 167, 69, 0.1)' : '#f0fdf4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = isDarkMode ? 'transparent' : 'white';
                }}
              >
                📞 Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Base styles
const baseStyles = {
  section: {
    padding: "80px 20px",
    position: "relative",
    fontFamily: "'Poppins', sans-serif"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 10
  },
  header: {
    textAlign: "center",
    marginBottom: "60px"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "24px",
    border: "1px solid"
  },
  badgeIcon: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    marginRight: "8px",
    animation: "pulse 2s infinite"
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
    lineHeight: "1.2"
  },
  titleHighlight: {
    display: "block",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  subtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
    opacity: 0.8
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    marginBottom: "60px"
  },
  statCard: {
    textAlign: "center",
    padding: "32px 20px",
    borderRadius: "16px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid"
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "12px"
  },
  statNumber: {
    fontSize: "clamp(24px, 3vw, 32px)",
    fontWeight: "800",
    marginBottom: "8px",
    color: "#28a745"
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "500"
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
    marginBottom: "60px"
  },
  featureCard: {
    padding: "40px 32px",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid",
    position: "relative"
  },
  featureIcon: {
    fontSize: "48px",
    marginBottom: "24px"
  },
  featureTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "16px"
  },
  featureDescription: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "24px",
    opacity: 0.8
  },
  featureButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  ctaContainer: {
    textAlign: "center",
    marginTop: "60px"
  },
  ctaCard: {
    padding: "48px 32px",
    borderRadius: "24px",
    border: "1px solid",
    maxWidth: "600px",
    margin: "0 auto"
  },
  ctaTitle: {
    fontSize: "clamp(24px, 3vw, 32px)",
    fontWeight: "700",
    marginBottom: "16px"
  },
  ctaDescription: {
    fontSize: "16px",
    marginBottom: "32px",
    opacity: 0.8
  },
  ctaButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  primaryButton: {
    padding: "16px 32px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)"
  },
  secondaryButton: {
    padding: "16px 32px",
    border: "2px solid #28a745",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "transparent"
  }
};

// Light theme styles
const lightStyles = {
  ...baseStyles,
  section: {
    ...baseStyles.section,
    backgroundColor: "#f8f9fa"
  },
  badge: {
    ...baseStyles.badge,
    backgroundColor: "#e8f5e8",
    color: "#28a745",
    borderColor: "#c3e6c3"
  },
  title: {
    ...baseStyles.title,
    color: "#333"
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: "#666"
  },
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "white",
    borderColor: "#e9ecef",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  },
  statLabel: {
    ...baseStyles.statLabel,
    color: "#666"
  },
  featureCard: {
    ...baseStyles.featureCard,
    backgroundColor: "white",
    borderColor: "#e9ecef",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
  },
  featureTitle: {
    ...baseStyles.featureTitle,
    color: "#333"
  },
  featureDescription: {
    ...baseStyles.featureDescription,
    color: "#666"
  },
  ctaCard: {
    ...baseStyles.ctaCard,
    backgroundColor: "white",
    borderColor: "#e9ecef",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
  },
  ctaTitle: {
    ...baseStyles.ctaTitle,
    color: "#333"
  },
  ctaDescription: {
    ...baseStyles.ctaDescription,
    color: "#666"
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    color: "#28a745",
    backgroundColor: "white"
  }
};

// Dark theme styles
const darkStyles = {
  ...baseStyles,
  section: {
    ...baseStyles.section,
    backgroundColor: "#1a1a1a"
  },
  badge: {
    ...baseStyles.badge,
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    color: "#4ade80",
    borderColor: "rgba(40, 167, 69, 0.3)"
  },
  title: {
    ...baseStyles.title,
    color: "#fff"
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: "#b0b0b0"
  },
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
  },
  statLabel: {
    ...baseStyles.statLabel,
    color: "#b0b0b0"
  },
  featureCard: {
    ...baseStyles.featureCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
  },
  featureTitle: {
    ...baseStyles.featureTitle,
    color: "#fff"
  },
  featureDescription: {
    ...baseStyles.featureDescription,
    color: "#b0b0b0"
  },
  ctaCard: {
    ...baseStyles.ctaCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
  },
  ctaTitle: {
    ...baseStyles.ctaTitle,
    color: "#fff"
  },
  ctaDescription: {
    ...baseStyles.ctaDescription,
    color: "#b0b0b0"
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    color: "#28a745",
    backgroundColor: "transparent"
  }
};

// Add CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @media (max-width: 768px) {
      .ctaButtons {
        flex-direction: column;
        align-items: center;
      }
      
      .ctaButtons button {
        width: 100%;
        max-width: 280px;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Features;