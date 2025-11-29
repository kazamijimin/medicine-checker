"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [themeLoaded, setThemeLoaded] = useState(false); // ✅ new
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setIsGuest(!user);
    });

    // Load theme preference (light first, then maybe dark)
    const savedTheme = typeof window !== "undefined"
      ? localStorage.getItem("theme")
      : null;

    if (savedTheme === "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false); // ✅ explicitly light as default
    }

    setThemeLoaded(true); // ✅ theme ready

    return () => unsubscribe();
  }, [router]);

  // While auth or theme is not ready, show loader
  if (loading || !themeLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading Dashboard...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsGuest(true);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };

  const projects = [
    {
      id: 1,
      title: "Medicine Checker",
      description: "AI-powered medical assistant for health guidance and medicine information",
      icon: "🏥",
      category: "healthcare",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      tags: ["AI", "Healthcare", "Chat"],
      url: "https://medicine-checker.vercel.app/home",
      stats: { users: "10K+", rating: "4.8" }
    },
    {
      id: 2,
      title: "Tsukihime Design",
      description: "Elegant visual novel inspired design with modern aesthetics",
      icon: "🌙",
      category: "design",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      tags: ["Design", "Visual", "UI/UX"],
      url: "https://schoolproject-tsukiwebvn.vercel.app",
      stats: { users: "5K+", rating: "4.9" }
    },
    {
      id: 3,
      title: "Prescriptory",
      description: "Advanced prescription and medication tracking system",
      icon: "💊",
      category: "healthcare",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      tags: ["Health", "Tracking", "Management"],
      url: "https://prescriptory-test.vercel.app",
      stats: { users: "8K+", rating: "4.7" }
    },
    {
      id: 4,
      title: "SSC Forum",
      description: "Interactive student community for collaboration and learning",
      icon: "💬",
      category: "education",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      tags: ["Community", "Education", "Forum"],
      url: "https://javascript-proj-images.vercel.app/admin-dashboard.html",
      stats: { users: "15K+", rating: "4.6" }
    },
    {
      id: 5,
      title: "Freelance Hub",
      description: "Professional platform connecting freelancers with clients",
      icon: "💼",
      category: "business",
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      tags: ["Business", "Freelance", "Portfolio"],
      url: "https://freelance-website-example.vercel.app",
      stats: { users: "12K+", rating: "4.8" }
    }
  ];

  const categories = [
    { id: "all", name: "All Projects", icon: "🌟" },
    { id: "healthcare", name: "Healthcare", icon: "⚕️" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "business", name: "Business", icon: "💼" }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentStyles = isDarkMode ? darkStyles : lightStyles;
  const displayName = user?.displayName || user?.email || 'Guest';
  const userName = user ? (user.displayName?.split(' ')[0] || 'User') : 'Guest';

  return (
    <div style={currentStyles.container}>
      {/* Modern Header */}
      <header style={currentStyles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={currentStyles.logoCircle}>🚀</div>
            <span style={currentStyles.logoText}>Dashboard</span>

            {/* ✅ Home button */}
            <button
              onClick={() => router.push('/home')}
              style={currentStyles.homeButton}
            >
              ⬅ Home
            </button>
          </div>
          
          <div style={styles.headerActions}>
            <button onClick={toggleTheme} style={currentStyles.themeButton} title="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <>
                <div style={currentStyles.userInfo}>
                  <Image
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    style={styles.avatar}
                    unoptimized={true}
                  />
                  <span style={currentStyles.userName}>{displayName}</span>
                </div>
                <button onClick={handleSignOut} style={currentStyles.signOutButton}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSignIn} style={currentStyles.signInButton}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={currentStyles.main}>
        <div style={styles.container}>
          
          {/* Hero Section */}
          <section style={currentStyles.hero}>
            <h1 style={currentStyles.heroTitle}>
              Welcome back, {userName}! 👋
            </h1>
            <p style={currentStyles.heroSubtitle}>
              {isGuest 
                ? "Explore our featured projects. Sign in for a personalized experience!" 
                : "Manage and access all your projects in one place"
              }
            </p>
          </section>

          {/* Search and Filter Section */}
          <section style={currentStyles.searchSection}>
            <div style={currentStyles.searchBar}>
              <span style={currentStyles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={currentStyles.searchInput}
              />
            </div>
            
            <div style={currentStyles.categoryFilter}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    ...currentStyles.categoryButton,
                    ...(selectedCategory === cat.id ? currentStyles.categoryButtonActive : {})
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section style={currentStyles.statsSection}>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>📊</div>
              <div style={currentStyles.statContent}>
                <div style={currentStyles.statValue}>5</div>
                <div style={currentStyles.statLabel}>Total Projects</div>
              </div>
            </div>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>👥</div>
              <div style={currentStyles.statContent}>
                <div style={currentStyles.statValue}>50K+</div>
                <div style={currentStyles.statLabel}>Active Users</div>
              </div>
            </div>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>⭐</div>
              <div style={currentStyles.statContent}>
                <div style={currentStyles.statValue}>4.8</div>
                <div style={currentStyles.statLabel}>Avg Rating</div>
              </div>
            </div>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>🚀</div>
              <div style={currentStyles.statContent}>
                <div style={currentStyles.statValue}>100%</div>
                <div style={currentStyles.statLabel}>Uptime</div>
              </div>
            </div>
          </section>

          {/* Projects Grid */}
          <section style={currentStyles.projectsSection}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                {selectedCategory === "all" ? "All Projects" : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span style={currentStyles.projectCount}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {filteredProjects.length === 0 ? (
              <div style={currentStyles.emptyState}>
                <div style={currentStyles.emptyIcon}>🔍</div>
                <h3 style={currentStyles.emptyTitle}>No projects found</h3>
                <p style={currentStyles.emptyText}>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div style={currentStyles.projectsGrid}>
                {filteredProjects.map(project => (
                  <div key={project.id} style={currentStyles.projectCard}>
                    <div style={{ ...currentStyles.projectHeader, background: project.gradient }}>
                      <div style={currentStyles.projectIcon}>{project.icon}</div>
                      <div style={currentStyles.projectStats}>
                        <span style={currentStyles.projectStat}>
                          👥 {project.stats.users}
                        </span>
                        <span style={currentStyles.projectStat}>
                          ⭐ {project.stats.rating}
                        </span>
                      </div>
                    </div>
                    
                    <div style={currentStyles.projectBody}>
                      <h3 style={currentStyles.projectTitle}>{project.title}</h3>
                      <p style={currentStyles.projectDescription}>{project.description}</p>
                      
                      <div style={currentStyles.projectTags}>
                        {project.tags.map(tag => (
                          <span key={tag} style={currentStyles.projectTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div style={currentStyles.projectFooter}>
                      <button
                        onClick={() => handleRedirect(project.url)}
                        style={{ ...currentStyles.projectButton, background: project.gradient }}
                      >
                        Launch Project →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          {!isGuest && (
            <section style={currentStyles.quickActions}>
              <h3 style={currentStyles.quickActionsTitle}>Quick Actions</h3>
              <div style={currentStyles.actionsGrid}>
                <button style={currentStyles.actionButton} onClick={() => router.push('/profile')}>
                  <span style={currentStyles.actionIcon}>👤</span>
                  <span>Profile</span>
                </button>
                <button style={currentStyles.actionButton} onClick={() => router.push('/reminders')}>
                  <span style={currentStyles.actionIcon}>⏰</span>
                  <span>Reminders</span>
                </button>
                <button style={currentStyles.actionButton} onClick={() => router.push('/settings')}>
                  <span style={currentStyles.actionIcon}>⚙️</span>
                  <span>Settings</span>
                </button>
                <button style={currentStyles.actionButton} onClick={() => router.push('/help')}>
                  <span style={currentStyles.actionIcon}>❓</span>
                  <span>Help</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={currentStyles.footer}>
        <div style={styles.container}>
          <p style={currentStyles.footerText}>
<Footer>
  </Footer>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Base styles
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    gap: '20px'
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(59, 130, 246, 0.1)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    borderRadius: '50%',
    objectFit: 'cover'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px'
  }
};

// Light theme
const lightStyles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#1e293b'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  logoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.5px'
  },
  themeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#e2e8f0'
    }
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  signOutButton: {
    padding: '8px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#ef4444',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  signInButton: {
    padding: '8px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  main: {
    padding: '40px 0',
    minHeight: 'calc(100vh - 200px)'
  },
  hero: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '20px 0'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '16px',
    letterSpacing: '-1px'
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: '400'
  },
  searchSection: {
    marginBottom: '40px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    marginBottom: '20px',
    transition: 'all 0.2s'
  },
  searchIcon: {
    fontSize: '20px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#1e293b',
    background: 'transparent'
  },
  categoryFilter: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  categoryButtonActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    borderColor: '#3b82f6'
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '48px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s'
  },
  statIcon: {
    fontSize: '32px',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500'
  },
  projectsSection: {
    marginBottom: '48px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b'
  },
  projectCount: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    padding: '6px 12px',
    background: '#f1f5f9',
    borderRadius: '8px'
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },
  projectCard: {
    background: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  projectHeader: {
    padding: '32px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  projectIcon: {
    fontSize: '48px'
  },
  projectStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end'
  },
  projectStat: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 10px',
    borderRadius: '6px',
    backdropFilter: 'blur(10px)'
  },
  projectBody: {
    padding: '24px'
  },
  projectTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  projectDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  projectTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  projectTag: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#3b82f6',
    background: '#eff6ff',
    padding: '4px 12px',
    borderRadius: '6px'
  },
  projectFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9'
  },
  projectButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b'
  },
  quickActions: {
    marginBottom: '48px'
  },
  quickActionsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    transition: 'all 0.2s'
  },
  actionIcon: {
    fontSize: '32px'
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    padding: '24px 0',
    background: '#ffffff'
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b'
  }
};

// Dark theme
const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: '#1a1a1a',
    color: '#f1f5f9'
  },
  header: {
    ...lightStyles.header,
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155'
  },
  logoText: {
    ...lightStyles.logoText,
    color: '#f1f5f9'
  },
  themeButton: {
    ...lightStyles.themeButton,
    background: '#334155',
    borderColor: '#475569'
  },
  userInfo: {
    ...lightStyles.userInfo,
    background: '#334155',
    borderColor: '#475569'
  },
  userName: {
    ...lightStyles.userName,
    color: '#f1f5f9'
  },
  heroTitle: {
    ...lightStyles.heroTitle,
    color: '#f1f5f9'
  },
  heroSubtitle: {
    ...lightStyles.heroSubtitle,
    color: '#94a3b8'
  },
  searchBar: {
    ...lightStyles.searchBar,
    background: '#1e293b',
    borderColor: '#334155'
  },
  searchInput: {
    ...lightStyles.searchInput,
    color: '#f1f5f9'
  },
  categoryButton: {
    ...lightStyles.categoryButton,
    background: '#1e293b',
    borderColor: '#334155',
    color: '#94a3b8'
  },
  statCard: {
    ...lightStyles.statCard,
    background: '#1e293b',
    borderColor: '#334155'
  },
  statValue: {
    ...lightStyles.statValue,
    color: '#f1f5f9'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#f1f5f9'
  },
  projectCount: {
    ...lightStyles.projectCount,
    background: '#334155',
    color: '#94a3b8'
  },
  projectCard: {
    ...lightStyles.projectCard,
    background: '#1e293b',
    borderColor: '#334155'
  },
  projectTitle: {
    ...lightStyles.projectTitle,
    color: '#f1f5f9'
  },
  projectDescription: {
    ...lightStyles.projectDescription,
    color: '#94a3b8'
  },
  projectFooter: {
    ...lightStyles.projectFooter,
    borderTop: '1px solid #334155'
  },
  emptyTitle: {
    ...lightStyles.emptyTitle,
    color: '#f1f5f9'
  },
  emptyText: {
    ...lightStyles.emptyText,
    color: '#94a3b8'
  },
  quickActionsTitle: {
    ...lightStyles.quickActionsTitle,
    color: '#f1f5f9'
  },
  actionButton: {
    ...lightStyles.actionButton,
    background: '#1e293b',
    borderColor: '#334155',
    color: '#f1f5f9'
  },
  footer: {
    ...lightStyles.footer,
    background: '#1e293b',
    borderTop: '1px solid #334155'
  },
  footerText: {
    ...lightStyles.footerText,
    color: '#94a3b8'
  }
};

// CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    * {
      box-sizing: border-box;
    }
    
    button {
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    
    input::placeholder {
      color: #94a3b8;
    }
    
    @media (max-width: 768px) {
      [style*="heroTitle"] {
        font-size: 32px !important;
      }
      
      [style*="projectsGrid"] {
        grid-template-columns: 1fr !important;
      }
      
      [style*="statsSection"] {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      [style*="categoryFilter"] {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 10px;
      }
    }
  `;
  document.head.appendChild(style);
}