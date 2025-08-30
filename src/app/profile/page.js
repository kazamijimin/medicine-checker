"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    emailNotifications: true,
    safetyAlerts: true,
    marketingEmails: false
  });
  const [saving, setSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile picture states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const router = useRouter();
  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrefs = localStorage.getItem('userPreferences');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    if (savedPrefs) {
      const parsedPrefs = JSON.parse(savedPrefs);
      setPreferences(parsedPrefs);
      setIsDarkMode(parsedPrefs.theme === 'dark');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: userData.phone || '',
              dateOfBirth: userData.dateOfBirth || '',
              emergencyContact: userData.emergencyContact || ''
            });

            // Load preferences from Firestore if available
            if (userData.preferences) {
              const userPrefs = userData.preferences;
              setPreferences(userPrefs);
              setIsDarkMode(userPrefs.theme === 'dark');
              // Also save to localStorage
              localStorage.setItem('userPreferences', JSON.stringify(userPrefs));
              localStorage.setItem('theme', userPrefs.theme);
            }
          } else {
            setFormData({
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: '',
              dateOfBirth: '',
              emergencyContact: ''
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        
        console.log("✅ User authenticated:", currentUser.email);
      } else {
        console.log("❌ No user found, redirecting to login");
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Profile Picture Functions
  const uploadProfileImage = async () => {
    if (!selectedImage || !user) {
      showNotification('No image selected or user not authenticated.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      // Check if user is properly authenticated
      if (!user.uid) {
        throw new Error('User not properly authenticated');
      }

      // Generate unique filename
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      console.log('📁 Uploading to path:', filePath);

      // Delete old image if exists
      if (user.photoURL && user.photoURL.includes('supabase')) {
        try {
          const oldUrlParts = user.photoURL.split('/');
          const oldFileName = oldUrlParts[oldUrlParts.length - 1];
          const oldFilePath = `profile-pictures/${oldFileName}`;
          
          await supabase.storage
            .from('profile-pictures')
            .remove([oldFilePath]);
          
          console.log('🗑️ Old image removed:', oldFilePath);
        } catch (deleteError) {
          console.log('ℹ️ Could not delete old image (may not exist):', deleteError.message);
        }
      }

      // Upload new image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, selectedImage, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if file exists
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      const profilePictureUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', profilePictureUrl);

      // Get fresh user reference to avoid stale state
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User session expired. Please login again.');
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: profilePictureUrl
      });

      console.log('✅ Firebase Auth profile updated');

      // Update Firestore document
      await updateDoc(doc(db, "users", currentUser.uid), {
        profilePictureUrl: profilePictureUrl,
        photoURL: profilePictureUrl,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Firestore document updated');

      // Close modal and reset states
      setShowImageModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      
      // Update local user state with new photo URL
      setUser(prevUser => ({
        ...prevUser,
        photoURL: profilePictureUrl
      }));
      
      showNotification('Profile picture updated successfully!', 'success');
      
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      showNotification(`Failed to update profile picture: ${error.message}`, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfileImage = async () => {
    if (!user) {
      showNotification('User not authenticated.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      // Get fresh user reference
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User session expired. Please login again.');
      }

      // If there's an existing image in Supabase, try to delete it
      if (user.photoURL && user.photoURL.includes('supabase')) {
        try {
          const urlParts = user.photoURL.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `profile-pictures/${fileName}`;
          
          const { error: deleteError } = await supabase.storage
            .from('profile-pictures')
            .remove([filePath]);

          if (deleteError) {
            console.log('ℹ️ Could not delete image from storage:', deleteError.message);
          } else {
            console.log('🗑️ Image deleted from storage:', filePath);
          }
        } catch (deleteError) {
          console.log('ℹ️ Error deleting image:', deleteError.message);
        }
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: null
      });

      console.log('✅ Firebase Auth profile updated (photo removed)');

      // Update Firestore document
      await updateDoc(doc(db, "users", currentUser.uid), {
        profilePictureUrl: null,
        photoURL: null,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Firestore document updated (photo removed)');

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        photoURL: null
      }));

      showNotification('Profile picture removed successfully!', 'success');
      
    } catch (error) {
      console.error("❌ Error removing image:", error);
      showNotification(`Failed to remove profile picture: ${error.message}`, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(newPreferences);

    // If theme is being changed, update dark mode immediately
    if (key === 'theme') {
      setIsDarkMode(value === 'dark');
      // Save to localStorage immediately for instant feedback
      localStorage.setItem('theme', value);
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update Firebase Auth profile
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        updatedAt: new Date().toISOString()
      });

      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification('Failed to update profile. Please try again.', 'error');
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSavingPreferences(true);
    try {
      // Update Firestore with preferences
      await updateDoc(doc(db, "users", user.uid), {
        preferences: preferences,
        updatedAt: new Date().toISOString()
      });

      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      localStorage.setItem('theme', preferences.theme);

      showNotification('Preferences saved successfully!', 'success');
    } catch (error) {
      console.error("Error saving preferences:", error);
      showNotification('Failed to save preferences. Please try again.', 'error');
    }
    setSavingPreferences(false);
  };

  // Enhanced image validation
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file (JPG, PNG, GIF, etc.).', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB.', 'error');
        return;
      }

      // Validate image dimensions (optional)
      const img = new Image();
      img.onload = function() {
        // Check if image is reasonable size
        if (this.width < 50 || this.height < 50) {
          showNotification('Image is too small. Please select an image at least 50x50 pixels.', 'error');
          return;
        }
        
        if (this.width > 4000 || this.height > 4000) {
          showNotification('Image is too large. Please select an image smaller than 4000x4000 pixels.', 'error');
          return;
        }

        // If validation passes, set the image
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setShowImageModal(true);
        };
        reader.readAsDataURL(file);
      };
      
      img.onerror = function() {
        showNotification('Invalid image file. Please select a different image.', 'error');
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  // Add this missing function to handle profile image click
  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Improved notification function with better styling
  const showNotification = (message, type) => {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create a notification element
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

    // Remove after 5 seconds
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

  // Enhanced profile image source function
  const getProfileImageSrc = () => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    
    // Create a more personalized fallback avatar
    const displayName = user?.displayName || formData.displayName || user?.email?.split('@')[0] || 'User';
    const initials = displayName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=10b981&color=fff&size=120&font-size=0.6&bold=true`;
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={currentStyles.loadingContainer}>
          <div style={currentStyles.loadingSpinner}>
            <div style={currentStyles.spinner}></div>
            <p style={currentStyles.loadingText}>Loading your profile...</p>
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
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Image Preview Modal */}
      {showImageModal && (
        <div style={currentStyles.modalOverlay}>
          <div style={currentStyles.modal}>
            <div style={currentStyles.modalHeader}>
              <h3 style={currentStyles.modalTitle}>Update Profile Picture</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                style={currentStyles.modalCloseButton}
              >
                ✕
              </button>
            </div>
            
            <div style={currentStyles.modalBody}>
              <div style={currentStyles.imagePreviewContainer}>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={currentStyles.imagePreview}
                />
              </div>
              
              <div style={currentStyles.modalActions}>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  style={currentStyles.cancelModalButton}
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  onClick={uploadProfileImage}
                  style={currentStyles.confirmButton}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? '⏳ Uploading...' : '✅ Update Picture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={currentStyles.container}>
        {/* Hero Section */}
        <div style={currentStyles.hero}>
          <div style={currentStyles.heroBackground}>
            <div style={currentStyles.heroContent}>
              <div style={currentStyles.profileImageContainer}>
                <Image
                  src={getProfileImageSrc()}
                  alt="Profile"
                  style={currentStyles.profileImage}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || user?.email || 'User')}&background=10b981&color=fff&size=120`;
                  }}
                />
                <div 
                  style={currentStyles.profileImageOverlay}
                  onClick={handleProfileImageClick}
                  title="Change profile picture"
                >
                  <span style={currentStyles.cameraIcon}>📷</span>
                </div>
              </div>
              
              <h1 style={currentStyles.heroTitle}>
                {formData.displayName || user?.email?.split('@')[0] || 'User'}
              </h1>
              
              <p style={currentStyles.heroSubtitle}>
                {user?.email}
              </p>
              
              <div style={currentStyles.heroMeta}>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>📅</span>
                  <span>Joined {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    }) : 'Recently'
                  }</span>
                </div>
                <div style={currentStyles.metaItem}>
                  <span style={currentStyles.metaIcon}>🛡️</span>
                  <span>Account Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={currentStyles.mainContent}>
          
          {/* Tab Navigation */}
          <div style={currentStyles.tabContainer}>
            <div style={currentStyles.tabNav}>
              {[
                { id: 'profile', label: 'Profile Info', icon: '👤' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'preferences', label: 'Preferences', icon: '⚙️' },
                { id: 'activity', label: 'Activity', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...currentStyles.tabButton,
                    ...(activeTab === tab.id ? currentStyles.tabButtonActive : {})
                  }}
                >
                  <span style={currentStyles.tabIcon}>{tab.icon}</span>
                  <span style={currentStyles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={currentStyles.contentArea}>
            
            {activeTab === 'profile' && (
              <div style={currentStyles.tabContent}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>👤</span>
                    Personal Information
                  </h2>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    style={currentStyles.editButton}
                    disabled={saving}
                  >
                    {saving ? '⏳ Saving...' : isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
                  </button>
                </div>

                {/* Profile Picture Section */}
                <div style={currentStyles.profilePictureSection}>
                  <h3 style={currentStyles.subsectionTitle}>
                    <span style={currentStyles.sectionIcon}>📷</span>
                    Profile Picture
                  </h3>
                  <div style={currentStyles.profilePictureContainer}>
                    <div style={currentStyles.profilePictureDisplay}>
                      <Image
                        src={getProfileImageSrc()}
                        alt="Profile"
                        style={currentStyles.profilePictureImg}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || user?.email || 'User')}&background=10b981&color=fff&size=80`;
                        }}
                      />
                    </div>
                    <div style={currentStyles.profilePictureInfo}>
                      <p style={currentStyles.pictureInfoText}>
                        {user?.photoURL ? 'Your profile picture' : 'No profile picture set'}
                      </p>
                      <p style={currentStyles.pictureInfoSubtext}>
                        Recommended: Square image, at least 128x128 pixels, max 5MB
                      </p>
                      <div style={currentStyles.profilePictureActions}>
                        <button
                          onClick={handleProfileImageClick}
                          style={currentStyles.changePhotoButton}
                          disabled={uploadingImage}
                        >
                          📷 Change Photo
                        </button>
                        {user?.photoURL && (
                          <button
                            onClick={removeProfileImage}
                            style={currentStyles.removePhotoButton}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? '⏳ Removing...' : '🗑️ Remove'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={currentStyles.formGrid}>
                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Display Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        style={currentStyles.input}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div style={currentStyles.displayValue}>
                        {formData.displayName || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Email Address</label>
                    <div style={currentStyles.displayValue}>
                      {formData.email}
                      <span style={currentStyles.verifiedBadge}>✅ Verified</span>
                    </div>
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={currentStyles.input}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div style={currentStyles.displayValue}>
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        style={currentStyles.input}
                      />
                    ) : (
                      <div style={currentStyles.displayValue}>
                        {formData.dateOfBirth ? 
                          new Date(formData.dateOfBirth).toLocaleDateString() : 
                          'Not provided'
                        }
                      </div>
                    )}
                  </div>

                  <div style={currentStyles.formGroup}>
                    <label style={currentStyles.label}>Emergency Contact</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        style={currentStyles.input}
                        placeholder="Emergency contact name and phone"
                      />
                    ) : (
                      <div style={currentStyles.displayValue}>
                        {formData.emergencyContact || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={currentStyles.formActions}>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={currentStyles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Keep all your existing tabs - security, preferences, activity */}
            {activeTab === 'security' && (
              <div style={currentStyles.tabContent}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>🔒</span>
                    Security Settings
                  </h2>
                </div>

                <div style={currentStyles.securityGrid}>
                  <div style={currentStyles.securityCard}>
                    <div style={currentStyles.securityIcon}>🔐</div>
                    <h3 style={currentStyles.securityTitle}>Password</h3>
                    <p style={currentStyles.securityDesc}>
                      Last updated: {user?.metadata?.lastSignInTime ? 
                        new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                    <button style={currentStyles.securityButton}>
                      Change Password
                    </button>
                  </div>

                  <div style={currentStyles.securityCard}>
                    <div style={currentStyles.securityIcon}>📱</div>
                    <h3 style={currentStyles.securityTitle}>Two-Factor Auth</h3>
                    <p style={currentStyles.securityDesc}>
                      Add an extra layer of security to your account
                    </p>
                    <button style={currentStyles.securityButton}>
                      Enable 2FA
                    </button>
                  </div>

                  <div style={currentStyles.securityCard}>
                    <div style={currentStyles.securityIcon}>📧</div>
                    <h3 style={currentStyles.securityTitle}>Email Verification</h3>
                    <p style={currentStyles.securityDesc}>
                      Your email is verified and secure
                    </p>
                    <div style={currentStyles.statusBadge}>
                      ✅ Verified
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div style={currentStyles.tabContent}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>⚙️</span>
                    App Preferences
                  </h2>
                  <button
                    onClick={handleSavePreferences}
                    style={currentStyles.savePrefsButton}
                    disabled={savingPreferences}
                  >
                    {savingPreferences ? '⏳ Saving...' : '💾 Save Preferences'}
                  </button>
                </div>

                <div style={currentStyles.preferencesGrid}>
                  <div style={currentStyles.preferenceCard}>
                    <h3 style={currentStyles.preferenceTitle}>
                      <span style={currentStyles.preferenceIcon}>🎨</span>
                      Theme Preference
                    </h3>
                    <p style={currentStyles.preferenceDesc}>Choose your preferred color scheme</p>
                    <div style={currentStyles.themeSelector}>
                      <button 
                        onClick={() => handlePreferenceChange('theme', 'light')}
                        style={{
                          ...currentStyles.themeButton,
                          ...(preferences.theme === 'light' ? currentStyles.themeButtonActive : {})
                        }}
                      >
                        ☀️ Light Mode
                      </button>
                      <button 
                        onClick={() => handlePreferenceChange('theme', 'dark')}
                        style={{
                          ...currentStyles.themeButton,
                          ...(preferences.theme === 'dark' ? currentStyles.themeButtonActive : {})
                        }}
                      >
                        🌙 Dark Mode
                      </button>
                    </div>
                    <div style={currentStyles.themePreview}>
                      <span style={currentStyles.currentTheme}>
                        Current: {preferences.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </span>
                    </div>
                  </div>

                  <div style={currentStyles.preferenceCard}>
                    <h3 style={currentStyles.preferenceTitle}>
                      <span style={currentStyles.preferenceIcon}>🔔</span>
                      Notifications
                    </h3>
                    <p style={currentStyles.preferenceDesc}>Manage your notification preferences</p>
                    <div style={currentStyles.notificationOptions}>
                      <label style={currentStyles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          style={currentStyles.checkbox} 
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        />
                        <span>Email notifications</span>
                      </label>
                      <label style={currentStyles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          style={currentStyles.checkbox} 
                          checked={preferences.safetyAlerts}
                          onChange={(e) => handlePreferenceChange('safetyAlerts', e.target.checked)}
                        />
                        <span>Safety alerts</span>
                      </label>
                      <label style={currentStyles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          style={currentStyles.checkbox} 
                          checked={preferences.marketingEmails}
                          onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                        />
                        <span>Marketing emails</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div style={currentStyles.tabContent}>
                <div style={currentStyles.sectionHeader}>
                  <h2 style={currentStyles.sectionTitle}>
                    <span style={currentStyles.sectionIcon}>📊</span>
                    Account Activity
                  </h2>
                </div>

                <div style={currentStyles.activityGrid}>
                  <div style={currentStyles.statCard}>
                    <div style={currentStyles.statIcon}>🔍</div>
                    <div style={currentStyles.statValue}>127</div>
                    <div style={currentStyles.statLabel}>Medicine Searches</div>
                  </div>

                  <div style={currentStyles.statCard}>
                    <div style={currentStyles.statIcon}>⚠️</div>
                    <div style={currentStyles.statValue}>3</div>
                    <div style={currentStyles.statLabel}>Safety Alerts</div>
                  </div>

                  <div style={currentStyles.statCard}>
                    <div style={currentStyles.statIcon}>💊</div>
                    <div style={currentStyles.statValue}>12</div>
                    <div style={currentStyles.statLabel}>Verified Medicines</div>
                  </div>

                  <div style={currentStyles.statCard}>
                    <div style={currentStyles.statIcon}>📱</div>
                    <div style={currentStyles.statValue}>45</div>
                    <div style={currentStyles.statLabel}>Days Active</div>
                  </div>
                </div>

                <div style={currentStyles.recentActivity}>
                  <h3 style={currentStyles.activityTitle}>Recent Activity</h3>
                  <div style={currentStyles.activityList}>
                    {[
                      { icon: '🔍', action: 'Searched for Aspirin', time: '2 hours ago' },
                      { icon: '✅', action: 'Verified medicine authenticity', time: '1 day ago' },
                      { icon: '⚠️', action: 'Received drug interaction alert', time: '3 days ago' },
                      { icon: '📱', action: 'Updated profile information', time: '1 week ago' }
                    ].map((activity, index) => (
                      <div key={index} style={currentStyles.activityItem}>
                        <span style={currentStyles.activityIcon}>{activity.icon}</span>
                        <div style={currentStyles.activityContent}>
                          <div style={currentStyles.activityAction}>{activity.action}</div>
                          <div style={currentStyles.activityTime}>{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Quick Actions */}
          <div style={currentStyles.quickActions}>
            <h3 style={currentStyles.quickActionsTitle}>Quick Actions</h3>
            <div style={currentStyles.actionButtons}>
              <button 
                onClick={() => router.push('/dashboard')}
                style={currentStyles.actionButton}
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => router.push('/')}
                style={currentStyles.actionButton}
              >
                🔍 Search Medicine
              </button>
              <button 
                onClick={() => router.push('/settings/privacy')}
                style={currentStyles.actionButton}
              >
                🛡️ Privacy Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// Enhanced Styles with Profile Picture functionality
const baseStyles = {
  // ... keep all your existing styles ...
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
  hero: {
    minHeight: "50vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  heroBackground: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: "100%",
    minHeight: "50vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  heroContent: {
    textAlign: "center",
    color: "white",
    maxWidth: "600px",
    padding: "40px 20px"
  },
  profileImageContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: "24px"
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
  },
  profileImageOverlay: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    width: "32px",
    height: "32px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "2px solid white",
    transition: "all 0.3s ease"
  },
  cameraIcon: {
    fontSize: "14px"
  },

  // New Profile Picture Modal Styles
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
    zIndex: 1000,
    animation: "fadeIn 0.3s ease"
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
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
  imagePreviewContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px"
  },
  imagePreview: {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #10b981",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end"
  },
  cancelModalButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#6c757d",
    border: "2px solid #6c757d",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  confirmButton: {
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
  profilePictureSection: {
    marginBottom: "32px",
    padding: "24px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    border: "1px solid #e9ecef"
  },
  subsectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  profilePictureContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap"
  },
  profilePictureDisplay: {
    flexShrink: 0
  },
  profilePictureImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #10b981",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
  },
  profilePictureInfo: {
    flex: 1,
    minWidth: "200px"
  },
  pictureInfoText: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#374151"
  },
  pictureInfoSubtext: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "16px"
  },
  profilePictureActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  changePhotoButton: {
    padding: "10px 16px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  removePhotoButton: {
    padding: "10px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },

  // Keep all your existing styles from the original code...
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "12px",
    textShadow: "0 2px 10px rgba(0,0,0,0.3)"
  },
  heroSubtitle: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "24px"
  },
  heroMeta: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
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
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px"
  },
  tabContainer: {
    marginBottom: "40px"
  },
  tabNav: {
    display: "flex",
    gap: "8px",
    borderBottom: "2px solid #e9ecef",
    overflowX: "auto",
    paddingBottom: "0"
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    marginBottom: "-2px"
  },
  tabButtonActive: {
    backgroundColor: "#10b981",
    color: "white",
    borderBottom: "2px solid #10b981"
  },
  tabIcon: {
    fontSize: "16px"
  },
  tabLabel: {
    fontWeight: "600"
  },
  contentArea: {
    minHeight: "400px"
  },
  tabContent: {
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e9ecef"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  editButton: {
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
  savePrefsButton: {
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.3s ease"
  },
  displayValue: {
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  verifiedBadge: {
    fontSize: "12px",
    color: "#10b981",
    fontWeight: "600"
  },
  formActions: {
    marginTop: "24px",
    display: "flex",
    gap: "12px"
  },
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#6c757d",
    border: "2px solid #6c757d",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  securityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px"
  },
  securityCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    textAlign: "center"
  },
  securityIcon: {
    fontSize: "32px",
    marginBottom: "16px"
  },
  securityTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    margin: 0
  },
  securityDesc: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "16px",
    lineHeight: "1.5"
  },
  securityButton: {
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  preferencesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
  },
  preferenceCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef"
  },
  preferenceTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  preferenceIcon: {
    fontSize: "20px"
  },
  preferenceDesc: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "16px",
    lineHeight: "1.5"
  },
  themeSelector: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap"
  },
  themeButton: {
    padding: "12px 20px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  themeButtonActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    color: "white",
    transform: "scale(1.05)"
  },
  themePreview: {
    padding: "8px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#6c757d"
  },
  currentTheme: {
    fontWeight: "600"
  },
  notificationOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer"
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#10b981"
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },
  statCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    textAlign: "center"
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
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500"
  },
  recentActivity: {
    marginTop: "32px"
  },
  activityTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#374151"
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e9ecef"
  },
  activityIcon: {
    fontSize: "20px",
    minWidth: "24px"
  },
  activityContent: {
    flex: 1
  },
  activityAction: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "2px"
  },
  activityTime: {
    fontSize: "12px",
    color: "#6c757d"
  },
  quickActions: {
    marginTop: "40px",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e9ecef"
  },
  quickActionsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#374151"
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  actionButton: {
    padding: "12px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
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
  tabContent: {
    ...baseStyles.tabContent,
    backgroundColor: "#ffffff"
  },
  securityCard: {
    ...baseStyles.securityCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  preferenceCard: {
    ...baseStyles.preferenceCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  quickActions: {
    ...baseStyles.quickActions,
    backgroundColor: "#f8f9fa"
  },
  themePreview: {
    ...baseStyles.themePreview,
    backgroundColor: "#f8f9fa",
    color: "#6c757d"
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
  modal: {
    ...baseStyles.modal,
    backgroundColor: "#2d2d2d"
  },
  modalTitle: {
    ...baseStyles.modalTitle,
    color: "#ffffff"
  },
  modalCloseButton: {
    ...baseStyles.modalCloseButton,
    color: "#e9ecef"
  },
  tabButton: {
    ...baseStyles.tabButton,
    color: "#e9ecef"
  },
  tabContent: {
    ...baseStyles.tabContent,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040"
  },
  profilePictureSection: {
    ...baseStyles.profilePictureSection,
    backgroundColor: "#404040",
    borderColor: "#555555"
  },
  subsectionTitle: {
    ...baseStyles.subsectionTitle,
    color: "#e9ecef"
  },
  pictureInfoText: {
    ...baseStyles.pictureInfoText,
    color: "#e9ecef"
  },
  pictureInfoSubtext: {
    ...baseStyles.pictureInfoSubtext,
    color: "#b0b0b0"
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
  displayValue: {
    ...baseStyles.displayValue,
    backgroundColor: "#404040",
    color: "#ffffff"
  },
  securityCard: {
    ...baseStyles.securityCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  securityDesc: {
    ...baseStyles.securityDesc,
    color: "#b0b0b0"
  },
  preferenceCard: {
    ...baseStyles.preferenceCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  preferenceDesc: {
    ...baseStyles.preferenceDesc,
    color: "#b0b0b0"
  },
  themeButton: {
    ...baseStyles.themeButton,
    borderColor: "#555555",
    color: "#e9ecef"
  },
  themePreview: {
    ...baseStyles.themePreview,
    backgroundColor: "#404040",
    color: "#b0b0b0"
  },
  statCard: {
    ...baseStyles.statCard,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  activityTitle: {
    ...baseStyles.activityTitle,
    color: "#e9ecef"
  },
  activityItem: {
    ...baseStyles.activityItem,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  activityTime: {
    ...baseStyles.activityTime,
    color: "#b0b0b0"
  },
  quickActions: {
    ...baseStyles.quickActions,
    backgroundColor: "#2d2d2d",
    borderColor: "#404040",
    color: "#ffffff"
  },
  quickActionsTitle: {
    ...baseStyles.quickActionsTitle,
    color: "#e9ecef"
  }
};

// Add responsive CSS and animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      
      .security-grid,
      .preferences-grid,
      .activity-grid {
        grid-template-columns: 1fr !important;
      }
      
      .action-buttons {
        flex-direction: column !important;
      }
      
      .section-header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      
      .hero-meta {
        flex-direction: column !important;
        gap: 12px !important;
      }
      
      .tab-nav {
        justify-content: center !important;
      }
      
      .theme-selector {
        flex-direction: column !important;
      }
      
      .profile-picture-container {
        flex-direction: column !important;
        align-items: center !important;
      }
    }
    
    .edit-button:hover,
    .security-button:hover,
    .action-button:hover,
    .save-prefs-button:hover,
    .change-photo-button:hover,
    .confirm-button:hover {
      background-color: #0d9488 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .remove-button:hover,
    .remove-photo-button:hover {
      background-color: #dc2626 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    
    .cancel-button:hover,
    .cancel-modal-button:hover {
      background-color: #6c757d !important;
      color: white !important;
    }
    
    .profile-image-overlay:hover {
      background-color: #0d9488 !important;
      transform: scale(1.1);
    }
    
    .theme-button:hover:not(.theme-button-active) {
      background-color: rgba(16, 185, 129, 0.1) !important;
      border-color: #10b981 !important;
      transform: scale(1.02);
    }
    
    .tab-button:hover:not(.tab-button-active) {
      background-color: rgba(16, 185, 129, 0.1) !important;
    }
    
    .input:focus {
      border-color: #10b981 !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
    
    .tab-content {
      animation: fadeInUp 0.4s ease forwards;
    }
    
    .theme-button-active {
      animation: pulse 0.3s ease;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}