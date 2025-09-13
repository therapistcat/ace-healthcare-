import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GEMINI_API_KEY = 'AIzaSyC_UIdJTeV9kIM_obGqBbPxs09j1vp3X-w';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export default function DoctorChatbot({ selectedPatient, patientData }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello Doctor! I\'m your AI assistant for patient analysis. I can help you with patient summaries, medical insights, treatment recommendations, and report analysis. How can I assist you today? 🩺'
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

  // Generate patient context for AI
  const generatePatientContext = () => {
    if (!selectedPatient || !patientData) {
      return "No patient currently selected. Please select a patient to get specific medical insights.";
    }

    return `
Current Patient: ${selectedPatient.name}
Age: ${selectedPatient.age || 'Not specified'}
Gender: ${selectedPatient.gender || 'Not specified'}
Medical History: ${selectedPatient.medicalHistory || 'No significant history recorded'}
Current Medications: ${selectedPatient.medications?.map(med => `${med.name} (${med.dosage})`).join(', ') || 'No current medications'}
Recent Vitals: 
- Blood Pressure: ${patientData.vitals?.bloodPressure || 'Not recorded'}
- Heart Rate: ${patientData.vitals?.heartRate || 'Not recorded'}
- Temperature: ${patientData.vitals?.temperature || 'Not recorded'}
- Weight: ${patientData.vitals?.weight || 'Not recorded'}
Recent Lab Results: ${patientData.labResults || 'No recent lab results'}
Last Consultation: ${selectedPatient.lastConsultation || 'No previous consultation'}
Current Symptoms: ${selectedPatient.currentSymptoms || 'No current symptoms reported'}
`;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const patientContext = generatePatientContext();
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI medical assistant for doctors using Healthcare+. You help doctors analyze patient data, provide medical insights, and suggest treatment approaches.

IMPORTANT GUIDELINES:
- Always remind doctors that this is AI assistance and not a replacement for clinical judgment
- Provide evidence-based insights when possible
- Suggest further tests or consultations when appropriate
- Be concise but thorough in medical analysis
- Use medical terminology appropriately but explain complex terms
- Always emphasize patient safety and standard medical protocols

PATIENT CONTEXT:
${patientContext}

DOCTOR'S QUESTION: ${userMessage}

Please provide a helpful, professional medical analysis or recommendation. If the question is about generating a patient summary, provide a comprehensive overview including key health metrics, medication compliance, risk factors, and recommendations for next steps.`
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent medical advice
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
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or consult with colleagues if you have urgent medical questions. 🩺' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Generate patient summary report",
    "Analyze current medication regimen",
    "Review vital signs trends",
    "Suggest diagnostic tests",
    "Risk assessment analysis",
    "Treatment plan recommendations"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          boxShadow: '0 8px 25px rgba(30, 64, 175, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 12px 30px rgba(30, 64, 175, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 8px 25px rgba(30, 64, 175, 0.3)';
        }}
        title="Doctor AI Assistant"
      >
        🩺
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      height: '600px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '2px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '1rem',
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🩺</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
              {t('doctorAssistant') || 'Doctor AI Assistant'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
              {selectedPatient ? `Patient: ${selectedPatient.name}` : 'No patient selected'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            <div style={{
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                : '#f8fafc',
              color: message.role === 'user' ? 'white' : '#1f2937',
              padding: '0.75rem 1rem',
              borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              padding: '0.75rem 1rem',
              borderRadius: '18px 18px 18px 4px',
              fontSize: '0.9rem'
            }}>
              🤔 Analyzing patient data...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div style={{
          padding: '0 1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            margin: '0.5rem 0',
            textAlign: 'center'
          }}>
            Quick questions:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            {quickQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#475569'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e2e8f0';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f1f5f9';
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
          placeholder={selectedPatient ? "Ask about this patient..." : "Select a patient first..."}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'Poppins, sans-serif'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          style={{
            background: isLoading || !inputMessage.trim() 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem',
            cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            minWidth: '3rem'
          }}
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}
