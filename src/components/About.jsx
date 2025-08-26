import React, { useState } from "react";

const About = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState("mission");

  const tabs = [
    { id: "mission", label: "Our Mission", icon: "🎯" },
    { id: "team", label: "Our Team", icon: "👥" },
    { id: "technology", label: "Technology", icon: "⚡" },
    { id: "safety", label: "Safety & Trust", icon: "🛡️" },
  ];

  const teamMembers = [
    {
      name: "Nick Narry S. Mendoza",
      role: "Chief Medical Officer",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      description: "15+ years in pharmacology and drug safety research.",
      specialties: ["Pharmacology", "Drug Safety", "Clinical Research"],
    },
    {
      name: "Jerick E. Mendez",
      role: "CTO & Co-Founder",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      description:
        "Former Google engineer specializing in healthcare technology.",
      specialties: ["AI/ML", "Healthcare Tech", "Data Science"],
    },
    {
      name: "Ross Cedric B. Nazareno",
      role: "Head of Pharmacy",
      image:
        "https://images.unsplash.com/photo-1594824956935-1bc7139a7f85?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
    {
      name: "Lance Vincent Gallardo",
      role: "Head of Pharmacy",
      image:
        "https://images.unsplash.com/photo-1594824956935-1bc7139a7f85?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
    {
      name: "Nigel R. Agojo",
      role: "Head of Pharmacy",
      image:
        "https://images.unsplash.com/photo-1594824956935-1bc7139a7f85?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      description:
        "Licensed pharmacist with expertise in medication management.",
      specialties: ["Clinical Pharmacy", "Drug Interactions", "Patient Care"],
    },
  ];

  const achievements = [
    { number: "500K+", label: "Lives Impacted", icon: "❤️" },
    { number: "99.8%", label: "Accuracy Rate", icon: "🎯" },
    { number: "50+", label: "Countries Served", icon: "🌍" },
    { number: "24/7", label: "Support Available", icon: "🔄" },
  ];

  const certifications = [
    {
      name: "FDA Compliant",
      icon: "🏛️",
      description: "Meets FDA guidelines for drug information",
    },
    {
      name: "HIPAA Certified",
      icon: "🔒",
      description: "Protects patient privacy and data security",
    },
    {
      name: "ISO 27001",
      icon: "🛡️",
      description: "International security management standards",
    },
    {
      name: "WHO Approved",
      icon: "🌐",
      description: "World Health Organization recognized",
    },
  ];

  // Theme-aware styles
  const themeStyles = {
    section: isDarkMode
      ? "py-20 bg-slate-900 relative overflow-hidden"
      : "py-20 bg-white relative overflow-hidden",

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
        : "text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed",
    },

    tabsContainer: isDarkMode
      ? "flex flex-wrap justify-center gap-4 mb-12 p-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50"
      : "flex flex-wrap justify-center gap-4 mb-12 p-2 bg-gray-100/70 backdrop-blur-sm rounded-2xl border border-gray-200/50",

    tab: (isActive) =>
      isDarkMode
        ? `px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50"
          }`
        : `px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "text-slate-600 hover:text-emerald-600 hover:bg-white/70"
          }`,

    contentCard: isDarkMode
      ? "p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-lg"
      : "p-8 bg-gray-50/70 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-lg",

    decorativeElements: {
      first: isDarkMode
        ? "absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute top-0 right-0 w-80 h-80 bg-emerald-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse",

      second: isDarkMode
        ? "absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        : "absolute bottom-0 left-0 w-80 h-80 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse",
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "mission":
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3
                  className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Transforming Healthcare Through Technology
                </h3>
                <p
                  className={`text-lg leading-relaxed mb-6 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Our mission is to make medicine safer and more accessible for
                  everyone. We believe that accurate, real-time drug information
                  should be available to healthcare professionals and patients
                  worldwide.
                </p>
                <p
                  className={`text-lg leading-relaxed mb-6 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  By leveraging cutting-edge technology and partnering with
                  medical experts, we're building a platform that prevents
                  medication errors and improves patient outcomes globally.
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Patient Safety",
                    "Global Access",
                    "Medical Innovation",
                    "Data Accuracy",
                  ].map((value, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Healthcare Technology"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-2xl"></div>
              </div>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl ${
                    isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                  } border ${
                    isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-2xl font-bold text-emerald-500 mb-1">
                    {achievement.number}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Meet Our Expert Team
              </h3>
              <p
                className={`text-lg ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Leading medical professionals and technology experts working
                together
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={`group p-6 rounded-3xl transition-all duration-500 transform hover:scale-105 ${
                    isDarkMode
                      ? "bg-slate-700/50 hover:bg-slate-700/70"
                      : "bg-white/70 hover:bg-white/90"
                  } border ${
                    isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                  } shadow-lg hover:shadow-xl`}
                >
                  <div className="relative mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-emerald-500"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4
                      className={`text-xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {member.name}
                    </h4>
                    <p className="text-emerald-500 font-semibold mb-4">
                      {member.role}
                    </p>
                    <p
                      className={`text-sm leading-relaxed mb-4 ${
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {member.description}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            isDarkMode
                              ? "bg-slate-600 text-slate-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "technology":
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Cutting-Edge Technology Stack
              </h3>
              <p
                className={`text-lg ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Built with modern technologies for reliability, speed, and
                accuracy
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                } border ${
                  isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                }`}
              >
                <h4
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  🤖 AI & Machine Learning
                </h4>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Advanced algorithms for drug interaction detection, dosage
                  optimization, and personalized recommendations.
                </p>
                <ul
                  className={`space-y-2 text-sm ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <li>• Neural networks for pattern recognition</li>
                  <li>• Natural language processing for drug queries</li>
                  <li>• Predictive analytics for side effects</li>
                </ul>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                } border ${
                  isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                }`}
              >
                <h4
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  ☁️ Cloud Infrastructure
                </h4>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Scalable, secure cloud architecture ensuring 99.9% uptime and
                  global accessibility.
                </p>
                <ul
                  className={`space-y-2 text-sm ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <li>• Multi-region deployment</li>
                  <li>• Auto-scaling infrastructure</li>
                  <li>• Real-time data synchronization</li>
                </ul>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                } border ${
                  isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                }`}
              >
                <h4
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  🔒 Security & Privacy
                </h4>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Enterprise-grade security protecting sensitive medical data
                  with encryption and compliance.
                </p>
                <ul
                  className={`space-y-2 text-sm ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <li>• End-to-end encryption</li>
                  <li>• HIPAA compliance</li>
                  <li>• Zero-trust architecture</li>
                </ul>
              </div>

              <div
                className={`p-6 rounded-2xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                } border ${
                  isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                }`}
              >
                <h4
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  📊 Real-time Analytics
                </h4>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Live monitoring and analytics for continuous improvement and
                  instant drug safety alerts.
                </p>
                <ul
                  className={`space-y-2 text-sm ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <li>• Real-time drug monitoring</li>
                  <li>• Instant safety alerts</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "safety":
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Safety & Trust First
              </h3>
              <p
                className={`text-lg ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Your safety and privacy are our top priorities
              </p>
            </div>

            {/* Certifications */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl ${
                    isDarkMode ? "bg-slate-700/50" : "bg-white/70"
                  } border ${
                    isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
                  } hover:scale-105 transition-transform duration-300`}
                >
                  <div className="text-3xl mb-3">{cert.icon}</div>
                  <h4
                    className={`font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {cert.name}
                  </h4>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Safety Measures */}
            <div
              className={`p-8 rounded-3xl ${
                isDarkMode ? "bg-slate-700/50" : "bg-white/70"
              } border ${
                isDarkMode ? "border-slate-600/50" : "border-gray-200/50"
              }`}
            >
              <h4
                className={`text-xl font-bold mb-6 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                🛡️ Our Safety Commitments
              </h4>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className={`font-semibold mb-3 text-emerald-500`}>
                    Data Protection
                  </h5>
                  <ul
                    className={`space-y-2 text-sm ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <li>• All data encrypted in transit and at rest</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Minimal data collection principle</li>
                    <li>• User control over personal information</li>
                  </ul>
                </div>

                <div>
                  <h5 className={`font-semibold mb-3 text-emerald-500`}>
                    Medical Accuracy
                  </h5>
                  <ul
                    className={`space-y-2 text-sm ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <li>• Reviewed by licensed medical professionals</li>
                    <li>• Sources from FDA, WHO, and medical journals</li>
                    <li>• Regular updates with latest research</li>
                    <li>• Clear disclaimers and limitations</li>
                  </ul>
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-xl ${
                  isDarkMode ? "bg-amber-900/20" : "bg-amber-50"
                } border ${
                  isDarkMode ? "border-amber-700/50" : "border-amber-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-amber-200" : "text-amber-700"
                  }`}
                >
                  <strong>Medical Disclaimer:</strong> This platform provides
                  general information only and is not a substitute for
                  professional medical advice. Always consult healthcare
                  professionals for medical decisions.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="about" className={themeStyles.section}>
      {/* Decorative Background Elements */}
      <div
        className={themeStyles.decorativeElements.first}
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className={themeStyles.decorativeElements.second}
        style={{ animationDelay: "3s" }}
      ></div>

      <div className={themeStyles.container}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className={themeStyles.header.badge}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            About Us
          </div>

          <h2 className={themeStyles.header.title}>
            Dedicated to
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Healthcare Excellence
            </span>
          </h2>

          <p className={themeStyles.header.subtitle}>
            Learn about our mission, team, and commitment to making healthcare
            safer and more accessible for everyone around the world.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className={themeStyles.tabsContainer}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={themeStyles.tab(activeTab === tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className={themeStyles.contentCard}>{renderTabContent()}</div>
      </div>
    </section>
  );
};

export default About;
