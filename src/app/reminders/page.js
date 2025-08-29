"use client";

import { useState, useEffect } from "react";
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

export default function RemindersPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    active: true
  });

  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadReminders(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load user reminders
  const loadReminders = async (userId) => {
    try {
      console.log("Loading reminders for user:", userId); // Debug log
      
      const remindersRef = collection(db, "reminders");
      
      // First, let's load all reminders without orderBy to avoid index issues
      const q = query(
        remindersRef,
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const remindersList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        remindersList.push({
          id: doc.id,
          ...data,
          // Ensure dates are properly handled
          createdAt: data.createdAt || new Date(),
          nextDose: data.nextDose || new Date()
        });
      });
      
      // Sort in JavaScript instead of Firestore
      remindersList.sort((a, b) => {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA; // Most recent first
      });
      
      console.log("Reminders loaded:", remindersList); // Debug log
      setReminders(remindersList);
    } catch (error) {
      console.error("Error loading reminders:", error);
      showNotification('Failed to load reminders.', 'error');
    }
  };

  // Add new reminder
  const addReminder = async () => {
    if (!user || !formData.medicineName || !formData.dosage) {
      showNotification('Please fill in required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const reminderData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date(),
        nextDose: calculateNextDose(formData),
        totalDoses: 0,
        missedDoses: 0
      };

      await addDoc(collection(db, "reminders"), reminderData);
      
      await loadReminders(user.uid);
      resetForm();
      setShowAddModal(false);
      
      showNotification('Reminder created successfully!', 'success');
    } catch (error) {
      console.error("Error adding reminder:", error);
      showNotification('Failed to create reminder.', 'error');
    }
    setSaving(false);
  };

  // Update reminder
  const updateReminder = async () => {
    if (!editingReminder || !formData.medicineName || !formData.dosage) {
      showNotification('Please fill in required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const reminderRef = doc(db, "reminders", editingReminder.id);
      const updateData = {
        ...formData,
        nextDose: calculateNextDose(formData),
        updatedAt: new Date()
      };

      await updateDoc(reminderRef, updateData);
      
      await loadReminders(user.uid);
      resetForm();
      setEditingReminder(null);
      
      showNotification('Reminder updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating reminder:", error);
      showNotification('Failed to update reminder.', 'error');
    }
    setSaving(false);
  };

  // Delete reminder
  const deleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "reminders", reminderId));
      await loadReminders(user.uid);
      showNotification('Reminder deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting reminder:", error);
      showNotification('Failed to delete reminder.', 'error');
    }
  };

  // Toggle reminder active status
  const toggleReminder = async (reminder) => {
    try {
      const reminderRef = doc(db, "reminders", reminder.id);
      await updateDoc(reminderRef, {
        active: !reminder.active,
        updatedAt: new Date()
      });
      
      await loadReminders(user.uid);
      showNotification(
        `Reminder ${!reminder.active ? 'activated' : 'deactivated'}!`, 
        'success'
      );
    } catch (error) {
      console.error("Error toggling reminder:", error);
      showNotification('Failed to update reminder.', 'error');
    }
  };

  // Update the calculateNextDose function to be more robust:
  const calculateNextDose = (reminderData) => {
    const now = new Date();
    const startDate = new Date(reminderData.startDate);
    const times = reminderData.times || ['08:00'];
    
    // Set to today initially
    let nextDose = new Date();
    
    // Find the next upcoming time
    for (const time of times) {
      const [hours, minutes] = time.split(':');
      const todayDose = new Date();
      todayDose.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If this time hasn't passed today, use it
      if (todayDose > now) {
        nextDose = todayDose;
        break;
      }
    }
    
    // If all times today have passed, use first time tomorrow
    if (nextDose <= now) {
      const [hours, minutes] = times[0].split(':');
      nextDose = new Date();
      nextDose.setDate(nextDose.getDate() + 1);
      nextDose.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    // Make sure it's not before the start date
    if (nextDose < startDate) {
      nextDose = new Date(startDate);
      const [hours, minutes] = times[0].split(':');
      nextDose.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return nextDose;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      medicineName: '',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      active: true
    });
  };

  // Start editing
  const startEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicineName: reminder.medicineName || '',
      dosage: reminder.dosage || '',
      frequency: reminder.frequency || 'daily',
      times: reminder.times || ['08:00'],
      startDate: reminder.startDate || new Date().toISOString().split('T')[0],
      endDate: reminder.endDate || '',
      notes: reminder.notes || '',
      active: reminder.active
    });
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add time slot
  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  // Remove time slot
  const removeTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  // Update time slot
  const updateTimeSlot = (index, time) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  // Format date/time
  const formatDateTime = (date) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show notification
  const showNotification = (message, type) => {
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
      max-width: 400px;
      word-wrap: break-word;
      font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading reminders...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={currentStyles.modalOverlay}>
          <div style={currentStyles.modal}>
            <div style={currentStyles.modalHeader}>
              <h3 style={currentStyles.modalTitle}>
                {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReminder(null);
                  resetForm();
                }}
                style={currentStyles.modalCloseButton}
              >
                ✕
              </button>
            </div>
            
            <div style={currentStyles.modalBody}>
              <div style={currentStyles.formGrid}>
                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Medicine Name *</label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                    placeholder="Enter medicine name"
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
                    placeholder="e.g., 1 tablet, 5ml"
                  />
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    style={currentStyles.select}
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="three_times">Three Times Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                  />
                </div>

                <div style={currentStyles.formGroup}>
                  <label style={currentStyles.label}>End Date (Optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    style={currentStyles.input}
                  />
                </div>

                <div style={currentStyles.formGroupFull}>
                  <label style={currentStyles.label}>Reminder Times</label>
                  <div style={currentStyles.timesContainer}>
                    {formData.times.map((time, index) => (
                      <div key={index} style={currentStyles.timeSlot}>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          style={currentStyles.timeInput}
                        />
                        {formData.times.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(index)}
                            style={currentStyles.removeTimeButton}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addTimeSlot}
                      style={currentStyles.addTimeButton}
                    >
                      + Add Time
                    </button>
                  </div>
                </div>

                <div style={currentStyles.formGroupFull}>
                  <label style={currentStyles.label}>Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={currentStyles.textarea}
                    placeholder="Additional instructions or notes..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div style={currentStyles.modalActions}>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingReminder(null);
                    resetForm();
                  }}
                  style={currentStyles.cancelButton}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={editingReminder ? updateReminder : addReminder}
                  style={currentStyles.saveButton}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving...' : editingReminder ? '💾 Update' : '✅ Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={currentStyles.container}>
        {/* Header */}
        <div style={currentStyles.header}>
          <div style={currentStyles.headerContent}>
            <h1 style={currentStyles.headerTitle}>
              <span style={currentStyles.headerIcon}>⏰</span>
              Medicine Reminders
            </h1>
            <p style={currentStyles.headerSubtitle}>
              Never miss a dose again
            </p>
            <div style={currentStyles.headerActions}>
              <button
                onClick={() => setShowAddModal(true)}
                style={currentStyles.addButton}
              >
                ➕ Add Reminder
              </button>
              
              <button
                onClick={() => loadReminders(user.uid)}
                style={{
                  ...currentStyles.addButton,
                  marginLeft: "12px",
                  backgroundColor: "rgba(255,255,255,0.1)"
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>
          
          {/* Stats */}
          <div style={currentStyles.statsGrid}>
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>⏰</div>
              <div style={currentStyles.statValue}>{reminders.length}</div>
              <div style={currentStyles.statLabel}>Total Reminders</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>✅</div>
              <div style={currentStyles.statValue}>
                {reminders.filter(r => r.active).length}
              </div>
              <div style={currentStyles.statLabel}>Active</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>🎯</div>
              <div style={currentStyles.statValue}>
                {reminders.reduce((total, r) => total + (r.totalDoses || 0), 0)}
              </div>
              <div style={currentStyles.statLabel}>Total Doses</div>
            </div>
            
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statIcon}>⚠️</div>
              <div style={currentStyles.statValue}>
                {reminders.reduce((total, r) => total + (r.missedDoses || 0), 0)}
              </div>
              <div style={currentStyles.statLabel}>Missed</div>
            </div>
          </div>

          {/* Reminders List */}
          <div style={currentStyles.remindersSection}>
            {reminders.length === 0 ? (
              <div style={currentStyles.emptyState}>
                <div style={currentStyles.emptyIcon}>⏰</div>
                <h3 style={currentStyles.emptyTitle}>No Reminders Set</h3>
                <p style={currentStyles.emptyText}>
                  Create your first medicine reminder to stay on track with your medication schedule.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={currentStyles.emptyButton}
                >
                  ➕ Add First Reminder
                </button>
              </div>
            ) : (
              <div style={currentStyles.remindersList}>
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    style={{
                      ...currentStyles.reminderCard,
                      ...(reminder.active ? {} : currentStyles.reminderCardInactive)
                    }}
                  >
                    <div style={currentStyles.reminderHeader}>
                      <div style={currentStyles.reminderInfo}>
                        <h4 style={currentStyles.reminderTitle}>
                          {reminder.medicineName}
                        </h4>
                        <p style={currentStyles.reminderDosage}>
                          {reminder.dosage} • {reminder.frequency.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div style={currentStyles.reminderActions}>
                        <button
                          onClick={() => toggleReminder(reminder)}
                          style={{
                            ...currentStyles.toggleButton,
                            backgroundColor: reminder.active ? '#10b981' : '#6c757d'
                          }}
                        >
                          {reminder.active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => startEdit(reminder)}
                          style={currentStyles.editButton}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          style={currentStyles.deleteButton}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div style={currentStyles.reminderDetails}>
                      <div style={currentStyles.reminderTimes}>
                        <strong>Times:</strong> {reminder.times?.join(', ') || 'Not set'}
                      </div>
                      <div style={currentStyles.reminderNext}>
                        <strong>Next dose:</strong> {formatDateTime(reminder.nextDose)}
                      </div>
                      {reminder.notes && (
                        <div style={currentStyles.reminderNotes}>
                          <strong>Notes:</strong> {reminder.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// Styles (I'll include key styles - you can extend based on your existing patterns)
const baseStyles = {
  container: {
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "60px"
  },
  
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    paddingTop: "60px"
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
    color: "#6c757d"
  },
  
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "60px 20px 40px",
    textAlign: "center",
    color: "white"
  },
  
  headerContent: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  
  headerTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "700",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px"
  },
  
  headerIcon: {
    fontSize: "48px"
  },
  
  headerSubtitle: {
    fontSize: "18px",
    opacity: 0.9,
    lineHeight: "1.6",
    marginBottom: "24px"
  },
  
  addButton: {
    padding: "12px 24px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "2px solid white",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px"
  },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px"
  },
  
  statCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    textAlign: "center",
    backgroundColor: "#ffffff"
  },
  
  statIcon: {
    fontSize: "32px",
    marginBottom: "12px"
  },
  
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#10b981",
    marginBottom: "4px"
  },
  
  statLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500"
  },
  
  remindersList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  
  reminderCard: {
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #e9ecef",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease"
  },
  
  reminderCardInactive: {
    opacity: 0.6,
    borderColor: "#6c757d"
  },
  
  reminderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px"
  },
  
  reminderInfo: {
    flex: 1
  },
  
  reminderTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#374151"
  },
  
  reminderDosage: {
    fontSize: "14px",
    color: "#6c757d"
  },
  
  reminderActions: {
    display: "flex",
    gap: "8px"
  },
  
  toggleButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    color: "white"
  },
  
  editButton: {
    padding: "8px 12px",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer"
  },
  
  deleteButton: {
    padding: "8px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer"
  },
  
  reminderDetails: {
    fontSize: "14px",
    color: "#6c757d",
    lineHeight: "1.5"
  },
  
  reminderTimes: {
    marginBottom: "4px"
  },
  
  reminderNext: {
    marginBottom: "4px"
  },
  
  reminderNotes: {
    fontStyle: "italic"
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6c757d"
  },
  
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "24px"
  },
  
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px"
  },
  
  emptyText: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "24px"
  },
  
  emptyButton: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  
  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto"
  },
  
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333333",
    margin: 0
  },
  
  modalCloseButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#6c757d",
    padding: "4px"
  },
  
  modalBody: {
    padding: "24px"
  },
  
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  
  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    gridColumn: "1 / -1"
  },
  
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  
  input: {
    padding: "10px 12px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif"
  },
  
  select: {
    padding: "10px 12px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#ffffff"
  },
  
  textarea: {
    padding: "10px 12px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    resize: "vertical"
  },
  
  timesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  
  timeSlot: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  
  timeInput: {
    padding: "8px 10px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    fontSize: "14px"
  },
  
  removeTimeButton: {
    padding: "6px 8px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer"
  },
  
  addTimeButton: {
    padding: "8px 12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer"
  },
  
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end"
  },
  
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#6c757d",
    border: "2px solid #6c757d",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  },
  
  saveButton: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

// Light and Dark themes
const lightStyles = { ...baseStyles };

const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#1a1a1a",
    color: "#ffffff"
  },
  
  modal: {
    ...baseStyles.modal,
    backgroundColor: "#2d2d2d"
  },
  
  modalTitle: {
    ...baseStyles.modalTitle,
    color: "#ffffff"
  },
  
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  
  reminderCard: {
    ...baseStyles.reminderCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  
  reminderTitle: {
    ...baseStyles.reminderTitle,
    color: "#e9ecef"
  },
  
  label: {
    ...baseStyles.label,
    color: "#e9ecef"
  },
  
  input: {
    ...baseStyles.input,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  
  select: {
    ...baseStyles.select,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  
  textarea: {
    ...baseStyles.textarea,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  },
  
  timeInput: {
    ...baseStyles.timeInput,
    backgroundColor: "#404040",
    borderColor: "#555555",
    color: "#ffffff"
  }
};

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .reminder-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .add-button:hover,
    .empty-button:hover,
    .save-button:hover {
      background-color: #0d9488 !important;
      transform: translateY(-2px);
    }
    
    .delete-button:hover {
      background-color: #dc2626 !important;
    }
    
    .edit-button:hover {
      background-color: #d97706 !important;
    }
    
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .reminder-header {
        flex-direction: column !important;
        gap: 12px !important;
      }
      
      .reminder-actions {
        align-self: flex-start !important;
      }
    }
  `;
  document.head.appendChild(style);
}