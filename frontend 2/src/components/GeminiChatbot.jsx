import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GEMINI_API_KEY = 'AIzaSyC_UIdJTeV9kIM_obGqBbPxs09j1vp3X-w';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export default function GeminiChatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Healthcare+ AI assistant. I can help you with health questions, medication reminders, and general wellness advice. How can I assist you today? 🏥'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful healthcare assistant for Healthcare+, a digital health platform.

              Context: You're helping users with health-related questions, medication reminders, wellness advice, and general healthcare guidance. Always be supportive, accurate, and remind users to consult healthcare professionals for serious concerns.

              User question: ${userMessage}

              Please provide a helpful, caring response. Keep it concise but informative. Use emojis appropriately to make the conversation friendly.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const assistantMessage = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact your healthcare provider if you have urgent questions. 🏥' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are normal blood pressure ranges?",
    "How often should I take my medications?",
    "What are signs of a medical emergency?",
    "Tips for better sleep hygiene",
    "How to manage stress naturally"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '5rem',
          height: '5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          border: '3px solid white',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
          fontSize: '2rem',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 15px 30px rgba(5, 150, 105, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.3)';
        }}
        title={isOpen ? 'Close AI Assistant' : 'Open AI Health Assistant'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '8rem',
          right: '2rem',
          width: '400px',
          maxWidth: 'calc(100vw - 4rem)',
          height: '600px',
          maxHeight: 'calc(100vh - 10rem)',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                Healthcare+ AI Assistant
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                Always online to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : '#f3f4f6',
                  color: message.role === 'user' ? 'white' : '#1f2937',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6b7280',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6b7280',
                      animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6b7280',
                      animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                    }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div style={{
              padding: '0 1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                margin: '0.75rem 0 0.5rem 0',
                fontWeight: '500'
              }}>
                Quick questions:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#f3f4f6';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your health..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                background: (!inputMessage.trim() || isLoading) ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.3;
            }
            40% {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}
