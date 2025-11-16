import React from 'react';

export default function TechnologyStack({ isDarkMode }) {
  const technologies = [
    {
      category: "Frontend",
      icon: "⚛️",
      items: [
        { name: "Next.js 14", description: "React framework for production" },
        { name: "React", description: "UI component library" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "Framer Motion", description: "Animation library" }
      ]
    },
    {
      category: "Backend",
      icon: "🔧",
      items: [
        { name: "Firebase", description: "Authentication & database" },
        { name: "Supabase", description: "PostgreSQL database" },
        { name: "Node.js", description: "Runtime environment" },
        { name: "API Routes", description: "Serverless functions" }
      ]
    },
    {
      category: "AI & ML",
      icon: "🤖",
      items: [
        { name: "Google Gemini", description: "Advanced AI model" },
        { name: "Hugging Face", description: "NLP models" },
        { name: "OpenAI GPT", description: "Conversational AI" },
        { name: "TensorFlow", description: "Machine learning" }
      ]
    },
    {
      category: "Infrastructure",
      icon: "☁️",
      items: [
        { name: "Vercel", description: "Hosting & deployment" },
        { name: "Cloudflare", description: "CDN & security" },
        { name: "AWS S3", description: "File storage" },
        { name: "Redis", description: "Caching layer" }
      ]
    }
  ];

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <section style={currentStyles.section}>
      <div style={currentStyles.container}>
        <div style={currentStyles.header}>
          <h2 style={currentStyles.title}>Built with Modern Technology</h2>
          <p style={currentStyles.subtitle}>
            Powered by industry-leading tools and frameworks for reliability and performance
          </p>
        </div>

        <div style={currentStyles.grid}>
          {technologies.map((tech, index) => (
            <div key={index} style={currentStyles.card}>
              <div style={currentStyles.categoryHeader}>
                <span style={currentStyles.categoryIcon}>{tech.icon}</span>
                <h3 style={currentStyles.categoryTitle}>{tech.category}</h3>
              </div>
              <div style={currentStyles.itemsList}>
                {tech.items.map((item, idx) => (
                  <div key={idx} style={currentStyles.item}>
                    <div style={currentStyles.itemName}>{item.name}</div>
                    <div style={currentStyles.itemDescription}>{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={currentStyles.statsSection}>
          <div style={currentStyles.stat}>
            <div style={currentStyles.statNumber}>99.9%</div>
            <div style={currentStyles.statLabel}>Uptime</div>
          </div>
          <div style={currentStyles.stat}>
            <div style={currentStyles.statNumber}>&lt;100ms</div>
            <div style={currentStyles.statLabel}>Response Time</div>
          </div>
          <div style={currentStyles.stat}>
            <div style={currentStyles.statNumber}>256-bit</div>
            <div style={currentStyles.statLabel}>Encryption</div>
          </div>
          <div style={currentStyles.stat}>
            <div style={currentStyles.statNumber}>24/7</div>
            <div style={currentStyles.statLabel}>Monitoring</div>
          </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginBottom: "60px",
  },
  card: {
    padding: "25px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #e2e8f0",
  },
  categoryIcon: {
    fontSize: "28px",
  },
  categoryTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  item: {
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  itemName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#10b981",
    marginBottom: "4px",
  },
  itemDescription: {
    fontSize: "13px",
    color: "#64748b",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "30px",
    padding: "40px",
    backgroundColor: "#10b981",
    borderRadius: "16px",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#ffffff",
    opacity: 0.9,
    fontWeight: "500",
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
  card: {
    ...lightStyles.card,
    backgroundColor: "#262626",
    borderColor: "#374151",
  },
  categoryHeader: {
    ...lightStyles.categoryHeader,
    borderBottomColor: "#374151",
  },
  categoryTitle: {
    ...lightStyles.categoryTitle,
    color: "#f1f5f9",
  },
  item: {
    ...lightStyles.item,
    backgroundColor: "#1e293b",
    borderColor: "#374151",
  },
  itemDescription: {
    ...lightStyles.itemDescription,
    color: "#94a3b8",
  },
  statsSection: {
    ...lightStyles.statsSection,
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
};