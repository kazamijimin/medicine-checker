"use client";

import { useState, useRef, useEffect } from 'react';

const SimpleAIChat = ({ isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your health assistant. Ask me about medicines or health questions.",
      isBot: true,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || isLoading) return;

    console.log("Sending message:", message);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log("Making API call to /api/gemini...");
      
      // Use the correct API endpoint that exists in your project
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: message,
          context: 'MediChecker App - Medical information and health assistance',
          concise: true
        })
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      // Add bot response - use the correct field name
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.error || "Sorry, I couldn't process that.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        isError: !!data.error
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Connection error. Please check your internet and try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    // Floating button
    floatingButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease'
    },

    // Chat window
    chatWindow: {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: `1px solid ${isDarkMode ? '#404040' : '#e9ecef'}`
    },

    // Header
    header: {
      padding: '16px',
      backgroundColor: '#007bff',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    headerTitle: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600'
    },

    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px'
    },

    // Messages area
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },

    messageContainer: {
      display: 'flex',
      justifyContent: 'flex-start'
    },

    userMessageContainer: {
      justifyContent: 'flex-end'
    },

    message: {
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      lineHeight: '1.4'
    },

    botMessage: {
      backgroundColor: isDarkMode ? '#404040' : '#f1f3f4',
      color: isDarkMode ? '#fff' : '#333',
      borderBottomLeftRadius: '4px'
    },

    userMessage: {
      backgroundColor: '#007bff',
      color: 'white',
      borderBottomRightRadius: '4px'
    },

    errorMessage: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      border: '1px solid #ffcdd2'
    },

    timestamp: {
      fontSize: '10px',
      opacity: 0.7,
      marginTop: '4px'
    },

    loadingMessage: {
      backgroundColor: isDarkMode ? '#404040' : '#f1f3f4',
      color: isDarkMode ? '#fff' : '#666',
      fontStyle: 'italic'
    },

    // Input area
    inputArea: {
      padding: '16px',
      backgroundColor: isDarkMode ? '#404040' : '#f8f9fa',
      borderTop: `1px solid ${isDarkMode ? '#555' : '#e9ecef'}`,
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },

    input: {
      flex: 1,
      padding: '12px 16px',
      border: `1px solid ${isDarkMode ? '#666' : '#ddd'}`,
      borderRadius: '20px',
      outline: 'none',
      fontSize: '14px',
      backgroundColor: isDarkMode ? '#555' : 'white',
      color: isDarkMode ? '#fff' : '#333'
    },

    sendButton: {
      width: '40px',
      height: '40px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingButton}
        title="AI Health Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <h3 style={styles.headerTitle}>Health Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesArea}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageContainer,
                  ...(msg.isBot ? {} : styles.userMessageContainer)
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(msg.isBot ? styles.botMessage : styles.userMessage),
                    ...(msg.isError ? styles.errorMessage : {})
                  }}
                >
                  {msg.text}
                  <div style={styles.timestamp}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={styles.messageContainer}>
                <div style={{...styles.message, ...styles.botMessage, ...styles.loadingMessage}}>
                  Thinking...
                  <div style={styles.timestamp}>
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about medicines or health..."
              style={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              style={styles.sendButton}
            >
              {isLoading ? '⏳' : '→'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleAIChat;