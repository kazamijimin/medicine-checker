import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Contact = ({ isDarkMode }) => {
  const [firebaseUser, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile data when Firebase user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (firebaseUser) {
        try {
          setProfileLoading(true);
          console.log("Fetching profile for user:", firebaseUser.uid);
          
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            setUserProfile(userData);
          } else {
            console.log("No user document found in Firestore");
            // If no Firestore doc, create basic profile from Firebase Auth
            const basicProfile = {
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: firebaseUser.email,
              profilePictureUrl: firebaseUser.photoURL || null
            };
            setUserProfile(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to Firebase Auth data
          const fallbackProfile = {
            firstName: firebaseUser.displayName?.split(' ')[0] || '',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: firebaseUser.email,
            profilePictureUrl: firebaseUser.photoURL || null
          };
          setUserProfile(fallbackProfile);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [firebaseUser]);

  // Auto-fill form when user profile is loaded
  useEffect(() => {
    if (firebaseUser && !loading && !profileLoading) {
      // Construct full name from firstName and lastName or use displayName as fallback
      const fullName = userProfile?.firstName && userProfile?.lastName 
        ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
        : firebaseUser.displayName || '';

      setFormData(prev => ({
        ...prev,
        email: firebaseUser.email || '',
        name: fullName
      }));
    } else if (!loading && !profileLoading) {
      // Reset form if no user
      setFormData(prev => ({
        ...prev,
        email: '',
        name: ''
      }));
    }
  }, [firebaseUser, loading, userProfile, profileLoading]);

  // Combine Firebase user and profile data
  const user = firebaseUser ? {
    ...firebaseUser,
    ...userProfile
  } : null;

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get help from our support team',
      contact: 'support@medichecker.com',
      action: 'mailto:support@medichecker.com',
      availability: '24/7 Response within 2 hours'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: '+1 (555) 123-4567',
      action: 'tel:+15551234567',
      availability: 'Mon-Fri, 9 AM - 6 PM EST'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Instant help when you need it',
      contact: 'Available on website',
      action: '#',
      availability: '24/7 Live assistance'
    },
    {
      icon: '📍',
      title: 'Office Location',
      description: 'Visit our headquarters',
      contact: 'Laguna State Polytechnic University - Santa Cruz (Main) Campus',
      action: 'https://maps.google.com',
      availability: 'Mon-Fri, 9 AM - 5 PM EST'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'medical', label: 'Medical Questions' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'bug', label: 'Bug Report' }
  ];

  const faqs = [
    {
      question: 'How accurate is the medicine information?',
      answer: 'Our database is reviewed by licensed pharmacists and updated regularly from FDA, WHO, and medical literature sources. We maintain 99.8% accuracy.'
    },
    {
      question: 'Is my personal health data secure?',
      answer: 'Yes, we use enterprise-grade encryption and are HIPAA compliant. Your data is never shared without your explicit consent.'
    },
    {
      question: 'Can I use this app outside the United States?',
      answer: 'Yes, MediChecker is available in 50+ countries. However, some features may vary based on local regulations.'
    },
    {
      question: 'How quickly will I receive a response?',
      answer: 'Email support: within 2 hours. Live chat: immediate. Phone support: during business hours.'
    }
  ];

  // Theme-aware styles
  const themeStyles = {
    section: isDarkMode 
      ? "py-20 bg-slate-900 relative overflow-hidden"
      : "py-20 bg-gray-50 relative overflow-hidden",
    
    container: "max-w-7xl mx-auto px-6 relative z-10",
    
    header: {
      badge: isDarkMode 
        ? "inline-flex items-center px-4 py-2 bg-emerald-900/50 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-700/50 mb-6"
        : "inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200 mb-6",
      
      title: isDarkMode 
        ? "text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
        : "text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight",
      
      subtitle: isDarkMode 
        ? "text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
        : "text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
    },
    
    formCard: isDarkMode 
      ? "p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-lg"
      : "p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg",
    
    contactCard: isDarkMode 
      ? "p-6 bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/50 hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-105"
      : "p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
    
    input: isDarkMode 
      ? "w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
      : "w-full px-4 py-3 bg-white/70 border border-gray-200/50 rounded-xl text-slate-800 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200",
    
    inputDisabled: isDarkMode 
      ? "w-full px-4 py-3 bg-slate-600/30 border border-slate-600/50 rounded-xl text-slate-300 placeholder-slate-500 cursor-not-allowed"
      : "w-full px-4 py-3 bg-gray-100/70 border border-gray-200/50 rounded-xl text-slate-500 placeholder-slate-400 cursor-not-allowed",
    
    button: "w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-200 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    
    decorativeElements: {
      first: isDarkMode 
        ? "absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute top-0 left-0 w-96 h-96 bg-emerald-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse",
      
      second: isDarkMode 
        ? "absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute bottom-0 right-0 w-96 h-96 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get the full name for Firebase submission
      let fullName = 'Anonymous';
      
      if (user) {
        // Priority: firstName + lastName, fallback to displayName, fallback to 'Registered User'
        if (user.firstName && user.lastName) {
          fullName = `${user.firstName} ${user.lastName}`.trim();
        } else if (user.displayName) {
          fullName = user.displayName;
        } else {
          fullName = 'Registered User';
        }
      } else if (formData.name) {
        fullName = formData.name;
      }

      // Prepare data for Firebase
      const contactData = {
        name: fullName,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        email: user ? user.email : (formData.email || 'anonymous@guest.com'),
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
        userType: user ? 'registered' : 'anonymous',
        userId: user ? user.uid : null,
        userDisplayName: user ? user.displayName : null,
        timestamp: serverTimestamp(),
        status: 'unread',
        priority: formData.category === 'medical' ? 'high' : 'normal',
        source: 'website_contact_form'
      };

      // Add to Firebase collection
      const docRef = await addDoc(collection(db, 'contact_submissions'), contactData);
      
      console.log('Contact form submitted with ID:', docRef.id);
      console.log('Submitted data:', contactData);
      
      setSubmitStatus('success');
      
      // Reset form (but keep user info if logged in)
      const resetFullName = user ? (
        user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.displayName || ''
      ) : '';

      setFormData({
        name: resetFullName,
        email: user ? user.email || '' : '',
        subject: '',
        message: '',
        category: 'general'
      });
      
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.subject && formData.message && (user || formData.email);

  // Get display name for UI
  const getDisplayName = () => {
    if (profileLoading) return 'Loading...';
    if (!user) return null;
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.displayName) {
      return user.displayName;
    } else {
      return 'User';
    }
  };

  return (
    <section id="contact" className={themeStyles.section}>
      {/* Decorative Background Elements */}
      <div className={themeStyles.decorativeElements.first} style={{animationDelay: '0s'}}></div>
      <div className={themeStyles.decorativeElements.second} style={{animationDelay: '2s'}}></div>
      
      <div className={themeStyles.container}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className={themeStyles.header.badge}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Get In Touch
          </div>
          
          <h2 className={themeStyles.header.title}>
            We're Here to
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Help You
            </span>
          </h2>
          
          <p className={themeStyles.header.subtitle}>
            Have questions about our platform? Need technical support? Want to partner with us? 
            We'd love to hear from you and help in any way we can.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className={themeStyles.formCard}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Send us a Message
                </h3>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Logged in as {getDisplayName()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Submitting as guest
                    </span>
                  </div>
                )}
              </div>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-xl">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center">
                    <span className="mr-2">❌</span>
                    Sorry, there was an error sending your message. Please try again.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name {!user && '*'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={user ? "Auto-filled from your account" : "Your full name"}
                      className={user ? themeStyles.inputDisabled : themeStyles.input}
                      required={!user}
                      disabled={user && (user.firstName || user.displayName)}
                    />
                    {user && !user.firstName && !user.displayName && (
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        You can update your name in your profile settings
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email Address {!user && '*'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={user ? "Auto-filled from your account" : "your.email@example.com"}
                      className={user ? themeStyles.inputDisabled : themeStyles.input}
                      required={!user}
                      disabled={user}
                    />
                    {user && (
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        We'll respond to your registered email
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={themeStyles.input}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      className={themeStyles.input}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className={themeStyles.input}
                    required
                  />
                </div>
                
                {!user && (
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                      <strong>💡 Tip:</strong> Sign in to auto-fill your information and track your inquiries in your dashboard.
                    </p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={themeStyles.button}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📧</span>
                      Send Message
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Contact Information
            </h3>
            
            {contactInfo.map((info, index) => (
              <div key={index} className={themeStyles.contactCard}>
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {info.title}
                    </h4>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {info.description}
                    </p>
                    <a 
                      href={info.action}
                      className="text-emerald-500 hover:text-emerald-400 font-medium text-sm transition-colors duration-200"
                    >
                      {info.contact}
                    </a>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {info.availability}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Social Media */}
            <div className={themeStyles.contactCard}>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Follow Us
              </h4>
              <div className="flex space-x-4">
                <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200">📘</a>
                <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200">🐦</a>
                <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200">📷</a>
                <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200">💼</a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={themeStyles.formCard}>
          <h3 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50/70'} border ${isDarkMode ? 'border-slate-600/50' : 'border-gray-200/50'}`}>
                <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {faq.question}
                </h4>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className={`mt-8 p-6 rounded-2xl border-2 ${isDarkMode ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-2xl">🚨</span>
            <div className="text-center">
              <h4 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                Medical Emergency?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                For medical emergencies, please call your local emergency services immediately. 
                This platform is not for emergency medical situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;