"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import Navbar from "@/components/Navbar";

export default function PrescriptionHistoryPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doseLogs, setDoseLogs] = useState({});
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    medicine: '',
    dosage: '',
    startDate: '',
    endDate: '',
    notes: '',
    rxType: 'acute',
    refillDays: 30
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Notification system
  const showNotification = useCallback((message, type) => {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }, []);

  // Load prescriptions from Firestore
  const loadPrescriptions = useCallback(async (userId) => {
    try {
      const prescriptionsRef = collection(db, "prescriptions");
      
      // ✅ Simpler query - just filter by userId, sort in memory
      const q = query(
        prescriptionsRef,
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptionsData = [];
      
      querySnapshot.forEach((doc) => {
        prescriptionsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // ✅ Sort in JavaScript instead of Firestore
      prescriptionsData.sort((a, b) => {
        const dateA = new Date(a.startDate || 0);
        const dateB = new Date(b.startDate || 0);
        return dateB - dateA; // descending order (newest first)
      });
      
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error("Error loading prescriptions:", error);
      showNotification(`Failed to load prescriptions: ${error.message}`, 'error');
    }
  }, [showNotification]);

  // Load dose logs
  const loadDoseLogs = useCallback(() => {
    const savedLogs = localStorage.getItem('doseLogs');
    if (savedLogs) {
      setDoseLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadPrescriptions(currentUser.uid);
        loadDoseLogs();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadPrescriptions, loadDoseLogs]);

  // Fetch RxNorm suggestions (mock for now - you can integrate real API)
  const fetchSuggestions = async (term) => {
    if (term.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Mock suggestions - replace with actual RxNorm API call
    const mockSuggestions = [
      'Amoxicillin 500mg',
      'Ibuprofen 200mg',
      'Aspirin 81mg',
      'Lisinopril 10mg',
      'Metformin 500mg'
    ].filter(med => med.toLowerCase().includes(term.toLowerCase()));

    setSuggestions(mockSuggestions);
    setShowSuggestions(mockSuggestions.length > 0);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'medicine') {
      fetchSuggestions(value);
    }
  };

  // Add new prescription
  const handleAddPrescription = async (e) => {
    e.preventDefault();

    if (!formData.medicine || !formData.dosage || !formData.startDate) {
      showNotification('Please fill all required fields.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, "prescriptions"), {
        userId: user.uid,
        ...formData,
        lastRefill: new Date(formData.startDate).toISOString(),
        createdAt: new Date()
      });

      showNotification('Prescription added successfully!', 'success');
      setShowAddForm(false);
      setFormData({
        medicine: '',
        dosage: '',
        startDate: '',
        endDate: '',
        notes: '',
        rxType: 'acute',
        refillDays: 30
      });
      await loadPrescriptions(user.uid);
    } catch (error) {
      console.error("Error adding prescription:", error);
      showNotification('Failed to add prescription.', 'error');
    }
  };

  // Edit prescription
  const handleEditPrescription = async (e) => {
    e.preventDefault();

    try {
      const prescriptionRef = doc(db, "prescriptions", editingIndex);
      await updateDoc(prescriptionRef, {
        ...formData,
        updatedAt: new Date()
      });

      showNotification('Prescription updated successfully!', 'success');
      setShowEditForm(false);
      setEditingIndex(null);
      setFormData({
        medicine: '',
        dosage: '',
        startDate: '',
        endDate: '',
        notes: '',
        rxType: 'acute',
        refillDays: 30
      });
      await loadPrescriptions(user.uid);
    } catch (error) {
      console.error("Error updating prescription:", error);
      showNotification('Failed to update prescription.', 'error');
    }
  };

  // Delete prescription
  const handleDeletePrescription = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "prescriptions", prescriptionId));
      showNotification('Prescription deleted successfully!', 'success');
      await loadPrescriptions(user.uid);
    } catch (error) {
      console.error("Error deleting prescription:", error);
      showNotification('Failed to delete prescription.', 'error');
    }
  };

  // Open edit form
  const openEditForm = (prescription) => {
    setFormData({
      medicine: prescription.medicine,
      dosage: prescription.dosage,
      startDate: prescription.startDate,
      endDate: prescription.endDate || '',
      notes: prescription.notes || '',
      rxType: prescription.rxType || 'acute',
      refillDays: prescription.refillDays || 30
    });
    setEditingIndex(prescription.id);
    setShowEditForm(true);
  };

  // Log dose
  const handleLogDose = (medicineName) => {
    const newDoseLogs = {
      ...doseLogs,
      [medicineName]: {
        lastTaken: new Date().toISOString()
      }
    };
    setDoseLogs(newDoseLogs);
    localStorage.setItem('doseLogs', JSON.stringify(newDoseLogs));
    showNotification(`Logged dose for ${medicineName}`, 'success');
  };

  // Calculate days remaining for refill
  const getDaysRemaining = (prescription) => {
    if (!prescription.refillDays || !prescription.lastRefill) return null;
    
    const lastRefill = new Date(prescription.lastRefill);
    const nextRefill = new Date(lastRefill.getTime() + prescription.refillDays * 86400000);
    const daysLeft = Math.ceil((nextRefill - new Date()) / 86400000);
    return daysLeft;
  };

  // Get analytics data
  const getAnalytics = () => {
    const total = prescriptions.length;
    const active = prescriptions.filter(
      p => !p.endDate || new Date(p.endDate) >= new Date()
    ).length;
    const maintenance = prescriptions.filter(p => p.rxType === 'maintenance').length;
    const upcomingRefills = prescriptions.filter(
      p => p.rxType === 'maintenance' && getDaysRemaining(p) !== null && getDaysRemaining(p) <= 7
    ).length;

    return { total, active, maintenance, upcomingRefills };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading prescriptions...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div style={currentStyles.container}>
        {/* Header */}
        <div style={currentStyles.header}>
          <div style={currentStyles.headerContent}>
            <h1 style={currentStyles.headerTitle}>
              <span style={currentStyles.headerIcon}>💊</span>
              Prescription History
            </h1>
            <p style={currentStyles.headerSubtitle}>
              Manage your prescriptions, track doses, and monitor refills
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            style={currentStyles.addButton}
          >
            + Add Prescription
          </button>
        </div>

        {/* Analytics Cards */}
        <div style={currentStyles.statsGrid}>
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>📋</div>
            <div style={currentStyles.statValue}>{analytics.total}</div>
            <div style={currentStyles.statLabel}>Total Prescriptions</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>✅</div>
            <div style={currentStyles.statValue}>{analytics.active}</div>
            <div style={currentStyles.statLabel}>Active Prescriptions</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>🔄</div>
            <div style={currentStyles.statValue}>{analytics.maintenance}</div>
            <div style={currentStyles.statLabel}>Maintenance Meds</div>
          </div>
          
          <div style={currentStyles.statCard}>
            <div style={currentStyles.statIcon}>⏰</div>
            <div style={currentStyles.statValue}>{analytics.upcomingRefills}</div>
            <div style={currentStyles.statLabel}>Upcoming Refills (7 days)</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={currentStyles.tabsContainer}>
          <button
            onClick={() => setActiveTab('prescriptions')}
            style={{
              ...currentStyles.tab,
              ...(activeTab === 'prescriptions' ? currentStyles.activeTab : {})
            }}
          >
            📋 Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('doseLogs')}
            style={{
              ...currentStyles.tab,
              ...(activeTab === 'doseLogs' ? currentStyles.activeTab : {})
            }}
          >
            💉 Dose Tracker
          </button>
          <button
            onClick={() => setActiveTab('refills')}
            style={{
              ...currentStyles.tab,
              ...(activeTab === 'refills' ? currentStyles.activeTab : {})
            }}
          >
            🔔 Refill Reminders
          </button>
        </div>

        {/* Tab Content */}
        <div style={currentStyles.mainContent}>
          {activeTab === 'prescriptions' && (
            <div style={currentStyles.prescriptionsGrid}>
              {prescriptions.length === 0 ? (
                <div style={currentStyles.emptyState}>
                  <div style={currentStyles.emptyIcon}>💊</div>
                  <h3 style={currentStyles.emptyTitle}>No prescriptions yet</h3>
                  <p style={currentStyles.emptyText}>
                    Add your first prescription to start tracking
                  </p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    style={currentStyles.emptyButton}
                  >
                    + Add Prescription
                  </button>
                </div>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} style={currentStyles.prescriptionCard}>
                    <div style={currentStyles.prescriptionHeader}>
                      <h3 style={currentStyles.medicineName}>{prescription.medicine}</h3>
                      <span style={{
                        ...currentStyles.badge,
                        backgroundColor: prescription.rxType === 'maintenance' ? '#10b981' : '#3b82f6'
                      }}>
                        {prescription.rxType === 'maintenance' ? '🔄 Maintenance' : '⚡ Acute'}
                      </span>
                    </div>
                    
                    <div style={currentStyles.prescriptionDetails}>
                      <div style={currentStyles.detailRow}>
                        <span style={currentStyles.detailLabel}>Dosage:</span>
                        <span style={currentStyles.detailValue}>{prescription.dosage}</span>
                      </div>
                      <div style={currentStyles.detailRow}>
                        <span style={currentStyles.detailLabel}>Start Date:</span>
                        <span style={currentStyles.detailValue}>{prescription.startDate}</span>
                      </div>
                      {prescription.endDate && (
                        <div style={currentStyles.detailRow}>
                          <span style={currentStyles.detailLabel}>End Date:</span>
                          <span style={currentStyles.detailValue}>{prescription.endDate}</span>
                        </div>
                      )}
                      {prescription.notes && (
                        <div style={currentStyles.detailRow}>
                          <span style={currentStyles.detailLabel}>Notes:</span>
                          <span style={currentStyles.detailValue}>{prescription.notes}</span>
                        </div>
                      )}
                      {prescription.rxType === 'maintenance' && (
                        <div style={currentStyles.detailRow}>
                          <span style={currentStyles.detailLabel}>Refill Every:</span>
                          <span style={currentStyles.detailValue}>{prescription.refillDays} days</span>
                        </div>
                      )}
                    </div>

                    {prescription.rxType === 'maintenance' && getDaysRemaining(prescription) !== null && (
                      <div style={{
                        ...currentStyles.refillAlert,
                        backgroundColor: getDaysRemaining(prescription) <= 7 ? '#fef3c7' : '#dbeafe',
                        color: getDaysRemaining(prescription) <= 7 ? '#92400e' : '#1e40af'
                      }}>
                        {getDaysRemaining(prescription) < 0 
                          ? `⚠️ OVERDUE by ${Math.abs(getDaysRemaining(prescription))} days`
                          : `⏰ ${getDaysRemaining(prescription)} days until refill`
                        }
                      </div>
                    )}

                    <div style={currentStyles.cardActions}>
                      <button 
                        onClick={() => handleLogDose(prescription.medicine)}
                        style={currentStyles.actionButton}
                      >
                        💉 Log Dose
                      </button>
                      <button 
                        onClick={() => openEditForm(prescription)}
                        style={currentStyles.actionButton}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePrescription(prescription.id)}
                        style={{...currentStyles.actionButton, color: '#ef4444'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'doseLogs' && (
            <div style={currentStyles.doseLogSection}>
              <h2 style={currentStyles.sectionTitle}>Dose Tracking</h2>
              {Object.keys(doseLogs).length === 0 ? (
                <div style={currentStyles.emptyState}>
                  <div style={currentStyles.emptyIcon}>💉</div>
                  <p style={currentStyles.emptyText}>No doses logged yet</p>
                </div>
              ) : (
                <div style={currentStyles.doseLogGrid}>
                  {Object.entries(doseLogs).map(([medicine, log]) => {
                    const lastTaken = new Date(log.lastTaken);
                    const nextDose = new Date(lastTaken.getTime() + 8 * 60 * 60 * 1000);
                    
                    return (
                      <div key={medicine} style={currentStyles.doseLogCard}>
                        <h3 style={currentStyles.doseLogMedicine}>{medicine}</h3>
                        <div style={currentStyles.doseLogDetails}>
                          <div>
                            <span style={currentStyles.doseLogLabel}>Last Dose:</span>
                            <span style={currentStyles.doseLogValue}>
                              {lastTaken.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span style={currentStyles.doseLogLabel}>Next Dose:</span>
                            <span style={currentStyles.doseLogValue}>
                              {nextDose.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'refills' && (
            <div style={currentStyles.refillSection}>
              <h2 style={currentStyles.sectionTitle}>Refill Reminders</h2>
              {prescriptions.filter(p => p.rxType === 'maintenance').length === 0 ? (
                <div style={currentStyles.emptyState}>
                  <div style={currentStyles.emptyIcon}>🔔</div>
                  <p style={currentStyles.emptyText}>No maintenance prescriptions</p>
                </div>
              ) : (
                <div style={currentStyles.refillList}>
                  {prescriptions
                    .filter(p => p.rxType === 'maintenance')
                    .map(prescription => {
                      const daysLeft = getDaysRemaining(prescription);
                      return (
                        <div key={prescription.id} style={currentStyles.refillItem}>
                          <div style={currentStyles.refillMedicine}>
                            <strong>{prescription.medicine}</strong>
                          </div>
                          <div style={{
                            ...currentStyles.refillStatus,
                            color: daysLeft < 0 ? '#dc2626' : daysLeft <= 7 ? '#f59e0b' : '#10b981'
                          }}>
                            {daysLeft < 0 
                              ? `⚠️ OVERDUE by ${Math.abs(daysLeft)} days`
                              : `${daysLeft} days remaining`
                            }
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Prescription Modal */}
        {showAddForm && (
          <div style={currentStyles.modalOverlay} onClick={() => setShowAddForm(false)}>
            <div style={currentStyles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={currentStyles.modalHeader}>
                <h2 style={currentStyles.modalTitle}>Add Prescription</h2>
                <button 
                  onClick={() => setShowAddForm(false)}
                  style={currentStyles.closeButton}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddPrescription} style={currentStyles.form}>
                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Medicine Name *</label>
                  <input
                    type="text"
                    name="medicine"
                    value={formData.medicine}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                    required
                  />
                  {showSuggestions && (
                    <div style={currentStyles.suggestionsList}>
                      {suggestions.map((suggestion, idx) => (
                        <div 
                          key={idx}
                          style={currentStyles.suggestionItem}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, medicine: suggestion }));
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Dosage *</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                    placeholder="e.g., 500mg twice daily"
                    required
                  />
                </div>

                <div style={currentStyles.formRow}>
                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                      required
                    />
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                    />
                  </div>
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Prescription Type</label>
                  <select
                    name="rxType"
                    value={formData.rxType}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                  >
                    <option value="acute">Acute (Short-term)</option>
                    <option value="maintenance">Maintenance (Long-term)</option>
                  </select>
                </div>

                {formData.rxType === 'maintenance' && (
                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Refill Every (days)</label>
                    <input
                      type="number"
                      name="refillDays"
                      value={formData.refillDays}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                      min="1"
                    />
                  </div>
                )}

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={{...currentStyles.input, minHeight: '80px'}}
                    placeholder="Additional information..."
                  />
                </div>

                <div style={currentStyles.modalActions}>
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={currentStyles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={currentStyles.submitButton}
                  >
                    Add Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Prescription Modal */}
        {showEditForm && (
          <div style={currentStyles.modalOverlay} onClick={() => setShowEditForm(false)}>
            <div style={currentStyles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={currentStyles.modalHeader}>
                <h2 style={currentStyles.modalTitle}>Edit Prescription</h2>
                <button 
                  onClick={() => setShowEditForm(false)}
                  style={currentStyles.closeButton}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditPrescription} style={currentStyles.form}>
                {/* Same form fields as Add form */}
                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Medicine Name *</label>
                  <input
                    type="text"
                    name="medicine"
                    value={formData.medicine}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                    required
                  />
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Dosage *</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                    required
                  />
                </div>

                <div style={currentStyles.formRow}>
                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                      required
                    />
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                    />
                  </div>
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Prescription Type</label>
                  <select
                    name="rxType"
                    value={formData.rxType}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                  >
                    <option value="acute">Acute (Short-term)</option>
                    <option value="maintenance">Maintenance (Long-term)</option>
                  </select>
                </div>

                {formData.rxType === 'maintenance' && (
                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Refill Every (days)</label>
                    <input
                      type="number"
                      name="refillDays"
                      value={formData.refillDays}
                      onChange={handleInputChange}
                      style={currentStyles.input}
                      min="1"
                    />
                  </div>
                )}

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={{...currentStyles.input, minHeight: '80px'}}
                  />
                </div>

                <div style={currentStyles.modalActions}>
                  <button 
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    style={currentStyles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={currentStyles.submitButton}
                  >
                    Update Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Light theme styles
const lightStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Poppins', sans-serif",
    paddingTop: '80px',
    padding: '80px 20px 40px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  loadingSpinner: {
    textAlign: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500'
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerContent: {
    flex: 1
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    fontSize: '36px'
  },
  headerSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto 32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  tabsContainer: {
    maxWidth: '1200px',
    margin: '0 auto 24px',
    display: 'flex',
    gap: '8px',
    backgroundColor: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  activeTab: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  prescriptionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  prescriptionCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  prescriptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px'
  },
  medicineName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    whiteSpace: 'nowrap'
  },
  prescriptionDetails: {
    marginBottom: '16px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right'
  },
  refillAlert: {
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px'
  },
  emptyButton: {
    padding: '12px 32px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  doseLogSection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px'
  },
  doseLogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  },
  doseLogCard: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  doseLogMedicine: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  doseLogDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  doseLogLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    display: 'block',
    marginBottom: '4px'
  },
  doseLogValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    display: 'block'
  },
  refillSection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  refillList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  refillItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  refillMedicine: {
    fontSize: '16px',
    color: '#1e293b'
  },
  refillStatus: {
    fontSize: '14px',
    fontWeight: '600'
  },
  // ✨ NEW MODAL DESIGN
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px',
    maxWidth: '650px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.4s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderBottom: 'none',
    position: 'relative',
    overflow: 'hidden'
  },
  modalTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  closeButton: {
    fontSize: '28px',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  form: {
    padding: '32px',
    overflowY: 'auto',
    maxHeight: 'calc(85vh - 100px)'
  },
  formGroup: {
    marginBottom: '24px',
    position: 'relative'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f8fafc'
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '2px solid #10b981',
    borderRadius: '12px',
    marginTop: '8px',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
    zIndex: 10,
    maxHeight: '220px',
    overflow: 'auto',
    animation: 'slideDown 0.2s ease'
  },
  suggestionItem: {
    padding: '14px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    borderBottom: '1px solid #f1f5f9'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #f1f5f9'
  },
  cancelButton: {
    padding: '14px 28px',
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
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
    backgroundColor: '#0f172a',
    color: '#f1f5f9'
  },
  loadingContainer: {
    ...lightStyles.loadingContainer,
    backgroundColor: '#0f172a'
  },
  headerTitle: {
    ...lightStyles.headerTitle,
    color: '#f1f5f9'
  },
  headerSubtitle: {
    ...lightStyles.headerSubtitle,
    color: '#94a3b8'
  },
  statCard: {
    ...lightStyles.statCard,
    backgroundColor: '#1e293b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  tabsContainer: {
    ...lightStyles.tabsContainer,
    backgroundColor: '#1e293b'
  },
  tab: {
    ...lightStyles.tab,
    color: '#94a3b8'
  },
  activeTab: {
    ...lightStyles.activeTab,
    backgroundColor: '#10b981',
    color: 'white'
  },
  prescriptionCard: {
    ...lightStyles.prescriptionCard,
    backgroundColor: '#1e293b'
  },
  medicineName: {
    ...lightStyles.medicineName,
    color: '#f1f5f9'
  },
  detailLabel: {
    ...lightStyles.detailLabel,
    color: '#94a3b8'
  },
  detailValue: {
    ...lightStyles.detailValue,
    color: '#f1f5f9'
  },
  detailRow: {
    ...lightStyles.detailRow,
    borderBottom: '1px solid #334155'
  },
  actionButton: {
    ...lightStyles.actionButton,
    borderColor: '#334155',
    color: '#94a3b8'
  },
  emptyState: {
    ...lightStyles.emptyState,
    backgroundColor: '#1e293b'
  },
  emptyTitle: {
    ...lightStyles.emptyTitle,
    color: '#f1f5f9'
  },
  emptyText: {
    ...lightStyles.emptyText,
    color: '#94a3b8'
  },
  doseLogSection: {
    ...lightStyles.doseLogSection,
    backgroundColor: '#1e293b'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#f1f5f9'
  },
  doseLogCard: {
    ...lightStyles.doseLogCard,
    backgroundColor: '#0f172a',
    borderColor: '#334155'
  },
  doseLogMedicine: {
    ...lightStyles.doseLogMedicine,
    color: '#f1f5f9'
  },
  doseLogValue: {
    ...lightStyles.doseLogValue,
    color: '#f1f5f9'
  },
  refillSection: {
    ...lightStyles.refillSection,
    backgroundColor: '#1e293b'
  },
  refillItem: {
    ...lightStyles.refillItem,
    backgroundColor: '#0f172a',
    borderColor: '#334155'
  },
  refillMedicine: {
    ...lightStyles.refillMedicine,
    color: '#f1f5f9'
  },
  // ✨ DARK MODE MODAL
  modalOverlay: {
    ...lightStyles.modalOverlay,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  modal: {
    ...lightStyles.modal,
    backgroundColor: '#1e293b',
    border: '1px solid #334155'
  },
  modalHeader: {
    ...lightStyles.modalHeader,
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
  },
  modalTitle: {
    ...lightStyles.modalTitle,
    color: 'white'
  },
  closeButton: {
    ...lightStyles.closeButton,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  form: {
    ...lightStyles.form,
    backgroundColor: '#1e293b'
  },
  label: {
    ...lightStyles.label,
    color: '#f1f5f9'
  },
  input: {
    ...lightStyles.input,
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f1f5f9'
  },
  suggestionsList: {
    ...lightStyles.suggestionsList,
    backgroundColor: '#0f172a',
    borderColor: '#10b981'
  },
  suggestionItem: {
    ...lightStyles.suggestionItem,
    color: '#f1f5f9',
    borderBottom: '1px solid #334155'
  },
  modalActions: {
    ...lightStyles.modalActions,
    borderTop: '2px solid #334155'
  },
  cancelButton: {
    ...lightStyles.cancelButton,
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#94a3b8'
  }
};