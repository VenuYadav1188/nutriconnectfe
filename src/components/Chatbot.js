import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Generate a unique session ID per browser tab (persists across re-renders)
const generateSessionId = () => {
  let id = sessionStorage.getItem('nutribot_session_id');
  if (!id) {
    id = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('nutribot_session_id', id);
  }
  return id;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useMemo(() => generateSessionId(), []);

  // Scroll to bottom every time messages update
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Backend: POST /api/ai/chat  (public, no auth needed)
      // Request DTO: { sessionId: string, message: string }
      // Response DTO: { reply: string }
      const response = await axios.post(`${API_BASE}/ai/chat`, {
        sessionId: sessionId,
        message: currentInput,
      });

      const botMessage = {
        text: response.data.reply || 'Got it!',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);

      if (!isOpen) setHasNewMessage(true);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errText =
        error.response?.data?.reply ||
        error.response?.data?.message ||
        'Oops — couldn\'t reach the server. Please try again later.';
      const errorMessage = {
        text: errText,
        sender: 'bot',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ─── Floating Container ─── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

        {/* ─── Chat Panel ─── */}
        <div
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right
            ${isOpen
              ? 'scale-100 opacity-100 translate-y-0 mb-4'
              : 'scale-75 opacity-0 translate-y-4 pointer-events-none mb-0'}
          `}
          style={{
            width: '370px',
            height: '480px',
          }}
        >
          <div
            className="w-full h-full flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(26, 29, 39, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
              boxShadow: `
                0 25px 60px rgba(0, 0, 0, 0.5),
                0 0 40px rgba(34, 197, 94, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            {/* ── Header ── */}
            <div
              className="px-5 py-4 flex items-center justify-between relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(34,197,94,0.06) 100%)',
                borderBottom: '1px solid rgba(34,197,94,0.12)',
              }}
            >
              {/* Decorative scan line */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,197,94,0.015) 3px, rgba(34,197,94,0.015) 4px)',
                }}
              />

              <div className="relative z-10 flex items-center gap-3">
                {/* Status indicator */}
                <div className="relative">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}
                  />
                  <div
                    className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping"
                    style={{ background: '#22c55e', opacity: 0.4 }}
                  />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: '#e2e8f0' }}
                  >
                    NutriBot
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: '#4ade80' }}>
                    Online
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                className="relative z-10 p-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#e2e8f0';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
                  {/* Bot avatar */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(74,222,128,0.08))',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    <span className="text-2xl">🍲</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#94a3b8' }}>
                      Welcome to NutriBot
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
                      Ask me anything about food rescue, donations, or nutrition support.
                    </p>
                  </div>
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {['How does food rescue work?', 'Tips for donors'].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setInput(q);
                          inputRef.current?.focus();
                        }}
                        className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-200"
                        style={{
                          background: 'rgba(34,197,94,0.08)',
                          color: '#4ade80',
                          border: '1px solid rgba(34,197,94,0.15)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)';
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {msg.sender === 'bot' && (
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1"
                      style={{
                        background: msg.isError
                          ? 'rgba(244,63,94,0.15)'
                          : 'rgba(34,197,94,0.12)',
                        border: msg.isError
                          ? '1px solid rgba(244,63,94,0.2)'
                          : '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      <span className="text-xs">{msg.isError ? '⚠' : '🤖'}</span>
                    </div>
                  )}
                  <div
                    className="max-w-[75%] px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={{
                      borderRadius: msg.sender === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      ...(msg.sender === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
                          }
                        : msg.isError
                          ? {
                              background: 'rgba(244,63,94,0.1)',
                              color: '#fda4af',
                              border: '1px solid rgba(244,63,94,0.15)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              color: '#e2e8f0',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }),
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1"
                    style={{
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    <span className="text-xs">🤖</span>
                  </div>
                  <div
                    className="px-4 py-3 flex items-center gap-1.5"
                    style={{
                      borderRadius: '16px 16px 16px 4px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#22c55e', animationDelay: '0ms' }} />
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#4ade80', animationDelay: '150ms' }} />
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#86efac', animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* ── Input Area ── */}
            <div
              className="px-4 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="input"
                  style={{
                    borderRadius: '12px',
                    fontSize: '13px',
                    padding: '11px 14px',
                    paddingRight: '44px',
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 p-2 rounded-lg transition-all duration-200"
                  style={{
                    background: input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                      : 'rgba(255,255,255,0.04)',
                    color: input.trim() && !isLoading ? '#fff' : '#4b5563',
                    boxShadow: input.trim() && !isLoading
                      ? '0 2px 8px rgba(34,197,94,0.3)'
                      : 'none',
                    cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ─── Toggle FAB ─── */}
        <button
          onClick={handleToggle}
          className="group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          style={{
            background: isOpen
              ? '#1a1d27'
              : 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: isOpen
              ? '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 8px 30px rgba(34,197,94,0.35), 0 0 0 1px rgba(34,197,94,0.1)',
            border: isOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}
        >
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: isOpen
                ? '0 0 20px rgba(255,255,255,0.05)'
                : '0 0 30px rgba(34,197,94,0.4)',
            }}
          />

          {isOpen ? (
            <svg className="w-5 h-5 relative z-10 transition-transform duration-300" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              {/* Chat icon */}
              <svg
                className="w-6 h-6 relative z-10"
                style={{ color: '#fff' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>

              {/* Subtle pulse ring */}
              <div
                className="absolute inset-0 rounded-2xl animate-ping pointer-events-none"
                style={{
                  border: '2px solid rgba(34,197,94,0.3)',
                  animationDuration: '2s',
                }}
              />
            </>
          )}

          {/* Unread dot */}
          {hasNewMessage && !isOpen && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center z-20"
              style={{
                background: '#f43f5e',
                boxShadow: '0 0 8px rgba(244,63,94,0.5)',
              }}
            >
              <span className="text-[9px] font-bold text-white">!</span>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default Chatbot;
