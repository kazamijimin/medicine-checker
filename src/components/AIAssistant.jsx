"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AIAssistant({ isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const currentStyles = isDarkMode ? darkStyles : lightStyles;

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Quick action suggestions
  const quickActions = [
    "Help - What can you do?",
    "Medicine interactions",
    "Dosage guidelines", 
    "Side effects info",
    "When to see a doctor"
  ];

  // Default welcome message
  const welcomeMessage = {
    type: 'ai',
    content: 'Hi! I\'m Nick, your MediChecker AI assistant! 😊 Ask me about medicines, symptoms, or health concerns. Type "help" anytime for guidance!',
    timestamp: new Date().toISOString()
  };

  // Load saved conversation on component mount (only if authenticated)
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`mediChecker_aiChat_${user.uid}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error loading saved messages:', error);
          setMessages([welcomeMessage]);
        }
      } else {
        setMessages([welcomeMessage]);
      }
    }
  }, [user]);

  // Save conversation whenever messages change (user-specific)
  useEffect(() => {
    if (messages.length > 0 && user) {
      localStorage.setItem(`mediChecker_aiChat_${user.uid}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage('');
    setIsLoading(true);

    // Check if asking about Nick or the team
    const lowerText = textToSend.toLowerCase();
    if (lowerText.includes('who is nick') || lowerText.includes('who\'s nick') || 
        lowerText.includes('about nick') || lowerText.includes('tell me about nick')) {
      const teamInfoMessage = {
        type: 'ai',
        content: '🎉 Great question! Nick is the CEO and Founder of MediChecker - he created this amazing project to help people with their medicine needs!\n\n👥 Our amazing team:\n\n• **Nick** - CEO & Founder of MediChecker 💊\n• **Jerick** - Creator of Tsukihime Design 🌙\n• **Lance** - Co-Founder & Creator of SSC Forum 💬\n• **Nigel** - Creator of Prescription History for MediChecker 📋\n• **Ross** - Creator of Freelance Hub 💼\n\nTogether, we\'re building tools to make healthcare and technology more accessible!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, teamInfoMessage]);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending message to /api/huggingface:", textToSend);

      // Include recent conversation context
      const recentMessages = messages.slice(-4).map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n');

      const response = await fetch('/api/huggingface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textToSend,
          context: `Recent conversation: ${recentMessages}\n\nUser is using MediChecker app for medicine information`,
          concise: true
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      // Handle both success and error cases
      let responseContent;
      if (data.response) {
        responseContent = data.response;
      } else if (data.error) {
        responseContent = "I'm having trouble right now. Please try again in a moment.";
      } else {
        responseContent = "I couldn't generate a response. Please try rephrasing your question.";
      }

      const aiMessage = {
        type: 'ai',
        content: responseContent,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered a connection error. Please check your internet and try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    const confirmed = window.confirm('Are you sure you want to clear the conversation? This cannot be undone.');
    if (confirmed) {
      setMessages([welcomeMessage]);
      if (user) {
        localStorage.removeItem(`mediChecker_aiChat_${user.uid}`);
      }
    }
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.type.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicChecker_chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render anything while checking auth or if user is not authenticated
  if (authLoading || !user) {
    return null;
  }

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={currentStyles.aiButton}
        aria-label="Open AI Assistant"
      >
        <span style={currentStyles.aiIcon}>🤖</span>
        <span style={currentStyles.aiButtonText}>AI Assistant</span>
        {messages.length > 1 && (
          <span style={currentStyles.messageCount}>{messages.length - 1}</span>
        )}
      </button>

      {/* AI Chat Window */}
      {isOpen && (
        <div style={currentStyles.chatWindow}>
          <div style={currentStyles.chatHeader}>
            <div style={currentStyles.chatTitle}>
              <span style={currentStyles.chatIcon}>🤖</span>
              <span>Nick - MediChecker AI</span>
              <span style={currentStyles.messageCounter}>
                {messages.length > 1 ? `(${messages.length - 1} messages)` : ''}
              </span>
            </div>
            <div style={currentStyles.headerButtons}>
              <button
                onClick={exportConversation}
                style={currentStyles.headerButton}
                title="Export conversation"
              >
                💾
              </button>
              <button
                onClick={clearConversation}
                style={currentStyles.headerButton}
                title="Clear conversation"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={currentStyles.closeButton}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={currentStyles.chatMessages}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...currentStyles.message,
                  ...(message.type === 'user' ? currentStyles.userMessage : currentStyles.aiMessage)
                }}
              >
                <div style={currentStyles.messageContent}>
                  {message.content}
                </div>
                <div style={currentStyles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            
            {/* Quick Action Buttons - Show only after welcome message */}
            {messages.length === 1 && (
              <div style={currentStyles.quickActions}>
                <div style={currentStyles.quickActionsTitle}>Quick questions:</div>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action)}
                    style={currentStyles.quickActionButton}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
            
            {isLoading && (
              <div style={{ ...currentStyles.message, ...currentStyles.aiMessage }}>
                <div style={currentStyles.loadingDots}>
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              </div>
            )}

            {/* Show conversation stats */}
            {messages.length > 10 && (
              <div style={currentStyles.conversationStats}>
                💬 {messages.length - 1} messages in this conversation
              </div>
            )}
          </div>

          <div style={currentStyles.chatInput}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about medicines, symptoms, or type 'help'..."
              style={currentStyles.textarea}
              rows="2"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              style={{
                ...currentStyles.sendButton,
                ...((!inputMessage.trim() || isLoading) ? currentStyles.sendButtonDisabled : {})
              }}
            >
              {isLoading ? '...' : '📤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Base styles remain the same...
const baseStyles = {
  aiButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    fontFamily: "'Poppins', sans-serif"
  },

  aiIcon: {
    fontSize: '20px'
  },

  aiButtonText: {
    fontSize: '14px'
  },

  messageCount: {
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 'bold',
    minWidth: '18px',
    textAlign: 'center'
  },

  chatWindow: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '350px',
    height: '500px',
    borderRadius: '20px',
    overflow: 'hidden',
    zIndex: 1001,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    flexDirection: 'column'
  },

  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
  },

  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '600',
    flex: 1
  },

  chatIcon: {
    fontSize: '18px'
  },

  messageCounter: {
    fontSize: '11px',
    opacity: 0.7,
    fontWeight: 'normal'
  },

  headerButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  headerButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.7,
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.7
  },

  chatMessages: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  message: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.4'
  },

  userMessage: {
    backgroundColor: '#28a745',
    color: 'white',
    alignSelf: 'flex-end',
    marginLeft: 'auto'
  },

  aiMessage: {
    backgroundColor: '#f8f9fa',
    color: '#333',
    alignSelf: 'flex-start'
  },

  messageContent: {
    marginBottom: '4px'
  },

  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },

  loadingDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  },

  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(40, 167, 69, 0.2)'
  },

  quickActionsTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#28a745',
    marginBottom: '4px'
  },

  quickActionButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(40, 167, 69, 0.3)',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#28a745',
    fontFamily: "'Poppins', sans-serif"
  },

  conversationStats: {
    textAlign: 'center',
    padding: '8px',
    fontSize: '11px',
    opacity: 0.6,
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)'
  },

  chatInput: {
    display: 'flex',
    padding: '16px',
    gap: '8px',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    alignItems: 'flex-end'
  },

  textarea: {
    flex: 1,
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    resize: 'none',
    outline: 'none'
  },

  sendButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    minWidth: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  sendButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

const lightStyles = {
  ...baseStyles,
  chatWindow: {
    ...baseStyles.chatWindow,
    backgroundColor: 'white'
  }
};

const darkStyles = {
  ...baseStyles,
  chatWindow: {
    ...baseStyles.chatWindow,
    backgroundColor: '#2d2d2d'
  },
  aiMessage: {
    backgroundColor: '#404040',
    color: '#fff'
  },
  chatHeader: {
    ...baseStyles.chatHeader,
    backgroundColor: '#404040',
    color: 'white'
  },
  textarea: {
    ...baseStyles.textarea,
    backgroundColor: '#555',
    color: 'white',
    border: '1px solid #666'
  },
  chatInput: {
    ...baseStyles.chatInput,
    backgroundColor: '#404040'
  }
};