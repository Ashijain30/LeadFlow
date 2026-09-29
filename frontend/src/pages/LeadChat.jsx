import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import { chatWithLead } from '../services/api';

export default function LeadChat({ lead, onBack }) {
  const req = lead?.propertyRequirement || lead?.property_requirement || '';
  const loc = lead?.location || '';
  const budget = lead?.budget || '';
  const timeline = lead?.buyingTimeline || lead?.buying_timeline || '';

  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am your AI sales assistant for ${lead?.name || 'this customer'}. I have reviewed their inquiry for ${req} in ${loc} with budget ${budget} and timeline "${timeline}". How can I help you prepare or close this lead?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!lead) {
    return (
      <div className="lead-chat-page">
        <p>Lead not found.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const suggestedPrompts = [
    'What should I emphasize on the call?',
    "What are this customer's main concerns?",
    'Make my reply more assertive.',
    'What should I do next?',
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call real backend API
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));
      const res = await chatWithLead(lead.id, text.trim(), historyPayload);
      const replyText = res.response || res.text;

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('Real AI chat endpoint error, using contextual fallback:', err);
      // Fallback lead-grounded response
      const fallbackReply = `For ${lead.name} (${req} in ${loc}, budget ${budget}):
Focus on locking in an inspection slot this weekend. Overcome their concerns around pricing clarity and confirmed RERA delivery timelines before negotiating discounts.`;

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="lead-chat-page">
      {/* Top Banner with Lead Context */}
      <div className="chat-header-bar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Lead</span>
        </button>

        <div className="chat-lead-info">
          <div className="chat-lead-title-row">
            <span className="chat-lead-title">AI Sales Assistant for {lead.name}</span>
            <PriorityBadge priority={lead.priority} size="sm" />
          </div>
          <span className="chat-lead-meta">
            {req} • {loc} • Budget: {budget} • Timeline: {timeline}
          </span>
        </div>
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="chat-suggestions-bar">
        <div className="suggestions-label">
          <Sparkles size={14} className="text-ai" />
          <span>Quick Prompts:</span>
        </div>
        <div className="suggestions-scroll">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-chip"
              onClick={() => handleSendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="chat-messages-container">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`chat-message-row ${isUser ? 'is-user' : 'is-assistant'}`}
            >
              <div className="message-avatar">
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-bubble-wrapper">
                <div className="message-sender-name">
                  {isUser ? 'You (Sales Rep)' : `AI Assistant (${lead.name})`}
                </div>
                <div className="message-bubble">
                  <p className="message-content">{msg.text}</p>
                </div>
                <div className="message-timestamp">{msg.timestamp}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-message-row is-assistant">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble-wrapper">
              <div className="message-bubble typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="chat-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chat-form"
        >
          <input
            type="text"
            className="chat-input"
            placeholder={`Ask a question or coaching prompt regarding ${lead.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={!inputText.trim() || isTyping}
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
        <span className="chat-footer-hint">
          Enter sends your question. AI uses this specific lead's stored requirements, budget, and context.
        </span>
      </div>
    </div>
  );
}
