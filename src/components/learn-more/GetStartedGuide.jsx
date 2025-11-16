import React from 'react';
import { useRouter } from 'next/navigation';

export default function GetStartedGuide({ isDarkMode }) {
  const router = useRouter();

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description: "Sign up in seconds with your email or social media account. It's completely free!",
      icon: "📝"
    },
    {
      number: "2",
      title: "Add Your Medications",
      description: "Enter your current medications and we'll help you track them effectively.",
      icon: "💊"
    },
    {
      number: "3",
      title: "Set Up Reminders",
      description: "Configure custom reminders so you never miss a dose again.",
      icon: "⏰"
    },
    {
      number: "4",
      title: "Start Managing",
      description: "Use our AI assistant, check interactions, and stay on top of your health.",
      icon: "✨"
    }
  ];

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section style={currentStyles.section}>
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <h2 style={currentStyles.title}>Get Started in 4 Easy Steps</h2>
          <p style={currentStyles.subtitle}>
            Join thousands of users who trust MediChecker for their medication management
          </p>
        </div>

        <div style={currentStyles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} style={currentStyles.step}>
              <div style={currentStyles.stepNumber}>{step.number}</div>
              <div style={currentStyles.stepIcon}>{step.icon}</div>
              <h3 style={currentStyles.stepTitle}>{step.title}</h3>
              <p style={currentStyles.stepDescription}>{step.description}</p>
              {index < steps.length - 1 && (
                <div style={currentStyles.connector}>→</div>
              )}
            </div>
          ))}
        </div>

        <div style={currentStyles.ctaSection}>
          <h3 style={currentStyles.ctaTitle}>Ready to Get Started?</h3>
          <p style={currentStyles.ctaText}>
            Join MediChecker today and take control of your medication management
          </p>
          <div style={currentStyles.buttonGroup}>
            <button 
              onClick={() => router.push('/signup')}
              style={currentStyles.primaryButton}
            >
              Create Free Account
            </button>
            <button 
              onClick={() => router.push('/home')}
              style={currentStyles.secondaryButton}
            >
              Learn More
            </button>
          </div>
          <p style={currentStyles.disclaimer}>
            No credit card required • Free forever • Cancel anytime
          </p>
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
  stepsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
    marginBottom: "80px",
    position: "relative",
  },
  step: {
    padding: "30px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    textAlign: "center",
    position: "relative",
  },
  stepNumber: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  stepIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  stepDescription: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
  },
  connector: {
    display: "none",
    position: "absolute",
    top: "50%",
    right: "-30px",
    transform: "translateY(-50%)",
    fontSize: "30px",
    color: "#10b981",
    fontWeight: "700",
  },
  ctaSection: {
    textAlign: "center",
    padding: "60px 30px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderRadius: "20px",
    color: "#ffffff",
  },
  ctaTitle: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "15px",
  },
  ctaText: {
    fontSize: "18px",
    marginBottom: "30px",
    opacity: 0.95,
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  primaryButton: {
    padding: "16px 32px",
    backgroundColor: "#ffffff",
    color: "#10b981",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  secondaryButton: {
    padding: "16px 32px",
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  disclaimer: {
    fontSize: "14px",
    opacity: 0.8,
    margin: 0,
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
  step: {
    ...lightStyles.step,
    backgroundColor: "#262626",
    borderColor: "#374151",
  },
  stepTitle: {
    ...lightStyles.stepTitle,
    color: "#f1f5f9",
  },
  stepDescription: {
    ...lightStyles.stepDescription,
    color: "#94a3b8",
  },
  ctaSection: {
    ...lightStyles.ctaSection,
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
};