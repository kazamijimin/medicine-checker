// filepath: c:\Users\balli\Desktop\medicine-checker\src\components\Footer.jsx
import React, { useState } from 'react';

const Footer = ({ isDarkTheme }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  
  const medicineFilters = ['All', '#', '0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  return (
    <div className={`min-h-screen font-['Poppins',sans-serif] transition-all duration-300 ${
      isDarkTheme ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header Section */}
      <div className={`p-4 transition-colors duration-300 ${
        isDarkTheme ? 'bg-slate-800' : 'bg-white shadow-sm border-b border-gray-200'
      }`}>
        {/* Top Bar with Language */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
              EN/ES
            </span>
          </div>
        </div>

        {/* Medicine Directory Header */}
        <div className="mb-6">
          <h1 className={`text-xl font-bold mb-2 tracking-wide ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            MEDICINE DIRECTORY
          </h1>
          <p className={`text-sm leading-relaxed ${
            isDarkTheme ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Search and verify medicines by alphabetical order A to Z. Your trusted healthcare companion.
          </p>
        </div>

        {/* Alphabetical Filter Navigation */}
        <div className="flex flex-wrap gap-2">
          {medicineFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                selectedFilter === filter
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : isDarkTheme
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-emerald-400'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-emerald-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Display Area */}
      <div className="flex-1 p-6">
        <div className={`text-center py-20 ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
          <div className="mb-6">
            {/* Medicine Pills Icon */}
            <div className="relative mx-auto w-16 h-16 mb-4">
              <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full animate-bounce"></div>
            </div>
          </div>
          <p className="text-lg font-medium">
            Medicines starting with "{selectedFilter}" will be displayed here
          </p>
          <p className={`text-sm mt-2 ${isDarkTheme ? 'text-slate-600' : 'text-gray-400'}`}>
            Browse our comprehensive medicine database
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <footer className={`p-8 transition-colors duration-300 ${
        isDarkTheme ? 'bg-slate-800' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    Medicine Checker
                  </span>
                  <p className="text-emerald-400 text-xs font-semibold">Drug Verification System</p>
                </div>
              </div>
              
              <p className={`text-sm mb-4 leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
                Copyright © Medicine Checker. All Rights Reserved
              </p>
              
              <p className={`text-xs mb-4 leading-relaxed ${isDarkTheme ? 'text-slate-500' : 'text-gray-500'}`}>
                Disclaimer: This platform provides general information only. Always consult healthcare professionals for medical advice.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-3">
                {['twitter', 'facebook', 'email'].map((platform, index) => (
                  <div key={platform} className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                    isDarkTheme 
                      ? 'bg-slate-600 hover:bg-emerald-600 text-slate-300 hover:text-white' 
                      : 'bg-gray-200 hover:bg-emerald-500 text-gray-600 hover:text-white'
                  }`}>
                    <span className="text-sm">📱</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-gray-800'}`}>
                Help
              </h3>
              <ul className="space-y-3">
                {['Contact', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`transition-colors duration-200 hover:translate-x-1 transform ${
                      isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                    }`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links Section */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${isDarkTheme ? 'text-slate-300' : 'text-gray-800'}`}>
                Medicine Links
              </h3>
              <ul className="space-y-3">
                {['Medicine Database', 'Drug Interactions', 'Popular Searches', 'Emergency Medicines'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`transition-colors duration-200 hover:translate-x-1 transform ${
                      isDarkTheme ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                    }`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className={`mt-8 pt-6 border-t transition-colors duration-300 ${
            isDarkTheme ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Medical Disclaimer: This platform does not store any medical files on its server. All content is provided by verified third-party medical sources.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;