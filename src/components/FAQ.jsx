"use client";

import { useState } from "react";

export default function FAQ({ isDarkMode }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How accurate is MediChecker's verification?",
      answer: "MediChecker uses advanced AI and maintains a 99.9% accuracy rate in medicine verification. Our database is constantly updated with the latest pharmaceutical information."
    },
    {
      question: "Is my health data secure and private?",
      answer: "Absolutely. We use industry-standard encryption and never share your personal health information. Your data is stored securely and you have full control over it."
    },
    {
      question: "Can I use MediChecker offline?",
      answer: "While some features require internet connectivity for real-time verification, you can access your saved medicines and basic information offline."
    },
    {
      question: "Does MediChecker work internationally?",
      answer: "Yes! Our database includes medicines from major pharmaceutical companies worldwide. We support verification in multiple countries and languages."
    },
    {
      question: "How much does MediChecker cost?",
      answer: "MediChecker offers a free tier with basic features. Premium plans start at $9.99/month for advanced features like detailed health tracking and priority support."
    },
    {
      question: "Can healthcare professionals use MediChecker?",
      answer: "Yes! We offer special enterprise plans for healthcare providers, clinics, and hospitals with additional features and bulk licensing options."
    }
  ];

  const currentStyles = isDarkMode ? darkFAQStyles : lightFAQStyles;

  return (
    <section style={currentStyles.section} id="faq">
      <div style={currentStyles.container}>
        <h2 style={currentStyles.title}>Frequently Asked Questions</h2>
        <p style={currentStyles.subtitle}>
          Get answers to common questions about MediChecker
        </p>

        <div style={currentStyles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} style={currentStyles.faqItem}>
              <button
                style={{
                  ...currentStyles.faqQuestion,
                  backgroundColor: openIndex === index 
                    ? (isDarkMode ? "#404040" : "#f8f9fa")
                    : "transparent"
                }}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span>{faq.question}</span>
                <span style={{
                  ...currentStyles.faqIcon,
                  transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  ▼
                </span>
              </button>
              
              {openIndex === index && (
                <div style={currentStyles.faqAnswer}>
                  <p style={currentStyles.faqAnswerText}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={currentStyles.ctaContainer}>
          <p style={currentStyles.ctaText}>Still have questions?</p>
          <button style={currentStyles.ctaButton}>Contact Support</button>
        </div>
      </div>
    </section>
  );
}

const baseFAQStyles = {
  section: {
    padding: "100px 20px"
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "16px"
  },
  subtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    textAlign: "center",
    opacity: 0.8,
    marginBottom: "60px"
  },
  faqList: {
    marginBottom: "60px"
  },
  faqItem: {
    marginBottom: "16px",
    border: "1px solid",
    borderRadius: "12px",
    overflow: "hidden"
  },
  faqQuestion: {
    width: "100%",
    padding: "20px 24px",
    border: "none",
    textAlign: "left",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease"
  },
  faqIcon: {
    transition: "transform 0.3s ease",
    fontSize: "14px"
  },
  faqAnswer: {
    padding: "0 24px 24px 24px"
  },
  faqAnswerText: {
    fontSize: "16px",
    lineHeight: "1.6",
    margin: 0,
    opacity: 0.8
  },
  ctaContainer: {
    textAlign: "center",
    padding: "40px 20px",
    borderRadius: "16px"
  },
  ctaText: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px"
  },
  ctaButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  }
};

const lightFAQStyles = {
  ...baseFAQStyles,
  section: {
    ...baseFAQStyles.section,
    backgroundColor: "#ffffff"
  },
  title: {
    ...baseFAQStyles.title,
    color: "#333"
  },
  subtitle: {
    ...baseFAQStyles.subtitle,
    color: "#666"
  },
  faqItem: {
    ...baseFAQStyles.faqItem,
    borderColor: "#e9ecef"
  },
  faqQuestion: {
    ...baseFAQStyles.faqQuestion,
    color: "#333"
  },
  faqAnswerText: {
    ...baseFAQStyles.faqAnswerText,
    color: "#666"
  },
  ctaContainer: {
    ...baseFAQStyles.ctaContainer,
    backgroundColor: "#f8f9fa"
  },
  ctaText: {
    ...baseFAQStyles.ctaText,
    color: "#333"
  }
};

const darkFAQStyles = {
  ...baseFAQStyles,
  section: {
    ...baseFAQStyles.section,
    backgroundColor: "#1a1a1a"
  },
  title: {
    ...baseFAQStyles.title,
    color: "#fff"
  },
  subtitle: {
    ...baseFAQStyles.subtitle,
    color: "#b0b0b0"
  },
  faqItem: {
    ...baseFAQStyles.faqItem,
    borderColor: "#404040"
  },
  faqQuestion: {
    ...baseFAQStyles.faqQuestion,
    color: "#fff"
  },
  faqAnswerText: {
    ...baseFAQStyles.faqAnswerText,
    color: "#b0b0b0"
  },
  ctaContainer: {
    ...baseFAQStyles.ctaContainer,
    backgroundColor: "#2d2d2d"
  },
  ctaText: {
    ...baseFAQStyles.ctaText,
    color: "#fff"
  }
};