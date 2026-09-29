import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
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
      text: `Hello! I am your AI sales copilot for ${lead?.name || 'this customer'}. I have reviewed their inquiry for ${req} in ${loc} with budget ${budget} and timeline "${timeline}". How can I help you prepare or close this lead?`,
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
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          Back to Leads
        </button>
      </div>
    );
  }

  const quickPrompts = [
    'What should I say?',
    'Make it assertive',
    'Summarize',
    'Handle objection',
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
      {/* Chat Header */}
      <div className="chat-header-bar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Lead</span>
        </button>

        <div className="chat-header-title-group">
          <div className="chat-title-line">
            <span className="chat-brand-label">AI COPILOT</span>
            <span className="dot-sep">·</span>
            <span className="chat-lead-name">{lead.name}</span>
            <PriorityBadge priority={lead.priority} size="sm" />
          </div>
          <span className="chat-meta-subtitle">
            {req} · {loc} · {budget}
          </span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="chat-quick-prompts-bar">
        <span className="quick-prompts-label">Quick Prompts:</span>
        <div className="quick-prompts-list">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-prompt-pill"
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
              <div className="message-bubble-wrapper">
                <span className="message-sender-tag">
                  {isUser ? 'You' : 'LeadFlow Copilot'}
                </span>
                <div className="message-bubble">
                  <p className="message-content">{msg.text}</p>
                </div>
                <span className="message-timestamp">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-message-row is-assistant">
            <div className="message-bubble-wrapper">
              <span className="message-sender-tag">LeadFlow Copilot</span>
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

      {/* Message Input */}
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
            placeholder={`Ask a coaching question regarding ${lead.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm chat-send-btn"
            disabled={!inputText.trim() || isTyping}
          >
            <span>Send</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
