import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Home,
  IndianRupee,
  Clock,
  MessageSquare,
  Sparkles,
  Bot,
  SendHorizontal,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Copy,
  Check,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

export default function LeadDetails({
  lead,
  onBack,
  onOpenChat,
  onOpenFollowUp,
}) {
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!lead) {
    return (
      <div className="lead-details-page">
        <div className="lead-not-found">
          <p>Lead not found or has been removed.</p>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    location,
    propertyRequirement,
    budget,
    buyingTimeline,
    customerMessage,
    priority,
    aiAnalysis,
  } = lead;

  const handleCopySuggestedResponse = () => {
    if (aiAnalysis?.suggestedResponse) {
      navigator.clipboard.writeText(aiAnalysis.suggestedResponse);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="lead-details-page">
      {/* Top Navigation & Lead Header */}
      <div className="details-header-card">
        <div className="details-nav-row">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <div className="details-action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onOpenChat(lead.id)}
            >
              <Bot size={16} className="text-ai" />
              <span>Open AI Chat</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenFollowUp(lead.id)}
            >
              <SendHorizontal size={16} />
              <span>Generate Follow-up</span>
            </button>
          </div>
        </div>

        <div className="details-title-row">
          <div className="details-customer-identity">
            <h1 className="details-lead-name">{name}</h1>
            <span className="details-lead-location">
              <MapPin size={16} className="text-muted" />
              {location}
            </span>
          </div>
          <PriorityBadge priority={priority} size="lg" />
        </div>

        {/* Lead Quick Facts Grid */}
        <div className="lead-facts-grid">
          <div className="fact-item">
            <div className="fact-label">
              <Home size={14} className="fact-icon text-primary" />
              Property Requirement
            </div>
            <div className="fact-value">{propertyRequirement}</div>
          </div>

          <div className="fact-item">
            <div className="fact-label">
              <IndianRupee size={14} className="fact-icon text-success" />
              Budget Range
            </div>
            <div className="fact-value">{budget}</div>
          </div>

          <div className="fact-item">
            <div className="fact-label">
              <Clock size={14} className="fact-icon text-warning" />
              Buying Timeline
            </div>
            <div className="fact-value">{buyingTimeline}</div>
          </div>
        </div>

        {/* Customer Inbound Message Box */}
        <div className="inbound-message-box">
          <div className="inbound-message-header">
            <MessageSquare size={16} className="text-muted" />
            <span>Customer Inbound Message</span>
          </div>
          <blockquote className="inbound-quote">"{customerMessage}"</blockquote>
        </div>
      </div>

      {/* AI Lead Analysis Section */}
      <div className="ai-analysis-container">
        <div className="ai-section-title-bar">
          <div className="ai-title-left">
            <div className="ai-sparkle-pill">
              <Sparkles size={16} className="text-ai" />
            </div>
            <div>
              <h2 className="ai-main-title">AI Lead Analysis & Strategic Intelligence</h2>
              <p className="ai-main-subtitle">
                Contextual insights extracted from customer message, timeline, and requirements
              </p>
            </div>
          </div>
        </div>

        <div className="ai-grid">
          {/* 1. Lead Summary */}
          <div className="ai-card ai-card-highlight">
            <div className="ai-card-header">
              <span className="ai-badge-num">1</span>
              <h3 className="ai-card-title">Executive Summary</h3>
            </div>
            <p className="ai-card-text">{aiAnalysis?.summary || 'Analysis pending.'}</p>
          </div>

          {/* 2. Customer Intent */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">2</span>
              <h3 className="ai-card-title">Customer Intent</h3>
            </div>
            <div className="intent-box">
              <Compass size={16} className="intent-icon" />
              <p className="intent-text">{aiAnalysis?.intent || 'Not specified'}</p>
            </div>
          </div>

          {/* 3. Key Requirements */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">3</span>
              <h3 className="ai-card-title">Key Requirements</h3>
            </div>
            <ul className="requirements-list">
              {aiAnalysis?.keyRequirements?.map((req, idx) => (
                <li key={idx} className="requirement-item">
                  <CheckCircle2 size={16} className="req-icon text-success" />
                  <span>{req}</span>
                </li>
              )) || <li>No requirements identified.</li>}
            </ul>
          </div>

          {/* 4. Objections & Concerns */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">4</span>
              <h3 className="ai-card-title">Objections & Concerns</h3>
            </div>
            <ul className="objections-list">
              {aiAnalysis?.objections?.map((obj, idx) => (
                <li key={idx} className="objection-item">
                  <AlertTriangle size={16} className="obj-icon text-warning" />
                  <span>{obj}</span>
                </li>
              )) || <li>No objections identified.</li>}
            </ul>
          </div>

          {/* 5. Recommended Next Action */}
          <div className="ai-card ai-card-action">
            <div className="ai-card-header">
              <span className="ai-badge-num">5</span>
              <h3 className="ai-card-title">Recommended Next Action</h3>
            </div>
            <div className="recommended-action-box">
              <p className="action-text">{aiAnalysis?.recommendedNextAction}</p>
            </div>
          </div>

          {/* 6. Suggested Response */}
          <div className="ai-card ai-card-response">
            <div className="ai-card-header">
              <span className="ai-badge-num">6</span>
              <h3 className="ai-card-title">Suggested First Response</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm copy-btn"
                onClick={handleCopySuggestedResponse}
              >
                {copiedResponse ? (
                  <>
                    <Check size={14} className="text-success" />
                    <span className="text-success">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Response</span>
                  </>
                )}
              </button>
            </div>
            <blockquote className="suggested-response-quote">
              "{aiAnalysis?.suggestedResponse}"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
