import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Heart,
  FileText,
  DollarSign,
  Phone,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your HealthCare+ AI assistant. I can help you with medication reminders, health questions, and government scheme applications. How can I assist you today?',
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        'Tell me about government health schemes',
        'Help with medication schedules',
        'Explain my lab reports',
        'Emergency contacts'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = {
    schemes: {
      content: "Here are the government health schemes you may be eligible for:\n\n🏥 **Ayushman Bharat (PM-JAY)**\n- Coverage: ₹5 lakh per family per year\n- Eligibility: Based on SECC-2011 database\n\n💊 **Jan Aushadhi**\n- Generic medicines at 50-80% lower cost\n- 9000+ stores across India\n\n👵 **Senior Citizen Health Insurance**\n- Special rates for 60+ age group\n- Pre-existing condition coverage\n\nWould you like me to help you apply for any of these schemes?",
      suggestions: ['Help me apply for Ayushman Bharat', 'Find Jan Aushadhi stores nearby', 'Check my eligibility']
    },
    medication: {
      content: "I can help you optimize your medication schedule! 💊\n\nBased on your current medications:\n- Metformin: Best taken with meals\n- Lisinopril: Morning is optimal\n- Vitamin D3: With fatty food for better absorption\n\n⚡ **Smart Tips:**\n- Set reminders 30 minutes before meals\n- Use pill organizer for weekly planning\n- Track side effects in the app\n\nWould you like me to set up personalized reminders?",
      suggestions: ['Set up smart reminders', 'Track side effects', 'Medication interactions']
    },
    reports: {
      content: "I can help explain your health reports in simple terms! 📊\n\n**Recent Blood Test Summary:**\n✅ Blood Sugar: 95 mg/dL (Normal)\n✅ Blood Pressure: 120/80 (Optimal)\n⚠️ Cholesterol: 210 mg/dL (Borderline high)\n\n**Recommendations:**\n- Continue current diabetes management\n- Consider dietary changes for cholesterol\n- Regular exercise (30 min/day)\n\nShall I create a personalized health plan?",
      suggestions: ['Create health plan', 'Diet recommendations', 'Exercise routine']
    },
    emergency: {
      content: "📞 **Emergency Contacts**\n\n🚨 **Medical Emergency:** 102\n🚑 **Ambulance:** 108\n🏥 **Nearest Hospital:** City General Hospital\n   📍 2.3 km away | ⏱️ 8 min drive\n\n👨‍⚕️ **Your Doctor:**\nDr. Rajesh Kumar - Cardiologist\n📞 +91 98765 43210\n\n👥 **Emergency Contacts:**\n- Spouse: +91 98765 12345\n- Son: +91 98765 67890\n\nWould you like me to call someone for you?",
      suggestions: ['Call my doctor', 'Call family member', 'Find nearest pharmacy']
    }
  };

  const getBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('scheme') || lowerMessage.includes('government') || lowerMessage.includes('insurance')) {
      return {
        id: Date.now().toString(),
        content: mockResponses.schemes.content,
        isBot: true,
        timestamp: new Date(),
        suggestions: mockResponses.schemes.suggestions
      };
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('pill') || lowerMessage.includes('medicine')) {
      return {
        id: Date.now().toString(),
        content: mockResponses.medication.content,
        isBot: true,
        timestamp: new Date(),
        suggestions: mockResponses.medication.suggestions
      };
    } else if (lowerMessage.includes('report') || lowerMessage.includes('test') || lowerMessage.includes('lab')) {
      return {
        id: Date.now().toString(),
        content: mockResponses.reports.content,
        isBot: true,
        timestamp: new Date(),
        suggestions: mockResponses.reports.suggestions
      };
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      return {
        id: Date.now().toString(),
        content: mockResponses.emergency.content,
        isBot: true,
        timestamp: new Date(),
        suggestions: mockResponses.emergency.suggestions
      };
    } else {
      return {
        id: Date.now().toString(),
        content: `I understand you're asking about "${userMessage}". I'm here to help with:\n\n• Government health schemes and applications\n• Medication management and reminders\n• Lab report explanations\n• Emergency contacts and assistance\n• General health questions\n\nPlease choose from the suggestions below or ask me something specific!`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'Government health schemes',
          'Medication help',
          'Explain my reports',
          'Emergency assistance'
        ]
      };
    }
  };

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(messageToSend);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 md:bottom-6 right-4 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg relative"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
            />
          </Button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-6 right-4 z-50 w-80 md:w-96 max-w-[calc(100vw-2rem)] shadow-2xl"
          >
            <Card className="border-0 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">HealthCare+ Assistant</CardTitle>
                      <p className="text-xs text-blue-100 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        Online
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} gap-2`}
                      >
                        {message.isBot && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isBot
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        
                        {!message.isBot && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Suggestions */}
                    {messages.length > 0 && messages[messages.length - 1].isBot && messages[messages.length - 1].suggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 pl-10"
                      >
                        {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-7 px-2"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </motion.div>
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start gap-2"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                              className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      size="icon"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick('Emergency help')}
                      className="text-xs flex-1"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Emergency
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick('Government schemes')}
                      className="text-xs flex-1"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Schemes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick('Medication help')}
                      className="text-xs flex-1"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Health
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}