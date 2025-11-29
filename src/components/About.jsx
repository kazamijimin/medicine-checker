import React, { useState } from "react";
const About = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState("mission");

  const tabs = [
    { id: "mission", label: "Our Mission", icon: "🎯" },
    { id: "team", label: "Our Team", icon: "👥" },
    { id: "technology", label: "Technology", icon: "⚡" },
    { id: "safety", label: "Safety & Trust", icon: "🛡️" },
  ];

  const teamMembers = [
    {
      name: "Nick Narry S. Mendoza",
      role: "Chief Medical Officer",
      image: "/nick.jpg",
      description: "15+ years in pharmacology and drug safety research.",
      specialties: ["Pharmacology", "Drug Safety", "Clinical Research"],
    },
    {
      name: "Jerick E. Mendez",
      role: "Visual Novelist & AI Engineer",
      image:
        "/jerick.jpg",
      description:
        "Former Google engineer specializing in healthcare technology.",
      specialties: ["AI/ML", "Healthcare Tech", "Data Science"],
    },
    {
      name: "Ross Cedric B. Nazareno",
      role: "Free Lance Developer",
      image:
        "/ross.jpg",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
    {
      name: "Lance Vincent Gallardo",
      role: "Creator of SSC Forum",
      image:
        "/lance.jpg",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
    {
      name: "Nigel R. Agojo",
      role: "Prescription Drug Specialist",
      image:
        "/nigel.jpg",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
  ];

  const achievements = [
    { number: "500K+", label: "Lives Impacted", icon: "❤️" },
    { number: "99.8%", label: "Accuracy Rate", icon: "🎯" },
    { number: "50+", label: "Countries Served", icon: "🌍" },
    { number: "24/7", label: "Support Available", icon: "🔄" },
  ];

  const certifications = [
    {
      name: "FDA Compliant",
      icon: "🏛️",
      description: "Meets FDA guidelines for drug information",
    },
    {
      name: "HIPAA Certified",
      icon: "🔒",
      description: "Protects patient privacy and data security",
    },
    {
      name: "ISO 27001",
      icon: "🛡️",
      description: "International security management standards",
    },
    {
      name: "WHO Approved",
      icon: "🌐",
      description: "World Health Organization recognized",
    },
  ];

  // Theme-aware styles
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  const renderTabContent = () => {
    switch (activeTab) {
      case "mission":
        return (
          <div style={currentStyles.tabContent}>
            <div style={currentStyles.missionGrid}>
              <div>
                <h3 style={currentStyles.contentTitle}>
                  Transforming Healthcare Through Technology
                </h3>
                <p style={currentStyles.contentText}>
                  Our mission is to make medicine safer and more accessible for
                  everyone. We believe that accurate, real-time drug information
                  should be available to healthcare professionals and patients
                  worldwide.
                </p>
                <p style={currentStyles.contentText}>
                  By leveraging cutting-edge technology and partnering with
                  medical experts, we're building a platform that prevents
                  medication errors and improves patient outcomes globally.
                </p>
                <div style={currentStyles.valuesList}>
                  {[
                    "Patient Safety",
                    "Global Access",
                    "Medical Innovation",
                    "Data Accuracy",
                  ].map((value, index) => (
                    <span key={index} style={currentStyles.valueTag}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div style={currentStyles.imageContainer}>
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Healthcare Technology"
                  style={currentStyles.missionImage}
                />
              </div>
            </div>

            {/* Achievements */}
            <div style={currentStyles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <div key={index} style={currentStyles.achievementCard}>
                  <div style={currentStyles.achievementIcon}>
                    {achievement.icon}
                  </div>
                  <div style={currentStyles.achievementNumber}>
                    {achievement.number}
                  </div>
                  <div style={currentStyles.achievementLabel}>
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "team":
        return (
          <div style={currentStyles.tabContent}>
            <div style={currentStyles.teamHeader}>
              <h3 style={currentStyles.contentTitle}>Meet Our Expert Team</h3>
              <p style={currentStyles.contentSubtitle}>
                Leading medical professionals and technology experts working
                together
              </p>
            </div>

            <div style={currentStyles.teamGrid}>
              {teamMembers.map((member, index) => (
                <div key={index} style={currentStyles.teamCard}>
                  <div style={currentStyles.memberImageContainer}>
                    <img
                      src={member.image}
                      alt={member.name}
                      style={currentStyles.memberImage}
                    />
                    <div style={currentStyles.memberBadge}>
                      <span style={currentStyles.memberBadgeIcon}>✓</span>
                    </div>
                  </div>

                  <div style={currentStyles.memberInfo}>
                    <h4 style={currentStyles.memberName}>{member.name}</h4>
                    <p style={currentStyles.memberRole}>{member.role}</p>
                    <p style={currentStyles.memberDescription}>
                      {member.description}
                    </p>

                    <div style={currentStyles.specialtiesList}>
                      {member.specialties.map((specialty, i) => (
                        <span key={i} style={currentStyles.specialtyTag}>
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "technology":
        return (
          <div style={currentStyles.tabContent}>
            <div style={currentStyles.teamHeader}>
              <h3 style={currentStyles.contentTitle}>
                Cutting-Edge Technology Stack
              </h3>
              <p style={currentStyles.contentSubtitle}>
                Built with modern technologies for reliability, speed, and
                accuracy
              </p>
            </div>

            <div style={currentStyles.techGrid}>
              <div style={currentStyles.techCard}>
                <h4 style={currentStyles.techTitle}>
                  🤖 AI & Machine Learning
                </h4>
                <p style={currentStyles.techDescription}>
                  Advanced algorithms for drug interaction detection, dosage
                  optimization, and personalized recommendations.
                </p>
                <ul style={currentStyles.techList}>
                  <li>• Neural networks for pattern recognition</li>
                  <li>• Natural language processing for drug queries</li>
                  <li>• Predictive analytics for side effects</li>
                </ul>
              </div>

              <div style={currentStyles.techCard}>
                <h4 style={currentStyles.techTitle}>☁️ Cloud Infrastructure</h4>
                <p style={currentStyles.techDescription}>
                  Scalable, secure cloud architecture ensuring 99.9% uptime and
                  global accessibility.
                </p>
                <ul style={currentStyles.techList}>
                  <li>• Multi-region deployment</li>
                  <li>• Auto-scaling infrastructure</li>
                  <li>• Real-time data synchronization</li>
                </ul>
              </div>

              <div style={currentStyles.techCard}>
                <h4 style={currentStyles.techTitle}>🔒 Security & Privacy</h4>
                <p style={currentStyles.techDescription}>
                  Enterprise-grade security protecting sensitive medical data
                  with encryption and compliance.
                </p>
                <ul style={currentStyles.techList}>
                  <li>• End-to-end encryption</li>
                  <li>• HIPAA compliance</li>
                  <li>• Zero-trust architecture</li>
                </ul>
              </div>

              <div style={currentStyles.techCard}>
                <h4 style={currentStyles.techTitle}>📊 Real-time Analytics</h4>
                <p style={currentStyles.techDescription}>
                  Live monitoring and analytics for continuous improvement and
                  instant drug safety alerts.
                </p>
                <ul style={currentStyles.techList}>
                  <li>• Real-time drug monitoring</li>
                  <li>• Instant safety alerts</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "safety":
        return (
          <div style={currentStyles.tabContent}>
            <div style={currentStyles.teamHeader}>
              <h3 style={currentStyles.contentTitle}>Safety & Trust First</h3>
              <p style={currentStyles.contentSubtitle}>
                Your safety and privacy are our top priorities
              </p>
            </div>

            {/* Certifications */}
            <div style={currentStyles.certificationsGrid}>
              {certifications.map((cert, index) => (
                <div key={index} style={currentStyles.certCard}>
                  <div style={currentStyles.certIcon}>{cert.icon}</div>
                  <h4 style={currentStyles.certName}>{cert.name}</h4>
                  <p style={currentStyles.certDescription}>
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Safety Measures */}
            <div style={currentStyles.safetyCard}>
              <h4 style={currentStyles.safetyTitle}>
                🛡️ Our Safety Commitments
              </h4>

              <div style={currentStyles.safetyGrid}>
                <div>
                  <h5 style={currentStyles.safetySubtitle}>Data Protection</h5>
                  <ul style={currentStyles.safetyList}>
                    <li>• All data encrypted in transit and at rest</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Minimal data collection principle</li>
                    <li>• User control over personal information</li>
                  </ul>
                </div>

                <div>
                  <h5 style={currentStyles.safetySubtitle}>Medical Accuracy</h5>
                  <ul style={currentStyles.safetyList}>
                    <li>• Reviewed by licensed medical professionals</li>
                    <li>• Sources from FDA, WHO, and medical journals</li>
                    <li>• Regular updates with latest research</li>
                    <li>• Clear disclaimers and limitations</li>
                  </ul>
                </div>
              </div>

              <div style={currentStyles.disclaimerBox}>
                <p style={currentStyles.disclaimerText}>
                  <strong>Medical Disclaimer:</strong> This platform provides
                  general information only and is not a substitute for
                  professional medical advice. Always consult healthcare
                  professionals for medical decisions.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="about" style={currentStyles.section}>
      <div style={currentStyles.container}>
        {/* Header */}
        <div style={currentStyles.header}>
          <div style={currentStyles.badge}>
            <span style={currentStyles.badgeIcon}></span>
            About Us
          </div>

          <h2 style={currentStyles.title}>
            Dedicated to
            <span style={currentStyles.titleHighlight}>
              Healthcare Excellence
            </span>
          </h2>

          <p style={currentStyles.subtitle}>
            Learn about our mission, team, and commitment to making healthcare
            safer and more accessible for everyone around the world.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div style={currentStyles.tabsContainer}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...currentStyles.tab,
                ...(activeTab === tab.id ? currentStyles.activeTab : {}),
              }}
            >
              <span style={currentStyles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div style={currentStyles.contentCard}>{renderTabContent()}</div>
      </div>
    </section>
  );
};

// Base styles
const baseStyles = {
  section: {
    padding: "80px 20px",
    position: "relative",
    fontFamily: "'Poppins', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 10,
  },
  header: {
    textAlign: "center",
    marginBottom: "60px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "24px",
    border: "1px solid",
  },
  badgeIcon: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    marginRight: "8px",
    animation: "pulse 2s infinite",
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
    lineHeight: "1.2",
  },
  titleHighlight: {
    display: "block",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
    opacity: 0.8,
  },
  tabsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "48px",
    padding: "8px",
    borderRadius: "16px",
    border: "1px solid",
  },
  tab: {
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    border: "none",
    background: "none",
  },
  activeTab: {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
  },
  tabIcon: {
    marginRight: "8px",
  },
  contentCard: {
    padding: "48px 32px",
    borderRadius: "24px",
    border: "1px solid",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  },
  tabContent: {
    display: "block",
  },
  missionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "48px",
    alignItems: "center",
    marginBottom: "48px",
  },
  contentTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "24px",
  },
  contentSubtitle: {
    fontSize: "18px",
    marginBottom: "24px",
    opacity: 0.8,
  },
  contentText: {
    fontSize: "18px",
    lineHeight: "1.6",
    marginBottom: "24px",
    opacity: 0.8,
  },
  valuesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  valueTag: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: "600",
  },
  imageContainer: {
    position: "relative",
  },
  missionImage: {
    width: "100%",
    height: "320px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  },
  achievementsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    marginTop: "48px",
  },
  achievementCard: {
    textAlign: "center",
    padding: "32px 20px",
    borderRadius: "16px",
    border: "1px solid",
  },
  achievementIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  achievementNumber: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#28a745",
    marginBottom: "8px",
  },
  achievementLabel: {
    fontSize: "14px",
    fontWeight: "500",
  },
  teamHeader: {
    textAlign: "center",
    marginBottom: "48px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  teamCard: {
    padding: "32px 24px",
    borderRadius: "20px",
    border: "1px solid",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  memberImageContainer: {
    position: "relative",
    marginBottom: "24px",
  },
  memberImage: {
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #28a745",
    margin: "0 auto",
    display: "block",
  },
  memberBadge: {
    position: "absolute",
    bottom: "-8px",
    right: "calc(50% - 48px - 8px)",
    width: "32px",
    height: "32px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  memberBadgeIcon: {
    color: "white",
    fontSize: "14px",
  },
  memberInfo: {
    textAlign: "center",
  },
  memberName: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  memberRole: {
    color: "#28a745",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  memberDescription: {
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "16px",
    opacity: 0.8,
  },
  specialtiesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center",
  },
  specialtyTag: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "500",
    borderRadius: "50px",
  },
  techGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  techCard: {
    padding: "32px 24px",
    borderRadius: "16px",
    border: "1px solid",
  },
  techTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  techDescription: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "16px",
    opacity: 0.8,
  },
  techList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.8",
  },
  certificationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  certCard: {
    textAlign: "center",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid",
    transition: "transform 0.3s ease",
    cursor: "pointer",
  },
  certIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  certName: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  certDescription: {
    fontSize: "14px",
    opacity: 0.8,
  },
  safetyCard: {
    padding: "32px",
    borderRadius: "24px",
    border: "1px solid",
  },
  safetyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "24px",
  },
  safetyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  safetySubtitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#28a745",
    marginBottom: "12px",
  },
  safetyList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.8",
  },
  disclaimerBox: {
    marginTop: "24px",
    padding: "16px",
    borderRadius: "12px",
  },
  disclaimerText: {
    fontSize: "14px",
    margin: 0,
  },
};

// Light theme styles
const lightStyles = {
  ...baseStyles,
  section: {
    ...baseStyles.section,
    backgroundColor: "#ffffff",
  },
  badge: {
    ...baseStyles.badge,
    backgroundColor: "#e8f5e8",
    color: "#28a745",
    borderColor: "#c3e6c3",
  },
  title: {
    ...baseStyles.title,
    color: "#333",
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: "#666",
  },
  tabsContainer: {
    ...baseStyles.tabsContainer,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  tab: {
    ...baseStyles.tab,
    color: "#666",
  },
  contentCard: {
    ...baseStyles.contentCard,
    backgroundColor: "white",
    borderColor: "#e9ecef",
  },
  contentTitle: {
    ...baseStyles.contentTitle,
    color: "#333",
  },
  contentSubtitle: {
    ...baseStyles.contentSubtitle,
    color: "#666",
  },
  contentText: {
    ...baseStyles.contentText,
    color: "#666",
  },
  achievementCard: {
    ...baseStyles.achievementCard,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  achievementLabel: {
    ...baseStyles.achievementLabel,
    color: "#666",
  },
  teamCard: {
    ...baseStyles.teamCard,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  memberName: {
    ...baseStyles.memberName,
    color: "#333",
  },
  memberDescription: {
    ...baseStyles.memberDescription,
    color: "#666",
  },
  specialtyTag: {
    ...baseStyles.specialtyTag,
    backgroundColor: "#e9ecef",
    color: "#666",
  },
  techCard: {
    ...baseStyles.techCard,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  techTitle: {
    ...baseStyles.techTitle,
    color: "#333",
  },
  techDescription: {
    ...baseStyles.techDescription,
    color: "#666",
  },
  techList: {
    ...baseStyles.techList,
    color: "#666",
  },
  certCard: {
    ...baseStyles.certCard,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  certName: {
    ...baseStyles.certName,
    color: "#333",
  },
  certDescription: {
    ...baseStyles.certDescription,
    color: "#666",
  },
  safetyCard: {
    ...baseStyles.safetyCard,
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  safetyTitle: {
    ...baseStyles.safetyTitle,
    color: "#333",
  },
  safetyList: {
    ...baseStyles.safetyList,
    color: "#666",
  },
  disclaimerBox: {
    ...baseStyles.disclaimerBox,
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
  },
  disclaimerText: {
    ...baseStyles.disclaimerText,
    color: "#856404",
  },
};

// Dark theme styles
const darkStyles = {
  ...baseStyles,
  section: {
    ...baseStyles.section,
    backgroundColor: "#1a1a1a",
  },
  badge: {
    ...baseStyles.badge,
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    color: "#4ade80",
    borderColor: "rgba(40, 167, 69, 0.3)",
  },
  title: {
    ...baseStyles.title,
    color: "#fff",
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: "#b0b0b0",
  },
  tabsContainer: {
    ...baseStyles.tabsContainer,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
  },
  tab: {
    ...baseStyles.tab,
    color: "#b0b0b0",
  },
  contentCard: {
    ...baseStyles.contentCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  },
  contentTitle: {
    ...baseStyles.contentTitle,
    color: "#fff",
  },
  contentSubtitle: {
    ...baseStyles.contentSubtitle,
    color: "#b0b0b0",
  },
  contentText: {
    ...baseStyles.contentText,
    color: "#b0b0b0",
  },
  achievementCard: {
    ...baseStyles.achievementCard,
    backgroundColor: "#3d3d3d",
    borderColor: "#404040",
  },
  achievementLabel: {
    ...baseStyles.achievementLabel,
    color: "#b0b0b0",
  },
  teamCard: {
    ...baseStyles.teamCard,
    backgroundColor: "#3d3d3d",
    borderColor: "#404040",
  },
  memberName: {
    ...baseStyles.memberName,
    color: "#fff",
  },
  memberDescription: {
    ...baseStyles.memberDescription,
    color: "#b0b0b0",
  },
  specialtyTag: {
    ...baseStyles.specialtyTag,
    backgroundColor: "#404040",
    color: "#b0b0b0",
  },
  techCard: {
    ...baseStyles.techCard,
    backgroundColor: "#3d3d3d",
    borderColor: "#404040",
  },
  techTitle: {
    ...baseStyles.techTitle,
    color: "#fff",
  },
  techDescription: {
    ...baseStyles.techDescription,
    color: "#b0b0b0",
  },
  techList: {
    ...baseStyles.techList,
    color: "#b0b0b0",
  },
  certCard: {
    ...baseStyles.certCard,
    backgroundColor: "#3d3d3d",
    borderColor: "#404040",
  },
  certName: {
    ...baseStyles.certName,
    color: "#fff",
  },
  certDescription: {
    ...baseStyles.certDescription,
    color: "#b0b0b0",
  },
  safetyCard: {
    ...baseStyles.safetyCard,
    backgroundColor: "#3d3d3d",
    borderColor: "#404040",
  },
  safetyTitle: {
    ...baseStyles.safetyTitle,
    color: "#fff",
  },
  safetyList: {
    ...baseStyles.safetyList,
    color: "#b0b0b0",
  },
  disclaimerBox: {
    ...baseStyles.disclaimerBox,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
  disclaimerText: {
    ...baseStyles.disclaimerText,
    color: "#fbbf24",
  },
};

// Add CSS for animations
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    [style*="cursor: pointer"]:hover {
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .missionGrid {
        grid-template-columns: 1fr !important;
      }
      
      .teamGrid {
        grid-template-columns: 1fr !important;
      }
      
      .techGrid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default About;
