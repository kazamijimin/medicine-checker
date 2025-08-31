"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function AdminUsersPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = await checkAdminStatus(currentUser.uid);
        if (!adminStatus) {
          setUnauthorized(true);
        } else {
          await loadUsers();
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let filtered = users.filter(userData =>
      (userData.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (userData.displayName || userData.email?.split('@')[0] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedRole !== 'all') {
      if (selectedRole === 'admin') {
        filtered = filtered.filter(userData => userData.isAdmin || userData.role === 'admin');
      } else {
        filtered = filtered.filter(userData => !userData.isAdmin && userData.role !== 'admin');
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const checkAdminStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const adminStatus = userData.role === 'admin' || userData.isAdmin === true;
        setIsAdmin(adminStatus);
        return adminStatus;
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus, userName) => {
    if (userId === user?.uid) {
      setMessage('You cannot modify your own admin status.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, "users", userId), {
        isAdmin: newStatus,
        role: newStatus ? "admin" : "user"
      });
      
      setMessage(`${userName} ${newStatus ? 'promoted to' : 'removed from'} admin successfully!`);
      setTimeout(() => setMessage(''), 3000);
      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage('Error updating user role. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Enhanced profile image source function with Supabase support
  const getUserProfileImage = (userData) => {
    // Check for Supabase profile picture first
    if (userData.profilePictureUrl) {
      return `${userData.profilePictureUrl}?t=${Date.now()}`;
    }
    
    // Check for Firebase photoURL
    if (userData.photoURL) {
      return `${userData.photoURL}?t=${Date.now()}`;
    }
    
    // Fallback to generated avatar
    const displayName = userData.displayName || userData.email?.split('@')[0] || 'User';
    const initials = displayName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=10b981&color=fff&size=120&font-size=0.6&bold=true`;
  };

  const formatJoinDate = (createdAt) => {
    if (!createdAt) return 'Unknown';
    
    let date;
    if (createdAt.toDate) {
      date = createdAt.toDate();
    } else if (typeof createdAt === 'string') {
      date = new Date(createdAt);
    } else {
      date = new Date(createdAt);
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  // Current styles based on theme
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .user-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
    
    .search-input:focus, .filter-select:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .profile-image-error {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }
    
    * {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;

  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.loadingContainer}>
            <div style={currentStyles.loadingSpinner}>
              <div style={currentStyles.spinner}></div>
              <p style={currentStyles.loadingText}>Loading Users...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (unauthorized) {
    return (
      <>
        <style>{cssAnimations}</style>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.container}>
          <div style={currentStyles.emptyState}>
            <span style={currentStyles.emptyIcon}>🚫</span>
            <h2 style={currentStyles.emptyTitle}>Access Denied</h2>
            <p style={currentStyles.emptyText}>
              You don't have permission to manage users.<br/>
              Please contact an administrator for access.
            </p>
            <button 
              onClick={() => router.push('/admin')} 
              style={{...currentStyles.button, ...currentStyles.primaryButton, marginTop: "24px"}}
            >
              ← Back to Admin Panel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssAnimations}</style>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Hero Section */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <h1 style={currentStyles.heroTitle}>
                <span style={currentStyles.heroIcon}>👥</span>
                User Management
              </h1>
              <p style={currentStyles.heroSubtitle}>
                Manage users and their permissions across the platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>

          {/* Message */}
          {message && (
            <div style={{
              ...currentStyles.message,
              ...(message.includes('Error') ? currentStyles.errorMessage : currentStyles.successMessage)
            }}>
              <span>{message.includes('Error') ? '⚠️' : '✅'}</span>
              {message}
            </div>
          )}

          {/* Header Controls */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h2 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>🛡️</span>
                User Management
              </h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button 
                  onClick={() => router.push('/admin')} 
                  style={{...currentStyles.button, ...currentStyles.secondaryButton}}
                  className="button"
                >
                  ← Back to Admin
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={currentStyles.statsGrid}>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>👥</span>
                <h3 style={currentStyles.statsNumber}>{users.length}</h3>
                <p style={currentStyles.statsLabel}>Total Users</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>👑</span>
                <h3 style={currentStyles.statsNumber}>
                  {users.filter(u => u.isAdmin || u.role === 'admin').length}
                </h3>
                <p style={currentStyles.statsLabel}>Administrators</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>👤</span>
                <h3 style={currentStyles.statsNumber}>
                  {users.filter(u => !u.isAdmin && u.role !== 'admin').length}
                </h3>
                <p style={currentStyles.statsLabel}>Regular Users</p>
              </div>
              <div style={currentStyles.statsCard}>
                <span style={currentStyles.statsIcon}>🔍</span>
                <h3 style={currentStyles.statsNumber}>{filteredUsers.length}</h3>
                <p style={currentStyles.statsLabel}>Showing Results</p>
              </div>
            </div>

            {/* Controls */}
            <div style={currentStyles.controlsSection}>
              <div style={currentStyles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={currentStyles.searchInput}
                  className="search-input"
                />
                <span style={currentStyles.searchIcon}>🔍</span>
              </div>
              
              <div style={currentStyles.filtersSection}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={currentStyles.categoryFilter}
                  className="filter-select"
                >
                  <option value="all">All Users</option>
                  <option value="admin">👑 Administrators</option>
                  <option value="user">👤 Regular Users</option>
                </select>
                
                <div style={currentStyles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      ...currentStyles.viewButton,
                      ...(viewMode === 'grid' ? currentStyles.activeViewButton : {})
                    }}
                  >
                    ▦ Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      ...currentStyles.viewButton,
                      ...(viewMode === 'list' ? currentStyles.activeViewButton : {})
                    }}
                  >
                    ☰ List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div style={currentStyles.section}>
            <div style={currentStyles.sectionHeader}>
              <h3 style={currentStyles.sectionTitle}>
                <span style={currentStyles.sectionIcon}>👥</span>
                Registered Users
              </h3>
            </div>

            <div style={currentStyles.usersList}>
              {filteredUsers.length === 0 ? (
                <div style={currentStyles.emptyState}>
                  <span style={currentStyles.emptyIcon}>🔍</span>
                  <h3 style={currentStyles.emptyTitle}>No users found</h3>
                  <p style={currentStyles.emptyText}>
                    {users.length === 0 
                      ? "No users are registered in the system yet." 
                      : "No users match your search criteria. Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((userData) => {
                  const isCurrentAdmin = userData.isAdmin || userData.role === 'admin';
                  const isCurrentUser = userData.id === user?.uid;
                  const displayName = userData.displayName || userData.email?.split('@')[0] || 'User';
                  
                  return (
                    <div key={userData.id} style={currentStyles.userCard} className="user-card">
                      <div style={currentStyles.cardGradient}></div>
                      
                      <div style={currentStyles.userHeader}>
                        <div style={currentStyles.userAvatarSection}>
                          <div style={currentStyles.userAvatarContainer}>
                            <Image
                              src={getUserProfileImage(userData)}
                              alt={`${displayName}'s profile`}
                              width={viewMode === 'grid' ? 64 : 48}
                              height={viewMode === 'grid' ? 64 : 48}
                              style={currentStyles.userAvatar}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff&size=${viewMode === 'grid' ? 64 : 48}`;
                              }}
                              unoptimized={true}
                            />
                            {isCurrentAdmin && (
                              <div style={currentStyles.adminBadge}>
                                <span>👑</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={currentStyles.userInfo}>
                          <h3 style={currentStyles.userName}>
                            {displayName}
                            {isCurrentUser && (
                              <span style={currentStyles.youBadge}>(You)</span>
                            )}
                          </h3>
                          <p style={currentStyles.userEmail}>{userData.email}</p>
                          <div style={currentStyles.userMeta}>
                            <div style={currentStyles.userRole}>
                              <span style={{
                                ...currentStyles.rolePill,
                                ...(isCurrentAdmin ? currentStyles.adminRolePill : currentStyles.userRolePill)
                              }}>
                                <span>{isCurrentAdmin ? '👑' : '👤'}</span>
                                {isCurrentAdmin ? 'Administrator' : 'User'}
                              </span>
                            </div>
                            <div style={currentStyles.joinDate}>
                              <span style={currentStyles.joinDateIcon}>📅</span>
                              Joined {formatJoinDate(userData.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div style={currentStyles.actionSection}>
                          <button
                            onClick={() => toggleAdminStatus(userData.id, isCurrentAdmin, displayName)}
                            style={{
                              ...currentStyles.button,
                              ...(isCurrentAdmin ? currentStyles.demoteButton : currentStyles.promoteButton),
                              ...(isCurrentUser ? currentStyles.disabledButton : {})
                            }}
                            className="button"
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Cannot modify your own role" : (isCurrentAdmin ? "Remove admin privileges" : "Grant admin privileges")}
                          >
                            <span>{isCurrentAdmin ? '⬇️' : '⬆️'}</span>
                            {isCurrentAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          
                          {viewMode === 'grid' && (
                            <div style={currentStyles.userStats}>
                              <div style={currentStyles.statItem}>
                                <span style={currentStyles.statValue}>
                                  {userData.lastLoginAt ? '🟢' : '🔴'}
                                </span>
                                <span style={currentStyles.statLabel}>
                                  {userData.lastLoginAt ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {viewMode === 'grid' && userData.phone && (
                        <div style={currentStyles.userDetailsSection}>
                          <div style={currentStyles.detailItem}>
                            <span style={currentStyles.detailIcon}>📱</span>
                            <span style={currentStyles.detailText}>{userData.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// Base styles
const baseStyles = {
  container: {
    minHeight: "100vh",
    paddingTop: "60px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    transition: "all 0.3s ease"
  },

  hero: {
    minHeight: "30vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  heroBackground: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: "100%",
    minHeight: "30vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },

  heroContent: {
    textAlign: "center",
    color: "white",
    maxWidth: "800px",
    padding: "40px 20px"
  },

  heroTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "12px",
    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
  },

  heroIcon: {
    fontSize: "48px"
  },

  heroSubtitle: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "24px"
  },

  mainContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px"
  },

  section: {
    marginBottom: "40px",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid",
    fontFamily: "'Poppins', sans-serif"
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px"
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: 0
  },

  sectionIcon: {
    fontSize: "28px"
  },

  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Poppins', sans-serif"
  },

  primaryButton: {
    backgroundColor: "#10b981",
    color: "white"
  },

  secondaryButton: {
    border: "2px solid",
    backgroundColor: "transparent"
  },

  promoteButton: {
    backgroundColor: "#10b981",
    color: "white"
  },

  demoteButton: {
    backgroundColor: "#f59e0b",
    color: "white"
  },

  disabledButton: {
    backgroundColor: "#6b7280",
    color: "white",
    cursor: "not-allowed",
    opacity: 0.6
  },

  controlsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    alignItems: "center",
    marginBottom: "24px"
  },

  searchContainer: {
    position: "relative"
  },

  searchInput: {
    width: "100%",
    padding: "16px 48px 16px 20px",
    border: "2px solid",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "500",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif"
  },

  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px"
  },

  filtersSection: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  categoryFilter: {
    padding: "12px 16px",
    border: "2px solid",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif"
  },

  viewToggle: {
    display: "flex",
    gap: "4px",
    border: "2px solid",
    borderRadius: "8px",
    padding: "4px"
  },

  viewButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "transparent",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500"
  },

  activeViewButton: {
    background: "#10b981",
    color: "white"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },

  statsCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid",
    textAlign: "center",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif"
  },

  statsIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    display: "block"
  },

  statsNumber: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#10b981",
    margin: "0 0 4px 0",
    fontFamily: "'Poppins', sans-serif"
  },

  statsLabel: {
    fontSize: "14px",
    fontWeight: "500",
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },

  usersList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "24px"
  },

  userCard: {
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif"
  },

  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
  },

  userHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px"
  },

  userAvatarSection: {
    flexShrink: 0
  },

  userAvatarContainer: {
    position: "relative",
    display: "inline-block"
  },

  userAvatar: {
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #10b981",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
  },

  adminBadge: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    width: "20px",
    height: "20px",
    backgroundColor: "#f59e0b",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    border: "2px solid white"
  },

  userInfo: {
    flex: 1,
    minWidth: 0
  },

  userName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#10b981",
    margin: "0 0 4px 0",
    lineHeight: "1.2",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  youBadge: {
    fontSize: "12px",
    backgroundColor: "#10b981",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: "500"
  },

  userEmail: {
    fontSize: "14px",
    marginBottom: "12px",
    fontFamily: "'Poppins', sans-serif",
    wordBreak: "break-word"
  },

  userMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  userRole: {
    display: "flex",
    alignItems: "center"
  },

  rolePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'Poppins', sans-serif"
  },

  adminRolePill: {
    backgroundColor: "#f59e0b",
    color: "white"
  },

  userRolePill: {
    backgroundColor: "#10b981",
    color: "white"
  },

  joinDate: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontFamily: "'Poppins', sans-serif"
  },

  joinDateIcon: {
    fontSize: "14px"
  },

  actionSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-end"
  },

  userStats: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px"
  },

  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },

  statValue: {
    fontSize: "12px"
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: "500"
  },

  userDetailsSection: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid"
  },

  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif"
  },

  detailIcon: {
    fontSize: "16px"
  },

  detailText: {
    fontWeight: "500"
  },

  message: {
    position: "fixed",
    top: "80px",
    right: "20px",
    padding: "16px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    zIndex: 1001,
    animation: "slideIn 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Poppins', sans-serif"
  },

  successMessage: {
    backgroundColor: "#10b981",
    color: "white"
  },

  errorMessage: {
    backgroundColor: "#ef4444",
    color: "white"
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    gridColumn: "1 / -1",
    fontFamily: "'Poppins', sans-serif"
  },

  emptyIcon: {
    fontSize: "80px",
    marginBottom: "24px",
    display: "block",
    opacity: 0.5
  },

  emptyTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "12px",
    fontFamily: "'Poppins', sans-serif"
  },

  emptyText: {
    fontSize: "16px",
    lineHeight: "1.5",
    fontFamily: "'Poppins', sans-serif"
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  },

  loadingSpinner: {
    textAlign: "center"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  },

  loadingText: {
    fontSize: "16px",
    color: "#6c757d",
    fontFamily: "'Poppins', sans-serif"
  }
};

// Light theme styles
const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#ffffff",
    color: "#333333"
  },
  section: {
    ...baseStyles.section,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    borderColor: "#6c757d",
    color: "#6c757d"
  },
  searchInput: {
    ...baseStyles.searchInput,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef",
    color: "#333333"
  },
  searchIcon: {
    ...baseStyles.searchIcon,
    color: "rgba(0, 0, 0, 0.5)"
  },
  categoryFilter: {
    ...baseStyles.categoryFilter,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef",
    color: "#333333"
  },
  viewToggle: {
    ...baseStyles.viewToggle,
    borderColor: "#e9ecef",
    backgroundColor: "#ffffff"
  },
  viewButton: {
    ...baseStyles.viewButton,
    color: "#333333"
  },
  statsCard: {
    ...baseStyles.statsCard,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  statsLabel: {
    ...baseStyles.statsLabel,
    color: "#6c757d"
  },
  userCard: {
    ...baseStyles.userCard,
    backgroundColor: "#ffffff",
    borderColor: "#e9ecef",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  userEmail: {
    ...baseStyles.userEmail,
    color: "#6c757d"
  },
  joinDate: {
    ...baseStyles.joinDate,
    color: "#6c757d"
  },
  userDetailsSection: {
    ...baseStyles.userDetailsSection,
    borderColor: "#e9ecef"
  },
  emptyTitle: {
    ...baseStyles.emptyTitle,
    color: "#374151"
  },
  emptyText: {
    ...baseStyles.emptyText,
    color: "#6c757d"
  }
};

// Dark theme styles
const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff"
  },
  section: {
    ...baseStyles.section,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  secondaryButton: {
    ...baseStyles.secondaryButton,
    borderColor: "#e9ecef",
    color: "#e9ecef"
  },
  searchInput: {
    ...baseStyles.searchInput,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  searchIcon: {
    ...baseStyles.searchIcon,
    color: "rgba(255, 255, 255, 0.5)"
  },
  categoryFilter: {
    ...baseStyles.categoryFilter,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  viewToggle: {
    ...baseStyles.viewToggle,
    borderColor: "#555555",
    backgroundColor: "#404040"
  },
  viewButton: {
    ...baseStyles.viewButton,
    color: "#ffffff"
  },
  statsCard: {
    ...baseStyles.statsCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  statsLabel: {
    ...baseStyles.statsLabel,
    color: "#b0b0b0"
  },
  userCard: {
    ...baseStyles.userCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  userEmail: {
    ...baseStyles.userEmail,
    color: "#b0b0b0"
  },
  joinDate: {
    ...baseStyles.joinDate,
    color: "#b0b0b0"
  },
  userDetailsSection: {
    ...baseStyles.userDetailsSection,
    borderColor: "#555555"
  },
  emptyTitle: {
    ...baseStyles.emptyTitle,
    color: "#e9ecef"
  },
  emptyText: {
    ...baseStyles.emptyText,
    color: "#b0b0b0"
  }
};