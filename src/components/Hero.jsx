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
        window.location.href = '/category_medicines';
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
                ? "absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse",
            
            second: isDarkMode 
                ? "absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse",
            
            third: isDarkMode 
                ? "absolute bottom-0 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                : "absolute bottom-0 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
        },
        
        badge: isDarkMode 
            ? "inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-900/50 text-emerald-300 rounded-full text-xs sm:text-sm font-semibold border border-emerald-700/50"
            : "inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold border border-emerald-200",
        
        mainHeading: isDarkMode 
            ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
            : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-800 leading-tight",
        
        subHeading: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
        
        description: isDarkMode 
            ? "text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl"
            : "text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl",
        
        primaryButton: "group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-emerald-200 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm sm:text-base",
        
        secondaryButton: isDarkMode 
            ? "group px-6 py-3 sm:px-8 sm:py-4 bg-slate-800 text-emerald-400 font-semibold rounded-xl sm:rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            : "group px-6 py-3 sm:px-8 sm:py-4 bg-white text-emerald-600 font-semibold rounded-xl sm:rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base",
        
        userInfoCard: isDarkMode 
            ? "flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg"
            : "flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 shadow-lg",
        
        userInfoText: {
            welcome: isDarkMode ? "text-xs sm:text-sm text-slate-400 font-medium" : "text-xs sm:text-sm text-slate-500 font-medium",
            name: isDarkMode ? "font-bold text-white text-sm sm:text-lg" : "font-bold text-slate-800 text-sm sm:text-lg"
        },
        
        carousel: isDarkMode 
            ? "relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-slate-800/20 backdrop-blur-sm border border-slate-700/30"
            : "relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/30",
        
        carouselButtons: isDarkMode 
            ? "bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/50 text-white p-2 sm:p-3 rounded-full transition-all duration-200 border border-slate-600/50"
            : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 border border-white/30",
        
        carouselContent: "absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8",
        carouselTitle: "text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3",
        carouselDescription: "text-white/90 text-sm sm:text-base leading-relaxed"
    };

    return (
        <section className={themeStyles.section}>
            {/* Decorative Elements */}
            <div className={themeStyles.decorativeElements.first}></div>
            <div className={themeStyles.decorativeElements.second} style={{animationDelay: '2s'}}></div>
            <div className={themeStyles.decorativeElements.third} style={{animationDelay: '4s'}}></div>
            
            <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16">
                    {/* Left Content */}
                    <div className="lg:w-1/2 space-y-6 sm:space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className={themeStyles.badge}>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Trusted Medical Resource
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-3 sm:space-y-4">
                            <h1 className={themeStyles.mainHeading}>
                                Welcome{user && !loading && (
                                    <>
                                        <br className="hidden sm:inline" />
                                        <span className="block sm:inline">{getFirstName()}!</span>
                                    </>
                                )}
                                {!user && "!"}
                            </h1>
                            <h2 className={themeStyles.subHeading}>
                                Your Medicine Safety Hub
                            </h2>
                        </div>

                        {/* Description */}
                        <p className={themeStyles.description}>
                            Ensure safe medication use with our comprehensive medicine checker and drug interaction database. Your health, our priority.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
                            <button 
                                onClick={handleViewMedicines}
                                className={themeStyles.primaryButton}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span>💊</span>
                                    <span className="hidden xs:inline">Search </span>Categories 
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                            
                            {user ? (
                                <button 
                                    onClick={() => window.location.href = '/prescription-history'}
                                    className={themeStyles.secondaryButton}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="hidden xs:inline">My </span>Prescription History
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <span className="hidden xs:inline">Get Started </span>Free
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 sm:border-3 border-emerald-400 shadow-md"
                                        onError={(e) => {
                                            console.log("Profile image failed to load, using fallback");
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getFirstName())}&background=10b981&color=fff&size=56`;
                                        }}
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={themeStyles.userInfoText.welcome}>Welcome back</p>
                                    <p className={themeStyles.userInfoText.name}>
                                        <span className="truncate block">
                                            {getFullName()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State for User Info */}
                        {user && loading && (
                            <div className={themeStyles.userInfoCard}>
                                <div className="relative">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gray-300 animate-pulse"></div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={themeStyles.userInfoText.welcome}>Welcome back</p>
                                    <div className="h-4 sm:h-5 bg-gray-300 rounded animate-pulse w-24 sm:w-32"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Carousel */}
                    <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
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
                                        <div className={themeStyles.carouselContent}>
                                            <h3 className={themeStyles.carouselTitle}>
                                                {slide.title}
                                            </h3>
                                            <p className={themeStyles.carouselDescription}>
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Navigation Arrows */}
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                                className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 ${themeStyles.carouselButtons}`}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 ${themeStyles.carouselButtons}`}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            
                            {/* Carousel Indicators */}
                            <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border border-white/50 ${
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