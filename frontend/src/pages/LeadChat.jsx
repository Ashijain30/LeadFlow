import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
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
      text: `Hello! I'm your AI Copilot for ${lead?.name || 'this lead'}. Ask me how to frame your call, handle objections, or craft your reply.`,
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
          Dashboard
        </button>
      </div>
    );
  }

  // User-specified quick prompt pills
  const suggestedPrompts = [
    'What should I say?',
    'Make it assertive',
    'Summarize lead',
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
      const response = await chatWithLead(lead.id, text.trim());
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.reply || response.text || response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('Real AI chat endpoint error, using contextual fallback:', err);
      // Contextual fallback response
      let fallbackText = `For ${lead.name} (${req}, ${loc}, ${budget}): `;
      if (text.toLowerCase().includes('assertive')) {
        fallbackText += `Emphasize that inventory in this price bracket moves quickly. Propose two specific time slots today for a site visit rather than asking open-ended questions.`;
      } else if (text.toLowerCase().includes('say') || text.toLowerCase().includes('emphasize')) {
        fallbackText += `Focus on their ${timeline} timeline and highlight that your options match their ${budget} range with verified amenities.`;
      } else if (text.toLowerCase().includes('summarize')) {
        fallbackText += `${lead.name} is seeking ${req} in ${loc} within ${budget} on a "${timeline}" timeline.`;
      } else if (text.toLowerCase().includes('objection')) {
        fallbackText += `Address price certainty upfront by sharing comparable registry rates in ${loc}.`;
      } else {
        fallbackText += `Recommend booking an in-person site visit this week to lock in current pricing.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="lead-chat-page">
      {/* Header */}
      <div className="chat-header-bar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <div className="chat-lead-info">
          <h2 className="chat-title">AI Copilot</h2>
          <span className="chat-lead-name">· {lead.name}</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="chat-prompt-pills">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="prompt-pill"
            onClick={() => handleSendMessage(prompt)}
            disabled={isTyping}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="chat-messages-container">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`chat-message-row ${isUser ? 'is-user' : 'is-assistant'}`}
            >
              <div className="message-avatar">
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-message-row is-assistant">
            <div className="message-avatar">
              <Bot size={14} />
            </div>
            <div className="message-bubble typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          className="chat-input"
          placeholder={`Ask AI about ${lead.name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm chat-send-btn"
          disabled={!inputText.trim() || isTyping}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
