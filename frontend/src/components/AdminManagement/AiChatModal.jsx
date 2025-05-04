import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import './aiChatModal.css'; 
import AiResponseParser from './AiResponseParser.jsx'; 

function AiChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear chat when modal opens (optional)
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'ai', content: 'Hello! How can I help you analyze and predict attendance data today?' }
      ]);
      setInput('');
      setError(null);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/analysis/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);

    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError(`Sorry, I encountered an error: ${err.message}`);
      // Keep raw error message in state for potential display
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I couldn't process that. Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
       className={`ai-chat-modal-overlay ${isOpen ? 'open' : ''}`} 
       onClick={onClose}
     > 
      <div className="ai-chat-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <div className="ai-chat-modal-header">
          <h3><MessageSquare size={20} /> AI Assistant</h3>
          <button onClick={onClose} className="ai-chat-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="ai-chat-messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-chat-message ${msg.role}`}>
               {/* Use parser for AI messages, render user messages directly */}
               {msg.role === 'ai' ? <AiResponseParser text={msg.content} /> : <p>{msg.content}</p>}
            </div>
          ))}
          {isLoading && (
            <div className="ai-chat-message ai">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          {error && (
            <div className="ai-chat-message error">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Anchor for scrolling */} 
        </div>

        <div className="ai-chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about attendance, trends, students..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="ai-chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiChatModal; 