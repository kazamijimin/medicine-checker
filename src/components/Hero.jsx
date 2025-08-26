import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { supabase } from '../lib/supabase';

const Hero = ({ isDarkMode }) => {
    const [firebaseUser] = useAuthState(auth);
    const [userProfile, setUserProfile] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Fetch user profile data when Firebase user changes
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (firebaseUser) {
                try {
                    setLoading(true);
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
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [firebaseUser]);

    const slides = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            title: 'Medicine Safety',
            description: 'Check medicine interactions and safety information'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            title: 'Drug Information',
            description: 'Access comprehensive drug database and guidelines'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            title: 'Health Monitoring',
            description: 'Track your medications and health progress'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const getFirstName = () => {
        if (loading) return 'User';
        
        if (userProfile?.firstName) {
            return userProfile.firstName;
        }
        if (firebaseUser?.displayName) {
            return firebaseUser.displayName.split(' ')[0];
        }
        if (firebaseUser?.email) {
            return firebaseUser.email.split('@')[0];
        }
        return 'User';
    };

    const getFullName = () => {
        if (loading) return 'Loading...';
        
        if (userProfile?.firstName && userProfile?.lastName) {
            return `${userProfile.firstName} ${userProfile.lastName}`;
        }
        if (firebaseUser?.displayName) {
            return firebaseUser.displayName;
        }
        if (firebaseUser?.email) {
            return firebaseUser.email;
        }
        return 'User';
    };

    const getProfilePicture = () => {
        // Priority: Firestore profilePictureUrl > Firebase photoURL > Letter avatar
        if (userProfile?.profilePictureUrl) {
            return userProfile.profilePictureUrl;
        }
        if (firebaseUser?.photoURL) {
            return firebaseUser.photoURL;
        }
        // Generate letter avatar
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(getFirstName())}&background=10b981&color=fff&size=56`;
    };

    const handleViewMedicines = () => {
        window.location.href = '/medicines';
    };

    // Combine Firebase user and profile data
    const user = firebaseUser ? {
        ...firebaseUser,
        ...userProfile
    } : null;

    // Theme-aware styles
    const themeStyles = {
        section: isDarkMode 
            ? "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative"
            : "min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative",
        
        decorativeElements: {
            first: isDarkMode 
                ? "absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute top-0 left-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse",
            
            second: isDarkMode 
                ? "absolute top-0 right-0 w-72 h-72 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute top-0 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse",
            
            third: isDarkMode 
                ? "absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
        },
        
        badge: isDarkMode 
            ? "inline-flex items-center px-4 py-2 bg-emerald-900/50 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-700/50"
            : "inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200",
        
        mainHeading: isDarkMode 
            ? "text-5xl lg:text-7xl font-bold text-white leading-tight"
            : "text-5xl lg:text-7xl font-bold text-slate-800 leading-tight",
        
        description: isDarkMode 
            ? "text-xl text-slate-300 leading-relaxed max-w-2xl"
            : "text-xl text-slate-600 leading-relaxed max-w-2xl",
        
        secondaryButton: isDarkMode 
            ? "group px-8 py-4 bg-slate-800 text-emerald-400 font-semibold rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
            : "group px-8 py-4 bg-white text-emerald-600 font-semibold rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105",
        
        userInfoCard: isDarkMode 
            ? "flex items-center gap-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg"
            : "flex items-center gap-4 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg",
        
        userInfoText: {
            welcome: isDarkMode ? "text-sm text-slate-400 font-medium" : "text-sm text-slate-500 font-medium",
            name: isDarkMode ? "font-bold text-white text-lg" : "font-bold text-slate-800 text-lg"
        },
        
        carousel: isDarkMode 
            ? "relative w-full h-96 overflow-hidden rounded-3xl shadow-2xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30"
            : "relative w-full h-96 overflow-hidden rounded-3xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/30",
        
        carouselButtons: isDarkMode 
            ? "bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/50 text-white p-3 rounded-full transition-all duration-200 border border-slate-600/50"
            : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 border border-white/30"
    };

    return (
        <section className={themeStyles.section}>
            {/* Decorative Elements */}
            <div className={themeStyles.decorativeElements.first}></div>
            <div className={themeStyles.decorativeElements.second} style={{animationDelay: '2s'}}></div>
            <div className={themeStyles.decorativeElements.third} style={{animationDelay: '4s'}}></div>
            
            <div className="container mx-auto px-6 py-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Left Content */}
                    <div className="lg:w-1/2 space-y-8">
                        {/* Badge */}
                        <div className={themeStyles.badge}>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Trusted Medical Resource
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className={themeStyles.mainHeading}>
                                Welcome{user && !loading && `, ${getFirstName()}`}!
                            </h1>
                            <h2 className="text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Your Medicine Safety Hub
                            </h2>
                        </div>

                        {/* Description */}
                        <p className={themeStyles.description}>
                            Ensure safe medication use with our comprehensive medicine checker and drug interaction database. Your health, our priority.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleViewMedicines}
                                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-emerald-200 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span>💊</span>
                                    View Medicine Pages
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                            
                            {user ? (
                                <button 
                                    onClick={() => window.location.href = '/dashboard'}
                                    className={themeStyles.secondaryButton}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Go to Dashboard
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => window.location.href = '/signup'}
                                    className={themeStyles.secondaryButton}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Get Started Free
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* User Info Card */}
                        {user && !loading && (
                            <div className={themeStyles.userInfoCard}>
                                <div className="relative">
                                    <img 
                                        src={getProfilePicture()} 
                                        alt="Profile"
                                        className="w-14 h-14 rounded-full border-3 border-emerald-400 shadow-md"
                                        onError={(e) => {
                                            console.log("Profile image failed to load, using fallback");
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getFirstName())}&background=10b981&color=fff&size=56`;
                                        }}
                                    />
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <p className={themeStyles.userInfoText.welcome}>Welcome back</p>
                                    <p className={themeStyles.userInfoText.name}>
                                        {getFullName()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State for User Info */}
                        {user && loading && (
                            <div className={themeStyles.userInfoCard}>
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-gray-300 animate-pulse"></div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <p className={themeStyles.userInfoText.welcome}>Welcome back</p>
                                    <div className="h-5 bg-gray-300 rounded animate-pulse w-32"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Carousel */}
                    <div className="lg:w-1/2">
                        <div className={themeStyles.carousel}>
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                    }`}
                                >
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent">
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <h3 className="text-white text-2xl font-bold mb-3">
                                                {slide.title}
                                            </h3>
                                            <p className="text-white/90 text-base leading-relaxed">
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Navigation Arrows */}
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${themeStyles.carouselButtons}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${themeStyles.carouselButtons}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            
                            {/* Carousel Indicators */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 ${
                                            index === currentSlide 
                                                ? 'bg-white scale-125 shadow-lg' 
                                                : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;