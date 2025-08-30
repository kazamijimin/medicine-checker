"use client";

import { useState, useEffect } from "react";

export default function PrivacyPage() {
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
    { id: 'introduction', title: 'Introduction', icon: '🛡️' },
    { id: 'information-collect', title: 'Information We Collect', icon: '📋' },
    { id: 'how-we-use', title: 'How We Use Your Data', icon: '⚙️' },
    { id: 'information-sharing', title: 'Information Sharing', icon: '🔗' },
    { id: 'data-security', title: 'Data Security', icon: '🔒' },
    { id: 'data-retention', title: 'Data Retention', icon: '📅' },
    { id: 'your-rights', title: 'Your Privacy Rights', icon: '👤' },
    { id: 'cookies', title: 'Cookies & Tracking', icon: '🍪' },
    { id: 'international', title: 'International Transfers', icon: '🌍' },
    { id: 'children', title: 'Children&apos;s Privacy', icon: '👶' }, // FIXED
    { id: 'policy-changes', title: 'Policy Changes', icon: '🔄' },
    { id: 'contact', title: 'Contact Us', icon: '📞' }
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
              
              <div style={currentStyles.heroIcon}>🛡️</div>
              
              <h1 style={currentStyles.heroTitle}>
                Privacy Policy
              </h1>
              
              <p style={currentStyles.heroSubtitle}>
                Your privacy and data protection are our top priorities
              </p>
              
              <div style={currentStyles.heroMeta}>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>📅</span>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>⏱️</span>
                  <span>~15 min read</span>
                </div>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>🔒</span>
                  <span>HIPAA Compliant</span>
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
              <h3 style={currentStyles.tocTitle}>Quick Navigation</h3>
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
                    <span style={currentStyles.sectionIcon}>🛡️</span>
                    1. Introduction
                  </h2>
                  <div style={currentStyles.sectionBadge}>Essential</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    At <strong>MediChecker</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medicine verification and health management services.
                  </p>
                  <div style={currentStyles.highlightBox}>
                    <h4 style={currentStyles.highlightTitle}>🎯 Privacy Commitment</h4>
                    <ul style={currentStyles.highlightList}>
                      <li>We never sell your personal or health information</li>
                      <li>Your medical data is encrypted with bank-level security</li>
                      <li>You have complete control over your data</li>
                      <li>We comply with HIPAA, GDPR, and other privacy laws</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="information-collect" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>📋</span>
                    2. Information We Collect
                  </h2>
                  <div style={currentStyles.sectionBadge}>Data Types</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  
                  {/* Personal Information */}
                  <div style={currentStyles.dataCategory}>
                    <h3 style={currentStyles.categoryTitle}>
                      <span style={currentStyles.categoryIcon}>👤</span>
                      Personal Information
                    </h3>
                    <div style={currentStyles.dataGrid}>
                      <div style={currentStyles.dataCard}>
                        <div style={currentStyles.dataIcon}>📝</div>
                        <h4 style={currentStyles.dataTitle}>Basic Details</h4>
                        <ul style={currentStyles.dataList}>
                          <li>Full name</li>
                          <li>Email address</li>
                          <li>Phone number (optional)</li>
                          <li>Date of birth</li>
                        </ul>
                      </div>
                      <div style={currentStyles.dataCard}>
                        <div style={currentStyles.dataIcon}>🔐</div>
                        <h4 style={currentStyles.dataTitle}>Account Data</h4>
                        <ul style={currentStyles.dataList}>
                          <li>Login credentials (encrypted)</li>
                          <li>Profile preferences</li>
                          <li>Security settings</li>
                          <li>Profile picture (optional)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Health Information */}
                  <div style={currentStyles.dataCategory}>
                    <h3 style={currentStyles.categoryTitle}>
                      <span style={currentStyles.categoryIcon}>🏥</span>
                      Health Information
                    </h3>
                    <div style={currentStyles.criticalWarning}>
                      <div style={currentStyles.warningHeader}>
                        <span style={currentStyles.warningIcon}>🔒</span>
                        <h4 style={currentStyles.warningTitle}>PROTECTED HEALTH DATA</h4>
                      </div>
                      <p style={currentStyles.warningText}>
                        All health information is <strong>encrypted, anonymized, and stored securely</strong>. We never share your health data without explicit consent.
                      </p>
                    </div>
                    <div style={currentStyles.healthGrid}>
                      <div style={currentStyles.healthCard}>
                        <span style={currentStyles.healthIcon}>💊</span>
                        <div style={currentStyles.healthContent}>
                          <h4 style={currentStyles.healthTitle}>Medications</h4>
                          <p style={currentStyles.healthDesc}>Current medicines, dosages, and prescription history</p>
                        </div>
                      </div>
                      <div style={currentStyles.healthCard}>
                        <span style={currentStyles.healthIcon}>⚠️</span>
                        <div style={currentStyles.healthContent}>
                          <h4 style={currentStyles.healthTitle}>Allergies</h4>
                          <p style={currentStyles.healthDesc}>Drug allergies and adverse reactions</p>
                        </div>
                      </div>
                      <div style={currentStyles.healthCard}>
                        <span style={currentStyles.healthIcon}>📊</span>
                        <div style={currentStyles.healthContent}>
                          <h4 style={currentStyles.healthTitle}>Health Tracking</h4>
                          <p style={currentStyles.healthDesc}>Symptoms, vitals, and wellness data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Data */}
                  <div style={currentStyles.dataCategory}>
                    <h3 style={currentStyles.categoryTitle}>
                      <span style={currentStyles.categoryIcon}>📱</span>
                      Usage & Technical Data
                    </h3>
                    <div style={currentStyles.technicalGrid}>
                      <div style={currentStyles.techItem}>
                        <span style={currentStyles.techIcon}>🖥️</span>
                        <span>Device & browser information</span>
                      </div>
                      <div style={currentStyles.techItem}>
                        <span style={currentStyles.techIcon}>🌐</span>
                        <span>IP address & location data</span>
                      </div>
                      <div style={currentStyles.techItem}>
                        <span style={currentStyles.techIcon}>📈</span>
                        <span>App usage and performance</span>
                      </div>
                      <div style={currentStyles.techItem}>
                        <span style={currentStyles.techIcon}>🔍</span>
                        <span>Search queries & interactions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section id="how-we-use" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>⚙️</span>
                    3. How We Use Your Information
                  </h2>
                  <div style={currentStyles.sectionBadge}>Purpose</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <div style={currentStyles.usageGrid}>
                    <div style={currentStyles.usageCard}>
                      <div style={currentStyles.usageIcon}>🏥</div>
                      <h4 style={currentStyles.usageTitle}>Healthcare Services</h4>
                      <ul style={currentStyles.usageList}>
                        <li>Medicine verification & safety checks</li>
                        <li>Drug interaction analysis</li>
                        <li>Personalized health recommendations</li>
                        <li>Medication reminders & alerts</li>
                      </ul>
                    </div>
                    
                    <div style={currentStyles.usageCard}>
                      <div style={currentStyles.usageIcon}>💬</div>
                      <h4 style={currentStyles.usageTitle}>Communication</h4>
                      <ul style={currentStyles.usageList}>
                        <li>Important safety notifications</li>
                        <li>Service updates & announcements</li>
                        <li>Customer support assistance</li>
                        <li>Emergency health alerts</li>
                      </ul>
                    </div>
                    
                    <div style={currentStyles.usageCard}>
                      <div style={currentStyles.usageIcon}>🔧</div>
                      <h4 style={currentStyles.usageTitle}>Platform Improvement</h4>
                      <ul style={currentStyles.usageList}>
                        <li>Enhance user experience</li>
                        <li>Improve safety algorithms</li>
                        <li>Conduct anonymized research</li>
                        <li>Prevent fraud & abuse</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>4. Information Sharing and Disclosure</h2>
                
                <div style={currentStyles.warningBox}>
                  <p style={currentStyles.warningText}>
                    <strong>We DO NOT sell your personal information.</strong> Your health data is particularly sensitive and is protected with the highest security standards.
                  </p>
                </div>

                <p style={currentStyles.paragraph}>
                  We may share your information only in the following limited circumstances:
                </p>

                <h3 style={currentStyles.subTitle}>4.1 With Your Consent</h3>
                <ul style={currentStyles.list}>
                  <li>When you authorize sharing with healthcare providers</li>
                  <li>When you choose to share data with family members</li>
                  <li>For emergency medical situations (with emergency contacts)</li>
                </ul>

                <h3 style={currentStyles.subTitle}>4.2 Service Providers</h3>
                <ul style={currentStyles.list}>
                  <li>Cloud hosting providers (AWS, Google Cloud)</li>
                  <li>Database services (Firebase, encrypted)</li>
                  <li>Email service providers (for notifications only)</li>
                  <li>Analytics providers (anonymized data only)</li>
                </ul>

                <h3 style={currentStyles.subTitle}>4.3 Legal Requirements</h3>
                <ul style={currentStyles.list}>
                  <li>When required by law or court order</li>
                  <li>To protect our rights or property</li>
                  <li>In case of medical emergencies</li>
                  <li>To prevent fraud or abuse</li>
                </ul>
              </section>

              {/* Data Security */}
              <section id="data-security" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>🔒</span>
                    5. Data Security
                  </h2>
                  <div style={currentStyles.sectionBadge}>Protection</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <div style={currentStyles.securityOverview}>
                    <h3 style={currentStyles.securityTitle}>🛡️ Multi-Layer Security Protection</h3>
                    <p style={currentStyles.securityDesc}>
                      Your health data deserves the highest level of protection. We implement enterprise-grade security measures used by hospitals and financial institutions.
                    </p>
                  </div>
                  
                  <div style={currentStyles.securityGrid}>
                    <div style={currentStyles.securityCard}>
                      <div style={currentStyles.securityIcon}>🔐</div>
                      <h4 style={currentStyles.securityCardTitle}>Encryption</h4>
                      <p style={currentStyles.securityCardText}>
                        AES-256 encryption for data at rest, TLS 1.3 for data in transit
                      </p>
                    </div>
                    
                    <div style={currentStyles.securityCard}>
                      <div style={currentStyles.securityIcon}>🔑</div>
                      <h4 style={currentStyles.securityCardTitle}>Access Control</h4>
                      <p style={currentStyles.securityCardText}>
                        Multi-factor authentication and role-based access controls
                      </p>
                    </div>
                    
                    <div style={currentStyles.securityCard}>
                      <div style={currentStyles.securityIcon}>🔍</div>
                      <h4 style={currentStyles.securityCardTitle}>Monitoring</h4>
                      <p style={currentStyles.securityCardText}>
                        24/7 security monitoring and automated threat detection
                      </p>
                    </div>
                    
                    <div style={currentStyles.securityCard}>
                      <div style={currentStyles.securityIcon}>✅</div>
                      <h4 style={currentStyles.securityCardTitle}>Compliance</h4>
                      <p style={currentStyles.securityCardText}>
                        HIPAA, GDPR, SOC 2 Type II certified security practices
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>6. Data Retention</h2>
                <p style={currentStyles.paragraph}>
                  We retain your information for different periods based on the type of data:
                </p>
                <ul style={currentStyles.list}>
                  <li><strong>Account Data:</strong> Until you delete your account</li>
                  <li><strong>Health Records:</strong> 7 years (medical record standard)</li>
                  <li><strong>Usage Data:</strong> 2 years for analytics</li>
                  <li><strong>Support Communications:</strong> 3 years</li>
                  <li><strong>Legal Records:</strong> As required by law</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section id="your-rights" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>👤</span>
                    7. Your Privacy Rights
                  </h2>
                  <div style={currentStyles.sectionBadge}>Control</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    You have complete control over your personal data. Here are your rights:
                  </p>
                  
                  <div style={currentStyles.rightsGrid}>
                    <div style={currentStyles.rightCard}>
                      <div style={currentStyles.rightIcon}>📋</div>
                      <h4 style={currentStyles.rightTitle}>Access</h4>
                      <p style={currentStyles.rightText}>Request a copy of all your personal data</p>
                      <button style={currentStyles.rightButton}>Request Data</button>
                    </div>
                    
                    <div style={currentStyles.rightCard}>
                      <div style={currentStyles.rightIcon}>✏️</div>
                      <h4 style={currentStyles.rightTitle}>Correction</h4>
                      <p style={currentStyles.rightText}>Update or correct any inaccurate information</p>
                      <button style={currentStyles.rightButton}>Update Info</button>
                    </div>
                    
                    <div style={currentStyles.rightCard}>
                      <div style={currentStyles.rightIcon}>🗑️</div>
                      <h4 style={currentStyles.rightTitle}>Deletion</h4>
                      <p style={currentStyles.rightText}>Request permanent deletion of your data</p>
                      <button style={currentStyles.rightButton}>Delete Data</button>
                    </div>
                    
                    <div style={currentStyles.rightCard}>
                      <div style={currentStyles.rightIcon}>📤</div>
                      <h4 style={currentStyles.rightTitle}>Portability</h4>
                      <p style={currentStyles.rightText}>Export your data in a readable format</p>
                      <button style={currentStyles.rightButton}>Export Data</button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>8. Cookies and Tracking Technologies</h2>
                <p style={currentStyles.paragraph}>
                  We use cookies and similar technologies to improve your experience:
                </p>
                <ul style={currentStyles.list}>
                  <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings</li>
                  <li><strong>Analytics Cookies:</strong> Help us improve our service</li>
                  <li><strong>Security Cookies:</strong> Protect against fraud</li>
                </ul>
                <p style={currentStyles.paragraph}>
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              {/* International Transfers */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>9. International Data Transfers</h2>
                <p style={currentStyles.paragraph}>
                  Your information may be transferred to and processed in countries other than your own. We ensure adequate protection through:
                </p>
                <ul style={currentStyles.list}>
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Certification schemes and codes of conduct</li>
                </ul>
              </section>

              {/* Children's Privacy */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>10. Children&apos;s Privacy</h2> {/* FIXED */}
                <div style={currentStyles.warningBox}>
                  <p style={currentStyles.warningText}>
                    <strong>Age Restriction:</strong> MediChecker is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                  </p>
                </div>
                <p style={currentStyles.paragraph}>
                  If you believe we have collected information from a child under 13, please contact us immediately at privacy@medichecker.com.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section style={currentStyles.section}>
                <h2 style={currentStyles.sectionTitle}>11. Changes to This Privacy Policy</h2>
                <p style={currentStyles.paragraph}>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by:
                </p>
                <ul style={currentStyles.list}>
                  <li>Email notification to registered users</li>
                  <li>In-app notifications</li>
                  <li>Prominent notice on our website</li>
                  <li>Updated &quot;Last modified&quot; date</li> {/* FIXED */}
                </ul>
              </section>

              {/* Contact Information */}
              <section id="contact" style={currentStyles.section}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>📞</span>
                    12. Contact Us
                  </h2>
                  <div style={currentStyles.sectionBadge}>Support</div>
                </div>
                <div style={currentStyles.sectionContent}>
                  <p style={currentStyles.paragraph}>
                    Have questions about your privacy or want to exercise your rights? We&apos;re here to help. {/* FIXED */}
                  </p>
                  
                  <div style={currentStyles.contactGrid}>
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📧</div>
                      <h4 style={currentStyles.contactTitle}>Privacy Team</h4>
                      <p style={currentStyles.contactText}>privacy@medichecker.com</p>
                      <span style={currentStyles.contactNote}>Response within 24 hours</span>
                    </div>
                    
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>🔒</div>
                      <h4 style={currentStyles.contactTitle}>Data Protection Officer</h4>
                      <p style={currentStyles.contactText}>dpo@medichecker.com</p>
                      <span style={currentStyles.contactNote}>For GDPR & compliance matters</span>
                    </div>
                    
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📞</div>
                      <h4 style={currentStyles.contactTitle}>Privacy Hotline</h4>
                      <p style={currentStyles.contactText}>+1 (555) 123-4567</p>
                      <span style={currentStyles.contactNote}>Mon-Fri, 9 AM - 6 PM EST</span>
                    </div>
                    
                    <div style={currentStyles.contactCard}>
                      <div style={currentStyles.contactIcon}>📍</div>
                      <h4 style={currentStyles.contactTitle}>Mailing Address</h4>
                      <p style={currentStyles.contactText}>
                        MediChecker Privacy Dept.<br />
                        123 Healthcare Ave<br />
                        Medical District, MD 12345
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy Commitment Footer */}
              <div style={currentStyles.commitmentFooter}>
                <div style={currentStyles.commitmentContent}>
                  <h3 style={currentStyles.commitmentTitle}>🛡️ Our Privacy Commitment</h3>
                  <p style={currentStyles.commitmentText}>
                    Your health data is sacred. We pledge to protect it with the highest security standards and give you complete control over your information.
                  </p>
                  <div style={currentStyles.commitmentButtons}>
                    <button style={currentStyles.primaryButton}>
                      View Your Data
                    </button>
                    <button style={currentStyles.secondaryButton}>
                      📄 Download Policy PDF
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

// Enhanced Styles with Modern Design (same structure as Terms page)
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
  dataCategory: {
    marginBottom: "40px"
  },
  categoryTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px"
  },
  categoryIcon: {
    fontSize: "24px"
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  },
  dataCard: {
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef"
  },
  dataIcon: {
    fontSize: "24px",
    marginBottom: "12px"
  },
  dataTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  dataList: {
    margin: 0,
    paddingLeft: "16px",
    fontSize: "14px",
    lineHeight: "1.6"
  },
  criticalWarning: {
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#f8d7da",
    border: "2px solid #dc3545",
    marginBottom: "24px"
  },
  warningHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  warningIcon: {
    fontSize: "24px"
  },
  warningTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#721c24",
    margin: 0
  },
  warningText: {
    color: "#721c24",
    fontSize: "16px",
    fontWeight: "500",
    margin: 0
  },
  healthGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  healthCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#e8f5e8",
    border: "1px solid #28a745"
  },
  healthIcon: {
    fontSize: "24px",
    minWidth: "32px"
  },
  healthContent: {},
  healthTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
    margin: 0,
    color: "#1e7e34"
  },
  healthDesc: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0
  },
  technicalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px"
  },
  techItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef"
  },
  techIcon: {
    fontSize: "20px"
  },
  usageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px"
  },
  usageCard: {
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    textAlign: "center"
  },
  usageIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  usageTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    margin: 0
  },
  usageList: {
    margin: 0,
    paddingLeft: "0",
    listStyle: "none",
    fontSize: "14px",
    lineHeight: "1.8"
  },
  securityOverview: {
    textAlign: "center",
    marginBottom: "40px"
  },
  securityTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#28a745",
    marginBottom: "16px"
  },
  securityDesc: {
    fontSize: "16px",
    color: "#6c757d",
    lineHeight: "1.6"
  },
  securityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },
  securityCard: {
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    textAlign: "center",
    transition: "transform 0.2s ease"
  },
  securityIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  securityCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  securityCardText: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
    lineHeight: "1.6"
  },
  rightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px"
  },
  rightCard: {
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    textAlign: "center"
  },
  rightIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  rightTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    margin: 0
  },
  rightText: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "16px",
    lineHeight: "1.6"
  },
  rightButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease"
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
  commitmentFooter: {
    marginTop: "60px",
    padding: "40px",
    borderRadius: "20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #28a745",
    textAlign: "center"
  },
  commitmentContent: {},
  commitmentTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e7e34",
    marginBottom: "16px"
  },
  commitmentText: {
    fontSize: "16px",
    color: "#155724",
    marginBottom: "24px",
    lineHeight: "1.6"
  },
  commitmentButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  primaryButton: {
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
  secondaryButton: {
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
  dataCard: {
    ...baseStyles.dataCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  usageCard: {
    ...baseStyles.usageCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  securityCard: {
    ...baseStyles.securityCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  rightCard: {
    ...baseStyles.rightCard,
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
  categoryTitle: {
    ...baseStyles.categoryTitle,
    color: "#e9ecef"
  },
  dataCard: {
    ...baseStyles.dataCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
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
  healthCard: {
    ...baseStyles.healthCard,
    backgroundColor: "#1a2d1a",
    borderColor: "#28a745"
  },
  healthTitle: {
    ...baseStyles.healthTitle,
    color: "#4ade80"
  },
  healthDesc: {
    ...baseStyles.healthDesc,
    color: "#b0b0b0"
  },
  techItem: {
    ...baseStyles.techItem,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  usageCard: {
    ...baseStyles.usageCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  securityCard: {
    ...baseStyles.securityCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  securityCardText: {
    ...baseStyles.securityCardText,
    color: "#b0b0b0"
  },
  rightCard: {
    ...baseStyles.rightCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  rightText: {
    ...baseStyles.rightText,
    color: "#b0b0b0"
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
  commitmentFooter: {
    ...baseStyles.commitmentFooter,
    backgroundColor: "#1a2d1a",
    borderColor: "#28a745"
  },
  commitmentTitle: {
    ...baseStyles.commitmentTitle,
    color: "#4ade80"
  },
  commitmentText: {
    ...baseStyles.commitmentText,
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
      
      .data-grid,
      .usage-grid,
      .security-grid,
      .rights-grid,
      .contact-grid {
        grid-template-columns: 1fr !important;
      }
      
      .commitment-buttons {
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
    
    .data-card:hover,
    .usage-card:hover,
    .security-card:hover,
    .right-card:hover,
    .contact-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .right-button:hover {
      background-color: #218838 !important;
      transform: translateY(-2px);
    }
    
    .primary-button:hover {
      background-color: #218838 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }
    
    .secondary-button:hover {
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