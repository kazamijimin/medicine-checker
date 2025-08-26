import React from 'react';

const Features = ({ isDarkMode }) => {
  const features = [
    {
      id: 1,
      icon: '🔍',
      title: 'Medicine Search',
      description: 'Quickly search our extensive database of medicines by name, brand, or generic composition.',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: isDarkMode ? 'from-emerald-900/20 to-teal-900/20' : 'from-emerald-50 to-teal-50'
    },
    {
      id: 2,
      icon: '⚠️',
      title: 'Drug Interactions',
      description: 'Check for dangerous drug interactions and get safety warnings before taking medications.',
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: isDarkMode ? 'from-amber-900/20 to-orange-900/20' : 'from-amber-50 to-orange-50'
    },
    {
      id: 3,
      icon: '📊',
      title: 'Dosage Information',
      description: 'Get accurate dosage information, administration guidelines, and timing recommendations.',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: isDarkMode ? 'from-blue-900/20 to-indigo-900/20' : 'from-blue-50 to-indigo-50'
    },
    {
      id: 4,
      icon: '🏥',
      title: 'Medical Guidelines',
      description: 'Access WHO and FDA approved medical guidelines and treatment protocols.',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: isDarkMode ? 'from-purple-900/20 to-pink-900/20' : 'from-purple-50 to-pink-50'
    },
    {
      id: 5,
      icon: '💊',
      title: 'Pill Identifier',
      description: 'Identify unknown pills by shape, color, size, and imprint using our visual recognition.',
      gradient: 'from-rose-500 to-red-600',
      bgGradient: isDarkMode ? 'from-rose-900/20 to-red-900/20' : 'from-rose-50 to-red-50'
    },
    {
      id: 6,
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access medicine information anytime, anywhere with our responsive mobile interface.',
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: isDarkMode ? 'from-cyan-900/20 to-blue-900/20' : 'from-cyan-50 to-blue-50'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Medicines', icon: '💊' },
    { number: '100K+', label: 'Users', icon: '👥' },
    { number: '99.9%', label: 'Accuracy', icon: '✅' },
    { number: '24/7', label: 'Support', icon: '🔄' }
  ];

  // Theme-aware styles with mobile responsiveness
  const themeStyles = {
    section: isDarkMode 
      ? "py-12 sm:py-16 lg:py-20 bg-slate-900 relative overflow-hidden"
      : "py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden",
    
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",
    
    header: {
      badge: isDarkMode 
        ? "inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-900/50 text-emerald-300 rounded-full text-xs sm:text-sm font-semibold border border-emerald-700/50 mb-4 sm:mb-6"
        : "inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold border border-emerald-200 mb-4 sm:mb-6",
      
      title: isDarkMode 
        ? "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight px-4 sm:px-0"
        : "text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 leading-tight px-4 sm:px-0",
      
      subtitle: isDarkMode 
        ? "text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
        : "text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
    },
    
    statsGrid: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-12 sm:mb-16",
    
    statCard: isDarkMode 
      ? "text-center p-4 sm:p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-105"
      : "text-center p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 hover:border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
    
    statNumber: isDarkMode 
      ? "text-2xl sm:text-3xl font-bold text-emerald-400 mb-1 sm:mb-2"
      : "text-2xl sm:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2",
    
    statLabel: isDarkMode 
      ? "text-xs sm:text-sm font-medium text-slate-300"
      : "text-xs sm:text-sm font-medium text-slate-600",
    
    featuresGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",
    
    featureCard: isDarkMode 
      ? "group p-6 sm:p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
      : "group p-6 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-emerald-200 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2",
    
    featureIcon: "text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300",
    
    featureTitle: isDarkMode 
      ? "text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-emerald-400 transition-colors duration-300"
      : "text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-emerald-600 transition-colors duration-300",
    
    featureDescription: isDarkMode 
      ? "text-sm sm:text-base text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300"
      : "text-sm sm:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300",
    
    featureButton: "inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform group-hover:scale-105 hover:shadow-lg",
    
    ctaContainer: "text-center mt-12 sm:mt-16",
    
    ctaCard: isDarkMode 
      ? "p-6 sm:p-8 rounded-2xl sm:rounded-3xl border bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
      : "p-6 sm:p-8 rounded-2xl sm:rounded-3xl border bg-white/70 border-white/50 backdrop-blur-sm",
    
    ctaTitle: isDarkMode 
      ? "text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white"
      : "text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-800",
    
    ctaDescription: isDarkMode 
      ? "mb-4 sm:mb-6 text-sm sm:text-base text-slate-300"
      : "mb-4 sm:mb-6 text-sm sm:text-base text-slate-600",
    
    ctaButtons: "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center",
    
    primaryButton: "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-emerald-200 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm sm:text-base",
    
    secondaryButton: isDarkMode 
      ? "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 bg-slate-800 text-emerald-400 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-700 text-sm sm:text-base"
      : "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 bg-white text-emerald-600 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-sm sm:text-base",
    
    decorativeElements: {
      first: isDarkMode 
        ? "absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse",
      
      second: isDarkMode 
        ? "absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse",
      
      third: isDarkMode 
        ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
    }
  };

  return (
    <section id="features" className={themeStyles.section}>
      {/* Decorative Background Elements */}
      <div className={themeStyles.decorativeElements.first} style={{animationDelay: '0s'}}></div>
      <div className={themeStyles.decorativeElements.second} style={{animationDelay: '2s'}}></div>
      <div className={themeStyles.decorativeElements.third} style={{animationDelay: '4s'}}></div>
      
      <div className={themeStyles.container}>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className={themeStyles.header.badge}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Powerful Features
          </div>
          
          <h2 className={themeStyles.header.title}>
            Everything You Need for
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Safe Medicine Use
            </span>
          </h2>
          
          <p className={themeStyles.header.subtitle}>
            Comprehensive tools and resources to ensure safe, effective medication management
            with real-time information and expert guidance.
          </p>
        </div>

        {/* Stats Section */}
        <div className={themeStyles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={themeStyles.statCard}>
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{stat.icon}</div>
              <div className={themeStyles.statNumber}>{stat.number}</div>
              <div className={themeStyles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className={themeStyles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={themeStyles.featureCard}>
              {/* Feature Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl sm:rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
              
              {/* Feature Content */}
              <div className="relative z-10">
                <div className={themeStyles.featureIcon}>
                  {feature.icon}
                </div>
                
                <h3 className={themeStyles.featureTitle}>
                  {feature.title}
                </h3>
                
                <p className={themeStyles.featureDescription}>
                  {feature.description}
                </p>
                
                {/* Feature Action Button */}
                <div className="mt-4 sm:mt-6">
                  <button className={`${themeStyles.featureButton} bg-gradient-to-r ${feature.gradient}`}>
                    Learn More
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={themeStyles.ctaContainer}>
          <div className={themeStyles.ctaCard}>
            <h3 className={themeStyles.ctaTitle}>
              Ready to Get Started?
            </h3>
            <p className={themeStyles.ctaDescription}>
              Join thousands of users who trust our platform for safe medicine management.
            </p>
            <div className={themeStyles.ctaButtons}>
              <button className={themeStyles.primaryButton}>
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span className="hidden xs:inline">Start </span>Free Trial
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button className={themeStyles.secondaryButton}>
                <span className="flex items-center justify-center gap-2">
                  <span>📞</span>
                  <span className="hidden xs:inline">Contact </span>Sales
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;