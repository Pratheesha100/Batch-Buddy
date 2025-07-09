import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/analysis/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error processing your question.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <MessageSquare size={24} />
        <h3>AI Assistant</h3>
      </div>
      
      <div className="ai-messages-container">
        {messages.length === 0 ? (
          <div className="ai-empty-chat">
            <p>Ask me questions about attendance patterns, student performance, or recommendations.</p>
            <div className="ai-suggestions">
              <button onClick={() => setInput("Who are the students with lowest attendance?")}>
                Who has the lowest attendance?
              </button>
              <button onClick={() => setInput("What factors correlate with higher attendance?")}>
                Attendance correlations?
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              {msg.content}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="ai-message ai-loading">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="ai-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about attendance data..."
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          className="ai-send-button"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default AiAssistant;
