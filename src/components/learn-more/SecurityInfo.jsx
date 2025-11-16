import React from 'react';

export default function SecurityInfo({ isDarkMode }) {
  const securityFeatures = [
    {
      icon: "🔐",
      title: "End-to-End Encryption",
      description: "All your health data is encrypted using AES-256 encryption, the same standard used by banks and government agencies."
    },
    {
      icon: "🏛️",
      title: "HIPAA Compliance",
      description: "We follow strict HIPAA guidelines to ensure your protected health information remains confidential and secure."
    },
    {
      icon: "🛡️",
      title: "Data Privacy",
      description: "Your data is never sold or shared with third parties. We believe your health information belongs only to you."
    },
    {
      icon: "🔒",
      title: "Secure Authentication",
      description: "Multi-factor authentication and biometric login options keep your account protected from unauthorized access."
    },
    {
      icon: "📱",
      title: "Device Security",
      description: "Remote device logout and session management help you control access to your account across all devices."
    },
    {
      icon: "🔍",
      title: "Regular Audits",
      description: "We conduct regular security audits and penetration testing to identify and fix potential vulnerabilities."
    }
  ];

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section style={currentStyles.section}>
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <div style={currentStyles.badge}>
            <span style={currentStyles.badgeIcon}>✓</span>
            HIPAA Compliant
          </div>
          <h2 style={currentStyles.title}>Your Privacy & Security</h2>
          <p style={currentStyles.subtitle}>
            We take the security of your health information seriously. Here's how we protect your data.
          </p>
        </div>

        <div style={currentStyles.grid}>
          {securityFeatures.map((feature, index) => (
            <div key={index} style={currentStyles.card}>
              <div style={currentStyles.iconWrapper}>
                <span style={currentStyles.icon}>{feature.icon}</span>
              </div>
              <h3 style={currentStyles.cardTitle}>{feature.title}</h3>
              <p style={currentStyles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div style={currentStyles.certifications}>
          <h3 style={currentStyles.certificationsTitle}>Certifications & Compliance</h3>
          <div style={currentStyles.badges}>
            <div style={currentStyles.certBadge}>
              <span style={currentStyles.certIcon}>🏅</span>
              <span>HIPAA Compliant</span>
            </div>
            <div style={currentStyles.certBadge}>
              <span style={currentStyles.certIcon}>🔒</span>
              <span>SOC 2 Type II</span>
            </div>
            <div style={currentStyles.certBadge}>
              <span style={currentStyles.certIcon}>🌍</span>
              <span>GDPR Ready</span>
            </div>
            <div style={currentStyles.certBadge}>
              <span style={currentStyles.certIcon}>✓</span>
              <span>ISO 27001</span>
            </div>
          </div>
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
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 20px",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "20px",
  },
  badgeIcon: {
    fontSize: "16px",
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
    maxWidth: "700px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
  },
  card: {
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  icon: {
    fontSize: "40px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "12px",
  },
  cardDescription: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
  },
  certifications: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px solid #10b981",
  },
  certificationsTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "30px",
  },
  badges: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  certBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 24px",
    backgroundColor: "#f0fdf4",
    borderRadius: "50px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#15803d",
    border: "2px solid #bbf7d0",
  },
  certIcon: {
    fontSize: "20px",
  },
};

const darkStyles = {
  ...lightStyles,
  section: {
    ...lightStyles.section,
    backgroundColor: "#0f172a",
  },
  badge: {
    ...lightStyles.badge,
    backgroundColor: "#064e3b",
    color: "#6ee7b7",
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
  certifications: {
    ...lightStyles.certifications,
    backgroundColor: "#1e293b",
    borderColor: "#10b981",
  },
  certificationsTitle: {
    ...lightStyles.certificationsTitle,
    color: "#f1f5f9",
  },
  certBadge: {
    ...lightStyles.certBadge,
    backgroundColor: "#064e3b",
    color: "#6ee7b7",
    borderColor: "#047857",
  },
};