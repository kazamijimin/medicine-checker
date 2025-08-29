"use client";

export default function HowItWorks({ isDarkMode }) {
  const currentStyles = isDarkMode ? darkHowStyles : lightHowStyles;

  const steps = [
    {
      number: "01",
      icon: "📱",
      title: "Scan or Search",
      description: "Use your camera to scan medicine packaging or search by name in our comprehensive database."
    },
    {
      number: "02",
      icon: "🔍",
      title: "Instant Verification",
      description: "Our AI-powered system instantly verifies authenticity and provides detailed medicine information."
    },
    {
      number: "03",
      icon: "📊",
      title: "Get Results",
      description: "Receive comprehensive details including ingredients, side effects, dosage, and safety warnings."
    },
    {
      number: "04",
      icon: "💾",
      title: "Save & Track",
      description: "Save verified medicines to your personal health profile and track your medication history."
    }
  ];

  return (
    <section style={currentStyles.section} id="how-it-works">
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <h2 style={currentStyles.title}>How MediChecker Works</h2>
          <p style={currentStyles.subtitle}>
            Verify your medicines in just 4 simple steps
          </p>
        </div>

        <div style={currentStyles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={index} style={currentStyles.stepCard}>
              <div style={currentStyles.stepNumber}>{step.number}</div>
              <div style={currentStyles.stepIcon}>{step.icon}</div>
              <h3 style={currentStyles.stepTitle}>{step.title}</h3>
              <p style={currentStyles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>

        <div style={currentStyles.ctaContainer}>
          <button style={currentStyles.ctaButton}>
            Try It Now - It's Free!
          </button>
        </div>
      </div>
    </section>
  );
}

const baseHowStyles = {
  section: {
    padding: "100px 20px",
    textAlign: "center"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    marginBottom: "60px"
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px"
  },
  subtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    opacity: 0.8,
    maxWidth: "600px",
    margin: "0 auto"
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
    marginBottom: "60px"
  },
  stepCard: {
    padding: "40px 20px",
    borderRadius: "20px",
    position: "relative",
    transition: "transform 0.3s ease",
    cursor: "pointer"
  },
  stepNumber: {
    position: "absolute",
    top: "-15px",
    left: "20px",
    fontSize: "60px",
    fontWeight: "800",
    opacity: 0.1
  },
  stepIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  stepTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "16px"
  },
  stepDescription: {
    fontSize: "16px",
    lineHeight: "1.6",
    opacity: 0.8
  },
  ctaContainer: {
    marginTop: "50px"
  },
  ctaButton: {
    padding: "18px 36px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 25px rgba(40, 167, 69, 0.3)"
  }
};

const lightHowStyles = {
  ...baseHowStyles,
  section: {
    ...baseHowStyles.section,
    backgroundColor: "#ffffff"
  },
  title: {
    ...baseHowStyles.title,
    color: "#333"
  },
  subtitle: {
    ...baseHowStyles.subtitle,
    color: "#666"
  },
  stepCard: {
    ...baseHowStyles.stepCard,
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef"
  },
  stepTitle: {
    ...baseHowStyles.stepTitle,
    color: "#333"
  },
  stepDescription: {
    ...baseHowStyles.stepDescription,
    color: "#666"
  }
};

const darkHowStyles = {
  ...baseHowStyles,
  section: {
    ...baseHowStyles.section,
    backgroundColor: "#1a1a1a"
  },
  title: {
    ...baseHowStyles.title,
    color: "#fff"
  },
  subtitle: {
    ...baseHowStyles.subtitle,
    color: "#b0b0b0"
  },
  stepCard: {
    ...baseHowStyles.stepCard,
    backgroundColor: "#2d2d2d",
    border: "1px solid #404040"
  },
  stepTitle: {
    ...baseHowStyles.stepTitle,
    color: "#fff"
  },
  stepDescription: {
    ...baseHowStyles.stepDescription,
    color: "#b0b0b0"
  }
};