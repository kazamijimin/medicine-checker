"use client";

import { useState } from "react";

export default function HelpPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  const faqCategories = [
    {
      category: "Getting Started",
      icon: "🚀",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on the 'Sign Up' button in the top right corner. Fill in your email, create a secure password, and verify your email address to get started."
        },
        {
          q: "Is Medicine Checker free to use?",
          a: "Yes! Medicine Checker is completely free to use. All core features including medicine search, prescription tracking, and pharmacy locator are available at no cost."
        },
        {
          q: "What devices can I use Medicine Checker on?",
          a: "Medicine Checker works on all modern web browsers on desktop, tablet, and mobile devices. We're also working on native mobile apps."
        }
      ]
    },
    {
      category: "Medicine Information",
      icon: "💊",
      questions: [
        {
          q: "Where does the medicine information come from?",
          a: "Our medicine database is powered by verified pharmaceutical sources including FDA databases, RxNorm, and other trusted medical information providers."
        },
        {
          q: "How often is the medicine database updated?",
          a: "We update our medicine database regularly to ensure you have access to the latest drug information, safety alerts, and new medications."
        },
        {
          q: "Can I report incorrect medicine information?",
          a: "Yes! If you notice any incorrect information, please contact us at support@medicinechecker.com with details about the issue."
        }
      ]
    },
    {
      category: "Prescription Tracking",
      icon: "📋",
      questions: [
        {
          q: "How do I add a prescription?",
          a: "Go to the Prescription History page and click 'Add Prescription'. Enter the medicine name, dosage, start date, and any additional notes."
        },
        {
          q: "Can I track multiple prescriptions?",
          a: "Absolutely! You can add unlimited prescriptions to your account and manage them all in one place."
        },
        {
          q: "How do refill reminders work?",
          a: "For maintenance medications, set the refill frequency (e.g., 30 days). The system will automatically calculate and remind you when it's time to refill."
        },
        {
          q: "What's the difference between acute and maintenance prescriptions?",
          a: "Acute prescriptions are short-term (like antibiotics), while maintenance prescriptions are ongoing medications you take regularly (like blood pressure meds)."
        }
      ]
    },
    {
      category: "Pharmacy Locator",
      icon: "📍",
      questions: [
        {
          q: "How do I find nearby pharmacies?",
          a: "Click on the Pharmacy Locator in the navigation menu. Allow location access or enter your address to see nearby pharmacies on a map."
        },
        {
          q: "Can I see pharmacy hours and contact information?",
          a: "Yes! Click on any pharmacy marker to view hours, phone number, address, and other relevant information."
        },
        {
          q: "How accurate is the pharmacy data?",
          a: "We use OpenStreetMap and other verified sources. However, we recommend calling ahead to confirm hours and medicine availability."
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: "🔒",
      questions: [
        {
          q: "Is my health information secure?",
          a: "Yes! We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for more details."
        },
        {
          q: "Who can see my prescriptions?",
          a: "Only you can see your prescription history. We never share your personal health information without your explicit consent."
        },
        {
          q: "How do I delete my account?",
          a: "Go to Settings > Account > Delete Account. This will permanently remove all your data from our servers."
        }
      ]
    },
    {
      category: "AI Assistant",
      icon: "🤖",
      questions: [
        {
          q: "What can the AI Assistant help with?",
          a: "Our AI can answer medicine questions, explain side effects, provide general health information, and help you understand your prescriptions."
        },
        {
          q: "Is the AI Assistant a replacement for my doctor?",
          a: "No. The AI provides general information only. Always consult your healthcare provider for medical advice and treatment decisions."
        },
        {
          q: "How accurate is the AI information?",
          a: "The AI is trained on verified medical data, but it should be used as a reference tool only. Always verify critical information with your healthcare provider."
        }
      ]
    }
  ];

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <div style={currentStyles.container}>
      {/* Header */}
      <div style={currentStyles.header}>
        <h1 style={currentStyles.title}>
          <span style={currentStyles.titleIcon}>❓</span>
          Help Center
        </h1>
        <p style={currentStyles.subtitle}>
          Find answers to common questions and get support
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div style={currentStyles.contactGrid}>
        <div style={currentStyles.contactCard}>
          <div style={currentStyles.contactIcon}>📧</div>
          <h3 style={currentStyles.contactTitle}>Email Support</h3>
          <p style={currentStyles.contactText}>support@medicinechecker.com</p>
          <p style={currentStyles.contactSubtext}>Response within 24 hours</p>
        </div>

        <div style={currentStyles.contactCard}>
          <div style={currentStyles.contactIcon}>💬</div>
          <h3 style={currentStyles.contactTitle}>Live Chat</h3>
          <p style={currentStyles.contactText}>Available Mon-Fri</p>
          <p style={currentStyles.contactSubtext}>9 AM - 5 PM EST</p>
        </div>

        <div style={currentStyles.contactCard}>
          <div style={currentStyles.contactIcon}>📚</div>
          <h3 style={currentStyles.contactTitle}>Documentation</h3>
          <p style={currentStyles.contactText}>View User Guide</p>
          <p style={currentStyles.contactSubtext}>Step-by-step tutorials</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={currentStyles.faqContainer}>
        <h2 style={currentStyles.faqTitle}>Frequently Asked Questions</h2>
        
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} style={currentStyles.faqCategory}>
            <h3 style={currentStyles.categoryTitle}>
              <span style={currentStyles.categoryIcon}>{category.icon}</span>
              {category.category}
            </h3>
            
            <div style={currentStyles.questionsContainer}>
              {category.questions.map((item, questionIndex) => {
                const key = `${categoryIndex}-${questionIndex}`;
                const isExpanded = expandedFaq === key;
                
                return (
                  <div key={questionIndex} style={currentStyles.faqItem}>
                    <button
                      onClick={() => toggleFaq(categoryIndex, questionIndex)}
                      style={currentStyles.faqQuestion}
                    >
                      <span style={currentStyles.questionText}>{item.q}</span>
                      <span style={currentStyles.expandIcon}>
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div style={currentStyles.faqAnswer}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Need Help Section */}
      <div style={currentStyles.helpCta}>
        <h2 style={currentStyles.helpCtaTitle}>Still Need Help?</h2>
        <p style={currentStyles.helpCtaText}>
          Can&apos;t find what you&apos;re looking for? Our support team is here to help.
        </p>
        <button style={currentStyles.helpCtaButton}>
          Contact Support
        </button>
      </div>
    </div>
  );
}

// Light theme styles
const lightStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '80px 20px 40px',
    fontFamily: "'Poppins', sans-serif"
  },
  header: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 48px'
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  titleIcon: {
    fontSize: '48px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    lineHeight: '1.6'
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto 64px'
  },
  contactCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  contactIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  contactTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  contactText: {
    fontSize: '16px',
    color: '#10b981',
    fontWeight: '600',
    marginBottom: '4px'
  },
  contactSubtext: {
    fontSize: '14px',
    color: '#64748b'
  },
  faqContainer: {
    maxWidth: '900px',
    margin: '0 auto 64px'
  },
  faqTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '32px',
    textAlign: 'center'
  },
  faqCategory: {
    marginBottom: '48px'
  },
  categoryTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  categoryIcon: {
    fontSize: '28px'
  },
  questionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  faqQuestion: {
    width: '100%',
    padding: '20px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease'
  },
  questionText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1
  },
  expandIcon: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
    marginLeft: '16px'
  },
  faqAnswer: {
    padding: '0 24px 20px',
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.7',
    borderTop: '1px solid #f1f5f9'
  },
  helpCta: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '48px 32px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  helpCtaTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  helpCtaText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  helpCtaButton: {
    padding: '14px 32px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  }
};

// Dark theme styles
const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: '#0f172a'
  },
  title: {
    ...lightStyles.title,
    color: '#f1f5f9'
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: '#94a3b8'
  },
  contactCard: {
    ...lightStyles.contactCard,
    backgroundColor: '#1e293b'
  },
  contactTitle: {
    ...lightStyles.contactTitle,
    color: '#f1f5f9'
  },
  contactSubtext: {
    ...lightStyles.contactSubtext,
    color: '#94a3b8'
  },
  faqTitle: {
    ...lightStyles.faqTitle,
    color: '#f1f5f9'
  },
  categoryTitle: {
    ...lightStyles.categoryTitle,
    color: '#f1f5f9'
  },
  faqItem: {
    ...lightStyles.faqItem,
    backgroundColor: '#1e293b'
  },
  questionText: {
    ...lightStyles.questionText,
    color: '#f1f5f9'
  },
  faqAnswer: {
    ...lightStyles.faqAnswer,
    color: '#94a3b8',
    borderTop: '1px solid #334155'
  },
  helpCta: {
    ...lightStyles.helpCta,
    backgroundColor: '#1e293b'
  },
  helpCtaTitle: {
    ...lightStyles.helpCtaTitle,
    color: '#f1f5f9'
  },
  helpCtaText: {
    ...lightStyles.helpCtaText,
    color: '#94a3b8'
  }
};