"use client";

import { useState, useEffect } from "react";

export default function TermsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');
  const [readingProgress, setReadingProgress] = useState(0);

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Table of contents data
  const sections = [
    { id: 'introduction', title: 'Introduction', icon: '📋' },
    { id: 'acceptance', title: 'Acceptance of Terms', icon: '✅' },
    { id: 'medical-disclaimer', title: 'Medical Disclaimer', icon: '⚠️' },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: '👤' },
    { id: 'service-description', title: 'Service Description', icon: '💊' },
    { id: 'data-usage', title: 'Data Usage', icon: '📊' },
    { id: 'prohibited-uses', title: 'Prohibited Uses', icon: '🚫' },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: '©️' },
    { id: 'limitation-liability', title: 'Limitation of Liability', icon: '⚖️' },
    { id: 'termination', title: 'Termination', icon: '🔚' },
    { id: 'changes', title: 'Changes to Terms', icon: '🔄' },
    { id: 'contact', title: 'Contact Information', icon: '📞' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>

      
      <div style={currentStyles.container}>
        {/* Reading Progress Bar */}
        <div style={currentStyles.progressBar}>
          <div 
            style={{
              ...currentStyles.progressFill,
              width: `${readingProgress}%`
            }}
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={currentStyles.themeToggle}
          aria-label="Toggle theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Hero Header */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <button 
                onClick={() => window.history.back()}
                style={currentStyles.backButton}
              >
                ← Back to Home
              </button>
              
              <div style={currentStyles.heroIcon}>⚖️</div>
              
              <h1 style={currentStyles.heroTitle}>
                Terms & Conditions
              </h1>
              
              <p style={currentStyles.heroSubtitle}>
                Comprehensive terms governing your use of MediChecker
              </p>
              
              <div style={currentStyles.heroMeta}>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>📅</span>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>⏱️</span>
                  <span>~12 min read</span>
                </div>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>🌐</span>
                  <span>Applies globally</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={currentStyles.mainContent}>
          
          {/* Table of Contents Sidebar */}
          <div style={currentStyles.sidebar}>
            <div style={currentStyles.tocContainer}>
              <h3 style={currentStyles.tocTitle}>Table of Contents</h3>
              <nav style={currentStyles.tocNav}>
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    style={{
                      ...currentStyles.tocItem,
                      ...(activeSection === section.id ? currentStyles.tocItemActive : {})
                    }}
                  >
                    <span style={currentStyles.tocIcon}>{section.icon}</span>
                    <span style={currentStyles.tocText}>
                      {index + 1}. {section.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div style={currentStyles.contentArea}>
            <div style={currentStyles.contentContainer}>
              
              {/* Introduction */}
              <section id="introduction" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>📋</span>
                    1. Introduction
                  </h2>
                  <div style={currentStyles.sectionBadge}>Essential</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    Welcome to <strong>MediChecker</strong>, your trusted healthcare companion for medicine verification and health management. These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and MediChecker (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                  </p>
                  <div style={currentStyles.highlightBox}>
                    <h4 style={currentStyles.highlightTitle}>🎯 Key Points</h4>
                    <ul style={currentStyles.highlightList}>
                      <li>By using MediChecker, you accept these terms in full</li>
                      <li>Our service is designed to assist, not replace, medical professionals</li>
                      <li>We prioritize your privacy and data security</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Acceptance of Terms */}
              <section id="acceptance" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>✅</span>
                    2. Acceptance of Terms
                  </h2>
                  <div style={currentStyles.sectionBadge}>Legal</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    By accessing, browsing, or using MediChecker in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                  <div style={currentStyles.infoBox}>
                    <p style={currentStyles.infoText}>
                      <strong>💡 Important:</strong> If you do not agree to these terms, please discontinue use of our service immediately.
                    </p>
                  </div>
                </div>
              </section>

              {/* Medical Disclaimer */}
              <section id="medical-disclaimer" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>⚠️</span>
                    3. Medical Disclaimer
                  </h2>
                  <div style={currentStyles.sectionBadge}>Critical</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <div style={currentStyles.criticalWarning}>
                    <div style={currentStyles.warningHeader}>
                      <span style={currentStyles.warningIcon}>🚨</span>
                      <h4 style={currentStyles.warningTitle}>MEDICAL DISCLAIMER</h4>
                    </div>
                    <div style={currentStyles.warningContent}>
                      <p style={currentStyles.warningText}>
                        <strong>MediChecker is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong> All information provided is for educational and informational purposes only.
                      </p>
                      <ul style={currentStyles.warningList}>
                        <li>Always consult qualified healthcare professionals</li>
                        <li>Never disregard professional medical advice</li>
                        <li>Seek immediate medical attention for emergencies</li>
                        <li>Do not stop medications without doctor consultation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div style={currentStyles.emergencyBox}>
                    <h4 style={currentStyles.emergencyTitle}>🚑 Emergency Situations</h4>
                    <p style={currentStyles.emergencyText}>
                      In case of medical emergencies, immediately contact your local emergency services (911 in the US) or go to the nearest emergency room.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section id="user-responsibilities" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>👤</span>
                    4. User Responsibilities
                  </h2>
                  <div style={currentStyles.sectionBadge}>Important</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    As a user of MediChecker, you agree to:
                  </p>
                  
                  <div style={currentStyles.responsibilityGrid}>
                    <div style={currentStyles.responsibilityCard}>
                      <div style={currentStyles.cardIcon}>📝</div>
                      <h4 style={currentStyles.cardTitle}>Accurate Information</h4>
                      <p style={currentStyles.cardText}>Provide truthful and accurate information about medications and health conditions.</p>
                    </div>
                    
                    <div style={currentStyles.responsibilityCard}>
                      <div style={currentStyles.cardIcon}>🔒</div>
                      <h4 style={currentStyles.cardTitle}>Account Security</h4>
                      <p style={currentStyles.cardText}>Maintain the confidentiality of your account credentials and notify us of unauthorized access.</p>
                    </div>
                    
                    <div style={currentStyles.responsibilityCard}>
                      <div style={currentStyles.cardIcon}>⚖️</div>
                      <h4 style={currentStyles.cardTitle}>Lawful Use</h4>
                      <p style={currentStyles.cardText}>Use our service only for lawful purposes and in accordance with these Terms.</p>
                    </div>
                    
                    <div style={currentStyles.responsibilityCard}>
                      <div style={currentStyles.cardIcon}>🤝</div>
                      <h4 style={currentStyles.cardTitle}>Respectful Conduct</h4>
                      <p style={currentStyles.cardText}>Treat other users and our team with respect and professionalism.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Service Description */}
              <section id="service-description" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>💊</span>
                    5. Service Description
                  </h2>
                  <div style={currentStyles.sectionBadge}>Features</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    MediChecker provides the following services:
                  </p>
                  
                  <div style={currentStyles.featureList}>
                    <div style={currentStyles.featureItem}>
                      <span style={currentStyles.featureIcon}>🔍</span>
                      <div style={currentStyles.featureContent}>
                        <h4 style={currentStyles.featureTitle}>Medicine Verification</h4>
                        <p style={currentStyles.featureDesc}>Comprehensive database search and verification of medications using FDA and RxNav APIs.</p>
                      </div>
                    </div>
                    
                    <div style={currentStyles.featureItem}>
                      <span style={currentStyles.featureIcon}>⚠️</span>
                      <div style={currentStyles.featureContent}>
                        <h4 style={currentStyles.featureTitle}>Drug Interaction Checking</h4>
                        <p style={currentStyles.featureDesc}>Real-time analysis of potential drug interactions and contraindications.</p>
                      </div>
                    </div>
                    
                    <div style={currentStyles.featureItem}>
                      <span style={currentStyles.featureIcon}>📱</span>
                      <div style={currentStyles.featureContent}>
                        <h4 style={currentStyles.featureTitle}>Mobile-First Design</h4>
                        <p style={currentStyles.featureDesc}>Responsive design optimized for smartphones, tablets, and desktop devices.</p>
                      </div>
                    </div>
                    
                    <div style={currentStyles.featureItem}>
                      <span style={currentStyles.featureIcon}>🔔</span>
                      <div style={currentStyles.featureContent}>
                        <h4 style={currentStyles.featureTitle}>Safety Alerts</h4>
                        <p style={currentStyles.featureDesc}>Important medication recalls and safety notifications from health authorities.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prohibited Uses */}
              <section id="prohibited-uses" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>🚫</span>
                    6. Prohibited Uses
                  </h2>
                  <div style={currentStyles.sectionBadge}>Restrictions</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <div style={currentStyles.prohibitedBox}>
                    <h4 style={currentStyles.prohibitedTitle}>❌ You may NOT use MediChecker to:</h4>
                    <ul style={currentStyles.prohibitedList}>
                      <li>Provide medical advice or diagnosis to others</li>
                      <li>Share prescription medications or controlled substances</li>
                      <li>Attempt to hack, breach, or compromise our security</li>
                      <li>Upload malicious code or viruses</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Impersonate healthcare professionals</li>
                      <li>Collect user data without permission</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>📞</span>
                    12. Contact Information
                  </h2>
                  <div style={currentStyles.sectionBadge}>Support</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    For questions about these Terms of Service, please contact us:
                  </p>
                  
                  <div style={currentStyles.contactGrid}>
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📧</div>
                      <h4 style={currentStyles.contactTitle}>Email Support</h4>
                      <p style={currentStyles.contactText}>legal@medichecker.com</p>
                      <span style={currentStyles.contactNote}>Response within 24 hours</span>
                    </div>
                    
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📞</div>
                      <h4 style={currentStyles.contactTitle}>Phone Support</h4>
                      <p style={currentStyles.contactText}>+1 (555) 123-4567</p>
                      <span style={currentStyles.contactNote}>Mon-Fri, 9 AM - 6 PM EST</span>
                    </div>
                    
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📍</div>
                      <h4 style={currentStyles.contactTitle}>Mailing Address</h4>
                      <p style={currentStyles.contactText}>
                        MediChecker Legal Dept.<br />
                        123 Healthcare Ave<br />
                        Medical District, MD 12345
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Agreement Footer */}
              <div style={currentStyles.agreementFooter}>
                <div style={currentStyles.agreementContent}>
                  <h3 style={currentStyles.agreementTitle}>✅ Agreement Confirmation</h3>
                  <p style={currentStyles.agreementText}>
                    By continuing to use MediChecker, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                  </p>
                  <div style={currentStyles.agreementButtons}>
                    <button style={currentStyles.agreeButton}>
                      I Understand and Agree
                    </button>
                    <button style={currentStyles.printButton}>
                      📄 Print Terms
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Enhanced Styles with Modern Design
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    position: "relative"
  },
  progressBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    zIndex: 1001
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #28a745, #20c997)",
    transition: "width 0.2s ease"
  },
  themeToggle: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 1000,
    background: "rgba(255, 255, 255, 0.9)",
    border: "none",
    borderRadius: "50%",
    width: "56px",
    height: "56px",
    fontSize: "24px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  },
  hero: {
    minHeight: "60vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  heroBackground: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: "100%",
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  heroContent: {
    textAlign: "center",
    color: "white",
    maxWidth: "800px",
    padding: "40px 20px",
    position: "relative"
  },
  backButton: {
    position: "absolute",
    top: "-20px",
    left: "20px",
    background: "rgba(255,255,255,0.2)",
    border: "2px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)"
  },
  heroIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    display: "block"
  },
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 64px)",
    fontWeight: "800",
    marginBottom: "20px",
    lineHeight: "1.1",
    textShadow: "0 4px 20px rgba(0,0,0,0.3)"
  },
  heroSubtitle: {
    fontSize: "18px",
    opacity: 0.9,
    marginBottom: "30px",
    fontWeight: "300"
  },
  heroMeta: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap"
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    opacity: 0.8
  },
  metaIcon: {
    fontSize: "16px"
  },
  mainContent: {
    display: "flex",
    maxWidth: "1400px",
    margin: "0 auto",
    gap: "40px",
    padding: "40px 20px"
  },
  sidebar: {
    minWidth: "300px",
    position: "sticky",
    top: "20px",
    height: "fit-content"
  },
  tocContainer: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef"
  },
  tocTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#28a745"
  },
  tocNav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  tocItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    fontSize: "14px"
  },
  tocItemActive: {
    backgroundColor: "#28a745",
    color: "white"
  },
  tocIcon: {
    fontSize: "16px",
    minWidth: "20px"
  },
  tocText: {
    fontWeight: "500"
  },
  contentArea: {
    flex: 1,
    minWidth: 0
  },
  contentContainer: {
    maxWidth: "800px"
  },
  section: {
    marginBottom: "60px",
    scroll: "smooth"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "16px"
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#28a745",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: 0
  },
  sectionIcon: {
    fontSize: "32px"
  },
  sectionBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#28a745",
    color: "white"
  },
  sectionContent: {
    lineHeight: "1.8"
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "20px"
  },
  highlightBox: {
    padding: "24px",
    borderRadius: "12px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #28a745",
    marginBottom: "24px"
  },
  highlightTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e7e34",
    marginBottom: "16px",
    margin: 0
  },
  highlightList: {
    margin: 0,
    paddingLeft: "20px"
  },
  infoBox: {
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#d1ecf1",
    border: "1px solid #bee5eb",
    marginBottom: "20px"
  },
  infoText: {
    color: "#0c5460",
    margin: 0,
    fontSize: "15px"
  },
  criticalWarning: {
    padding: "30px",
    borderRadius: "16px",
    backgroundColor: "#f8d7da",
    border: "2px solid #dc3545",
    marginBottom: "30px"
  },
  warningHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  },
  warningIcon: {
    fontSize: "24px"
  },
  warningTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#721c24",
    margin: 0
  },
  warningContent: {},
  warningText: {
    color: "#721c24",
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "16px"
  },
  warningList: {
    color: "#721c24",
    margin: 0,
    paddingLeft: "20px"
  },
  emergencyBox: {
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    marginTop: "20px"
  },
  emergencyTitle: {
    color: "#856404",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  emergencyText: {
    color: "#856404",
    margin: 0,
    fontSize: "15px"
  },
  responsibilityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  responsibilityCard: {
    padding: "24px",
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    textAlign: "center",
    transition: "transform 0.2s ease"
  },
  cardIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  cardText: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
    lineHeight: "1.6"
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  featureItem: {
    display: "flex",
    gap: "16px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef"
  },
  featureIcon: {
    fontSize: "24px",
    minWidth: "32px"
  },
  featureContent: {},
  featureTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    margin: 0
  },
  featureDesc: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
    lineHeight: "1.6"
  },
  prohibitedBox: {
    padding: "24px",
    borderRadius: "12px",
    backgroundColor: "#f8d7da",
    border: "2px solid #dc3545"
  },
  prohibitedTitle: {
    color: "#721c24",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    margin: 0
  },
  prohibitedList: {
    color: "#721c24",
    margin: 0,
    paddingLeft: "20px",
    lineHeight: "1.8"
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginTop: "24px"
  },
  contactCard: {
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    textAlign: "center"
  },
  contactIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  contactTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  contactText: {
    fontSize: "14px",
    marginBottom: "8px",
    lineHeight: "1.6"
  },
  contactNote: {
    fontSize: "12px",
    color: "#6c757d",
    fontStyle: "italic"
  },
  agreementFooter: {
    marginTop: "60px",
    padding: "40px",
    borderRadius: "20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #28a745",
    textAlign: "center"
  },
  agreementContent: {},
  agreementTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e7e34",
    marginBottom: "16px"
  },
  agreementText: {
    fontSize: "16px",
    color: "#155724",
    marginBottom: "24px",
    lineHeight: "1.6"
  },
  agreementButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  agreeButton: {
    padding: "14px 28px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  printButton: {
    padding: "14px 28px",
    backgroundColor: "transparent",
    color: "#28a745",
    border: "2px solid #28a745",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  }
};

// Light Theme Styles
const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#ffffff",
    color: "#333333"
  },
  tocContainer: {
    ...baseStyles.tocContainer,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef"
  },
  tocItem: {
    ...baseStyles.tocItem,
    color: "#495057"
  },
  responsibilityCard: {
    ...baseStyles.responsibilityCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  featureItem: {
    ...baseStyles.featureItem,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  contactCard: {
    ...baseStyles.contactCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  }
};

// Dark Theme Styles
const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff"
  },
  tocContainer: {
    ...baseStyles.tocContainer,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  tocItem: {
    ...baseStyles.tocItem,
    color: "#e9ecef"
  },
  tocItemActive: {
    ...baseStyles.tocItemActive,
    backgroundColor: "#28a745",
    color: "white"
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
    color: "#4ade80"
  },
  paragraph: {
    ...baseStyles.paragraph,
    color: "#e9ecef"
  },
  highlightBox: {
    ...baseStyles.highlightBox,
    backgroundColor: "#1a2d1a",
    borderColor: "#28a745"
  },
  highlightTitle: {
    ...baseStyles.highlightTitle,
    color: "#4ade80"
  },
  infoBox: {
    ...baseStyles.infoBox,
    backgroundColor: "#1a2a2d",
    borderColor: "#28a745"
  },
  infoText: {
    ...baseStyles.infoText,
    color: "#4ade80"
  },
  criticalWarning: {
    ...baseStyles.criticalWarning,
    backgroundColor: "#2d1a1a",
    borderColor: "#dc3545"
  },
  warningTitle: {
    ...baseStyles.warningTitle,
    color: "#ff6b6b"
  },
  warningText: {
    ...baseStyles.warningText,
    color: "#ff6b6b"
  },
  warningList: {
    ...baseStyles.warningList,
    color: "#ff6b6b"
  },
  emergencyBox: {
    ...baseStyles.emergencyBox,
    backgroundColor: "#2d2a1a",
    borderColor: "#ffc107"
  },
  emergencyTitle: {
    ...baseStyles.emergencyTitle,
    color: "#ffd60a"
  },
  emergencyText: {
    ...baseStyles.emergencyText,
    color: "#ffd60a"
  },
  responsibilityCard: {
    ...baseStyles.responsibilityCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  cardText: {
    ...baseStyles.cardText,
    color: "#b0b0b0"
  },
  featureItem: {
    ...baseStyles.featureItem,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  featureDesc: {
    ...baseStyles.featureDesc,
    color: "#b0b0b0"
  },
  prohibitedBox: {
    ...baseStyles.prohibitedBox,
    backgroundColor: "#2d1a1a",
    borderColor: "#dc3545"
  },
  prohibitedTitle: {
    ...baseStyles.prohibitedTitle,
    color: "#ff6b6b"
  },
  prohibitedList: {
    ...baseStyles.prohibitedList,
    color: "#ff6b6b"
  },
  contactCard: {
    ...baseStyles.contactCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  contactNote: {
    ...baseStyles.contactNote,
    color: "#b0b0b0"
  },
  agreementFooter: {
    ...baseStyles.agreementFooter,
    backgroundColor: "#1a2d1a",
    borderColor: "#28a745"
  },
  agreementTitle: {
    ...baseStyles.agreementTitle,
    color: "#4ade80"
  },
  agreementText: {
    ...baseStyles.agreementText,
    color: "#4ade80"
  }
};

// Add responsive CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 1024px) {
      .main-content {
        flex-direction: column !important;
        gap: 20px !important;
      }
      
      .sidebar {
        position: relative !important;
        min-width: auto !important;
      }
      
      .toc-container {
        position: sticky !important;
        top: 20px !important;
      }
    }
    
    @media (max-width: 768px) {
      .hero-meta {
        flex-direction: column !important;
        gap: 15px !important;
      }
      
      .back-button {
        position: relative !important;
        margin-bottom: 20px !important;
      }
      
      .responsibility-grid,
      .contact-grid {
        grid-template-columns: 1fr !important;
      }
      
      .agreement-buttons {
        flex-direction: column !important;
      }
      
      .section-header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
    }
    
    .theme-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.15);
    }
    
    .back-button:hover {
      background: rgba(255,255,255,0.3) !important;
      transform: translateY(-2px);
    }
    
    .toc-item:hover:not(.toc-item-active) {
      background-color: rgba(40, 167, 69, 0.1) !important;
      transform: translateX(4px);
    }
    
    .responsibility-card:hover,
    .feature-item:hover,
    .contact-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .agree-button:hover {
      background-color: #218838 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }
    
    .print-button:hover {
      background-color: #28a745 !important;
      color: white !important;
      transform: translateY(-2px);
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .section {
      animation: fadeInUp 0.6s ease forwards;
    }
  `;
  document.head.appendChild(style);
}