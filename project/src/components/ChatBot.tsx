import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { getAIResponseStream } from '../lib/openrouter';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sanitizeDelta = (s: string) => {
    return s
      // remove list bullets like "* item" or "- item"
      .replace(/^\s*[\*\-]\s+/gm, '')
      // remove ordered list markers like "1. item"
      .replace(/^\s*\d+\.\s+/gm, '')
      // remove bold/strong markdown markers
      .replace(/\*\*/g, '')
      .replace(/__/g, '');
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hello! I\'m your SmartPYQ assistant.\n\nI can help you:\n• Find PYQ papers (exam, year, subject)\n• Analyze exam patterns and important topics\n• Share study strategies and revision tips\n\nTry one of these:\n- UPSC CSE 2022 Mains GS Paper 1\n- JEE Main 2024 Physics PYQ\n- How to use PYQs effectively?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // No topic restriction: proceed to send the user's message

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: genId(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare limited context for speed
      const history = messages
        .filter(m => !(m.isBot && m.id === '1'))
        .slice(-8)
        .map(m => ({
          role: (m.isBot ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.text
        }));

      const aiMessages: { role: 'assistant' | 'user' | 'system'; content: string }[] = [
        ...history,
        { role: 'user', content: inputMessage }
      ];

      // Create placeholder bot message and stream into it
  const botId = genId();
      setMessages(prev => [...prev, { id: botId, text: '', isBot: true, timestamp: new Date() }]);

      await getAIResponseStream(aiMessages, (delta) => {
        const clean = sanitizeDelta(delta);
        if (!clean) return;
        setMessages(prev => prev.map(m => (m.id === botId ? { ...m, text: m.text + clean } : m)));
      }, { timeoutMs: 3000 });
    } catch (error) {
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: genId(),
        text: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">SmartPYQ Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.isBot ? '' : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    message.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  </div>
                  <div className={`max-w-xs p-3 rounded-lg text-sm whitespace-pre-line ${
                    message.isBot 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-blue-100 text-blue-600">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="max-w-xs p-3 rounded-lg text-sm bg-gray-100 text-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about PYQ papers..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
    </>
  );
}