import React from 'react';

export default function UseCases({ isDarkMode }) {
  const useCases = [
    {
      icon: "👨‍⚕️",
      title: "For Healthcare Professionals",
      description: "Streamline patient medication management and reduce prescription errors.",
      benefits: [
        "Quick drug interaction checks",
        "Patient medication history tracking",
        "Prescription management tools",
        "Clinical decision support"
      ],
      color: "#3b82f6"
    },
    {
      icon: "👴",
      title: "For Seniors & Caregivers",
      description: "Simplify complex medication regimens for elderly patients and their caregivers.",
      benefits: [
        "Large text and simple interface",
        "Family member access",
        "Emergency contact alerts",
        "Medication adherence tracking"
      ],
      color: "#8b5cf6"
    },
    {
      icon: "🏥",
      title: "For Chronic Condition Patients",
      description: "Manage multiple medications and monitor health conditions effectively.",
      benefits: [
        "Multiple medication tracking",
        "Health metric logging",
        "Doctor appointment reminders",
        "Condition-specific insights"
      ],
      color: "#10b981"
    },
    {
      icon: "💼",
      title: "For Busy Professionals",
      description: "Stay on top of your health without disrupting your busy schedule.",
      benefits: [
        "Quick medication lookups",
        "Flexible reminder scheduling",
        "Travel-friendly features",
        "Calendar integration"
      ],
      color: "#f59e0b"
    }
  ];

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section style={currentStyles.section}>
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <h2 style={currentStyles.title}>Who Benefits from MediChecker?</h2>
          <p style={currentStyles.subtitle}>
            Designed for everyone who cares about medication safety
          </p>
        </div>

        <div style={currentStyles.grid}>
          {useCases.map((useCase, index) => (
            <div key={index} style={{...currentStyles.card, borderTop: `4px solid ${useCase.color}`}}>
              <div style={{...currentStyles.iconWrapper, background: useCase.color}}>
                <span style={currentStyles.icon}>{useCase.icon}</span>
              </div>
              <h3 style={currentStyles.cardTitle}>{useCase.title}</h3>
              <p style={currentStyles.cardDescription}>{useCase.description}</p>
              <div style={currentStyles.benefitsList}>
                {useCase.benefits.map((benefit, idx) => (
                  <div key={idx} style={currentStyles.benefitItem}>
                    <span style={{...currentStyles.bulletPoint, backgroundColor: useCase.color}}>●</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
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
    backgroundColor: "#f8fafc",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  card: {
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
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
  benefitsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  benefitItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "14px",
    color: "#475569",
  },
  bulletPoint: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "6px",
    flexShrink: 0,
  },
};

const darkStyles = {
  ...lightStyles,
  section: {
    ...lightStyles.section,
    backgroundColor: "#0f172a",
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
    backgroundColor: "#1e293b",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
  },
  cardTitle: {
    ...lightStyles.cardTitle,
    color: "#f1f5f9",
  },
  cardDescription: {
    ...lightStyles.cardDescription,
    color: "#94a3b8",
  },
  benefitItem: {
    ...lightStyles.benefitItem,
    color: "#cbd5e1",
  },
};