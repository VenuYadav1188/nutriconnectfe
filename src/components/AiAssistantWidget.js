import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am the NutriConnect AI. Try asking: "Find me fresh food near me".' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/query', { query: userMessage.text });
      const { response: reply, intent, matches } = response.data;
      
      if (!reply || (Array.isArray(reply) && reply.length === 0)) {
        setMessages((prev) => [...prev, { role: 'assistant', text: "No matching food found for your query. Try a different search." }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        
        // Dynamic search if intent is 'find_food'
        if (intent === 'find_food' && matches) {
           try {
             const foodRes = await api.get('/food');
             const searchTerms = matches.split(',').map(m => m.trim().toLowerCase()).filter(m => m);
             
             if (searchTerms.length > 0) {
                 const filtered = foodRes.data.filter(f => 
                   searchTerms.some(term => 
                     (f.title && f.title.toLowerCase().includes(term)) ||
                     (f.category && f.category.toLowerCase().includes(term)) ||
                     (f.description && f.description.toLowerCase().includes(term))
                   )
                 );
                 
                 if (filtered.length > 0) {
                     const listText = filtered.slice(0, 5).map(f => `• ${f.title} (${f.category.replace('_', ' ')}) - ${f.quantityKg}kg`).join('\n');
                     setMessages((prev) => [...prev, { role: 'assistant', text: `Here's what I found:\n${listText}` }]);
                 } else {
                     setMessages((prev) => [...prev, { role: 'assistant', text: `Sorry, no active listings currently match: ${searchTerms.join(', ')}` }]);
                 }
             }
           } catch (e) {
             console.error("AI dynamic fetch failed", e);
           }
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, I couldn't reach the AI server right now.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-green-600 to-green-400 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.4)] flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform z-50 text-white"
          aria-label="Open AI Assistant"
        >
          ✨
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 glass shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 animate-slide-up border border-surface-border">
          {/* Header */}
          <div className="bg-surface px-4 py-3 flex justify-between items-center border-b border-surface-border">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-green-400">✨</span> NutriConnect AI
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto max-h-80 bg-surface/50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  data-testid={msg.isError ? "ai-error-message" : undefined}
                  style={{ whiteSpace: 'pre-wrap' }}
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white rounded-br-sm'
                      : msg.isError
                      ? 'bg-urgent-500/10 text-urgent-400 border border-urgent-500/30 rounded-bl-sm'
                      : 'bg-surface-card text-gray-200 border border-surface-border rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-surface-border rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-surface-border flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me something..."
              className="flex-1 bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white min-w-[40px] rounded-lg flex items-center justify-center transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistantWidget;
