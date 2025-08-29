"use client";

import { useState, useEffect } from "react";

export default function Testimonials({ isDarkMode }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Family Physician",
      avatar: "👩‍⚕️",
      text: "MediChecker has revolutionized how I verify medications for my patients. The accuracy and speed are incredible!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Pharmacy Student",
      avatar: "👨‍🎓",
      text: "As a future pharmacist, this tool helps me learn and verify drug information quickly. Highly recommended!",
      rating: 5
    },
    {
      name: "Emma Wilson",
      role: "Senior Patient",
      avatar: "👵",
      text: "With multiple medications, MediChecker gives me peace of mind. I can verify everything myself now.",
      rating: 5
    },
    {
      name: "James Rodriguez",
      role: "Healthcare Worker",
      avatar: "👨‍⚕️",
      text: "The counterfeit detection feature is amazing. It's saved our clinic from potential medication errors.",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const currentStyles = isDarkMode ? darkTestimonialStyles : lightTestimonialStyles;

  return (
    <section style={currentStyles.section} id="testimonials">
      <div style={currentStyles.container}>
        <h2 style={currentStyles.title}>What Our Users Say</h2>
        
        <div style={currentStyles.testimonialContainer}>
          <div style={currentStyles.testimonialCard}>
            <div style={currentStyles.stars}>
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <span key={i} style={currentStyles.star}>⭐</span>
              ))}
            </div>
            
            <p style={currentStyles.testimonialText}>
              "{testimonials[currentTestimonial].text}"
            </p>
            
            <div style={currentStyles.authorInfo}>
              <div style={currentStyles.avatar}>
                {testimonials[currentTestimonial].avatar}
              </div>
              <div style={currentStyles.authorDetails}>
                <div style={currentStyles.authorName}>
                  {testimonials[currentTestimonial].name}
                </div>
                <div style={currentStyles.authorRole}>
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={currentStyles.indicators}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              style={{
                ...currentStyles.indicator,
                backgroundColor: currentTestimonial === index 
                  ? "#28a745" 
                  : (isDarkMode ? "#404040" : "#e9ecef")
              }}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const baseTestimonialStyles = {
  section: {
    padding: "100px 20px",
    textAlign: "center"
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "700",
    marginBottom: "60px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  testimonialContainer: {
    marginBottom: "40px"
  },
  testimonialCard: {
    padding: "50px 40px",
    borderRadius: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    position: "relative"
  },
  stars: {
    marginBottom: "24px"
  },
  star: {
    fontSize: "20px",
    marginRight: "4px"
  },
  testimonialText: {
    fontSize: "clamp(18px, 2.5vw, 24px)",
    lineHeight: "1.6",
    marginBottom: "40px",
    fontStyle: "italic"
  },
  authorInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
  },
  avatar: {
    fontSize: "48px",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(40, 167, 69, 0.1)"
  },
  authorDetails: {
    textAlign: "left"
  },
  authorName: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px"
  },
  authorRole: {
    fontSize: "14px",
    opacity: 0.7
  },
  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: "12px"
  },
  indicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  }
};

const lightTestimonialStyles = {
  ...baseTestimonialStyles,
  section: {
    ...baseTestimonialStyles.section,
    backgroundColor: "#f8f9fa"
  },
  testimonialCard: {
    ...baseTestimonialStyles.testimonialCard,
    backgroundColor: "white",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    color: "#333"
  },
  testimonialText: {
    ...baseTestimonialStyles.testimonialText,
    color: "#333"
  },
  authorName: {
    ...baseTestimonialStyles.authorName,
    color: "#333"
  },
  authorRole: {
    ...baseTestimonialStyles.authorRole,
    color: "#666"
  }
};

const darkTestimonialStyles = {
  ...baseTestimonialStyles,
  section: {
    ...baseTestimonialStyles.section,
    backgroundColor: "#1a1a1a"
  },
  testimonialCard: {
    ...baseTestimonialStyles.testimonialCard,
    backgroundColor: "#2d2d2d",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    color: "#fff"
  },
  testimonialText: {
    ...baseTestimonialStyles.testimonialText,
    color: "#fff"
  },
  authorName: {
    ...baseTestimonialStyles.authorName,
    color: "#fff"
  },
  authorRole: {
    ...baseTestimonialStyles.authorRole,
    color: "#b0b0b0"
  }
};