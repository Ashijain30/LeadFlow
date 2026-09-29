import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Sparkles, CornerDownLeft } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

export default function LeadChat({ lead, onBack }) {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am your AI sales assistant for ${lead?.name || 'this customer'}. I have reviewed their inquiry for ${lead?.propertyRequirement} in ${lead?.location} with budget ${lead?.budget} and timeline "${lead?.buyingTimeline}". How can I help you prepare for this customer?`,
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

  const generateMockReply = (userQuestion) => {
    const q = userQuestion.toLowerCase();

    if (q.includes('emphasize') || q.includes('call')) {
      return `On the call with ${lead.name}, emphasize:
1. Exact match for ${lead.propertyRequirement} within their ${lead.budget} bracket.
2. Immediate availability aligned with their "${lead.buyingTimeline}" timeline.
3. Overcoming their key concern regarding: "${lead.aiAnalysis?.objections?.[0] || 'delivery timelines'}".
4. Propose an exact site visit timing rather than an open-ended question.`;
    }

    if (q.includes('concern') || q.includes('objection')) {
      return `Based on ${lead.name}'s profile, the primary concerns to proactively address are:
• ${lead.aiAnalysis?.objections?.join('\n• ') || 'Price clarity and paperwork verification'}

Tip: Don't wait for them to bring these up. Reassure them early in the conversation.`;
    }

    if (q.includes('assertive')) {
      return `Here is an assertive version of your response to ${lead.name}:
"Hi ${lead.name}, we have only 2 verified units matching your criteria in ${lead.location} within ${lead.budget}. Due to high weekend inquiry volume, slots for site visits are closing quickly. I can hold an inspection slot for you this Saturday at 11 AM—please confirm so I can reserve it."`;
    }

    if (q.includes('next') || q.includes('action')) {
      return `Recommended immediate action for ${lead.name}:
${lead.aiAnalysis?.recommendedNextAction || 'Call the customer and share floor plans over WhatsApp.'}`;
    }

    return `For ${lead.name} (${lead.propertyRequirement} in ${lead.location}): Keep the discussion focused on their budget (${lead.budget}) and their timeline (${lead.buyingTimeline}). Offer 2 shortlisted units and secure a firm site inspection appointment.`;
  };

  const handleSendMessage = (textToSend) => {
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

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: generateMockReply(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 450);
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
            {lead.propertyRequirement} • {lead.location} • Budget: {lead.budget} • Timeline: {lead.buyingTimeline}
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
          Enter sends your question. AI uses this specific lead's stored requirements and context.
        </span>
      </div>
    </div>
  );
}
