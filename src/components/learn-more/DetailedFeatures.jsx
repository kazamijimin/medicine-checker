import React from 'react';

export default function DetailedFeatures({ isDarkMode }) {
  const features = [
    {
      icon: "💊",
      title: "Comprehensive Medicine Database",
      description: "Access detailed information about thousands of medications including dosage, side effects, interactions, and precautions.",
      details: [
        "Real-time drug interaction checking",
        "FDA-approved medication information",
        "Generic and brand name cross-reference",
        "International drug databases"
      ]
    },
    {
      icon: "🔔",
      title: "Smart Medication Reminders",
      description: "Never miss a dose with our intelligent reminder system that adapts to your schedule and preferences.",
      details: [
        "Customizable reminder schedules",
        "Multiple notification methods",
        "Refill reminders and alerts",
        "Family medication tracking"
      ]
    },
    {
      icon: "🤖",
      title: "AI-Powered Health Assistant",
      description: "Get instant answers to your medication questions with our advanced AI chatbot trained on medical literature.",
      details: [
        "24/7 availability",
        "Multi-language support",
        "Personalized health recommendations",
        "Drug interaction warnings"
      ]
    },
    {
      icon: "📊",
      title: "Health Analytics Dashboard",
      description: "Track your medication adherence and health metrics with visual insights and progress reports.",
      details: [
        "Medication adherence tracking",
        "Health trend visualization",
        "Exportable health reports",
        "Integration with health apps"
      ]
    },
    {
      icon: "🔒",
      title: "HIPAA-Compliant Security",
      description: "Your health data is protected with enterprise-grade encryption and privacy controls.",
      details: [
        "End-to-end encryption",
        "HIPAA compliance",
        "Secure cloud storage",
        "Privacy-first design"
      ]
    },
    {
      icon: "📍",
      title: "Pharmacy Locator",
      description: "Find nearby pharmacies instantly with real-time availability and pricing information.",
      details: [
        "GPS-based location services",
        "Pharmacy hours and contact info",
        "Price comparison tools",
        "Insurance compatibility check"
      ]
    }
  ];

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section style={currentStyles.section}>
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <h2 style={currentStyles.title}>Powerful Features</h2>
          <p style={currentStyles.subtitle}>
            Everything you need to manage your medications safely and effectively
          </p>
        </div>

        <div style={currentStyles.grid}>
          {features.map((feature, index) => (
            <div key={index} style={currentStyles.card}>
              <div style={currentStyles.iconWrapper}>
                <span style={currentStyles.icon}>{feature.icon}</span>
              </div>
              <h3 style={currentStyles.cardTitle}>{feature.title}</h3>
              <p style={currentStyles.cardDescription}>{feature.description}</p>
              <ul style={currentStyles.detailsList}>
                {feature.details.map((detail, idx) => (
                  <li key={idx} style={currentStyles.detailItem}>
                    <span style={currentStyles.checkmark}>✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const lightStyles = {
  section: {
    padding: "80px 20px",
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "60px",
  },
  title: {
    fontSize: "42px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "15px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: "30px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  icon: {
    fontSize: "32px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  cardDescription: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  detailsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  detailItem: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "10px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  checkmark: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: "16px",
  },
};

const darkStyles = {
  ...lightStyles,
  section: {
    ...lightStyles.section,
    backgroundColor: "#1a1a1a",
  },
  title: {
    ...lightStyles.title,
    color: "#f1f5f9",
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: "#94a3b8",
  },
  card: {
    ...lightStyles.card,
    backgroundColor: "#262626",
    borderColor: "#374151",
  },
  cardTitle: {
    ...lightStyles.cardTitle,
    color: "#f1f5f9",
  },
  cardDescription: {
    ...lightStyles.cardDescription,
    color: "#94a3b8",
  },
  detailItem: {
    ...lightStyles.detailItem,
    color: "#cbd5e1",
  },
};