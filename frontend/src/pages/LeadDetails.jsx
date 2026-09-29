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
  RefreshCw,
  Trash2,
  Info,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

export default function LeadDetails({
  lead,
  onBack,
  onOpenChat,
  onOpenFollowUp,
  onDeleteLead,
  onReanalyzeLead,
}) {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    id,
    name,
    location,
    propertyRequirement,
    property_requirement,
    budget,
    buyingTimeline,
    buying_timeline,
    customerMessage,
    customer_message,
    priority,
    priorityReason,
    priority_reason,
    aiAnalysis,
    ai_analysis,
  } = lead;

  const req = propertyRequirement || property_requirement;
  const timeline = buyingTimeline || buying_timeline;
  const msg = customerMessage || customer_message;
  const reason = priorityReason || priority_reason;
  const analysis = aiAnalysis || ai_analysis;

  const keyReqs = analysis?.key_requirements || analysis?.keyRequirements || [];
  const objections = analysis?.objections || [];
  const nextAction = analysis?.recommended_next_action || analysis?.recommendedNextAction;
  const suggestedResp = analysis?.suggested_response || analysis?.suggestedResponse;

  const handleCopySuggestedResponse = () => {
    if (suggestedResp) {
      navigator.clipboard.writeText(suggestedResp);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleReanalyzeClick = async () => {
    if (!onReanalyzeLead || isReanalyzing) return;
    setIsReanalyzing(true);
    try {
      await onReanalyzeLead(id);
    } catch (err) {
      console.error('Re-analysis failed:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeleteLead) {
      onDeleteLead(id);
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
            {onReanalyzeLead && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReanalyzeClick}
                disabled={isReanalyzing}
                title="Trigger fresh Gemini analysis"
              >
                <RefreshCw size={15} className={isReanalyzing ? 'spin-icon text-ai' : 'text-ai'} />
                <span>{isReanalyzing ? 'Analyzing with AI...' : 'Re-Analyze'}</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onOpenChat(id)}
            >
              <Bot size={16} className="text-ai" />
              <span>Open AI Chat</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenFollowUp(id)}
            >
              <SendHorizontal size={16} />
              <span>Generate Follow-up</span>
            </button>
            {onDeleteLead && (
              <button
                type="button"
                className="btn btn-secondary btn-danger-hover"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this lead permanently"
              >
                <Trash2 size={16} className="text-danger" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal / Banner */}
        {showDeleteConfirm && (
          <div className="delete-confirm-banner">
            <div className="delete-confirm-text">
              <strong>Delete {name}?</strong> This will permanently remove this lead and its analysis from the database.
            </div>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        )}

        <div className="details-title-row">
          <div className="details-customer-identity">
            <h1 className="details-lead-name">{name}</h1>
            <span className="details-lead-location">
              <MapPin size={16} className="text-muted" />
              {location}
            </span>
          </div>
          <div className="details-priority-area">
            <PriorityBadge priority={priority} size="lg" />
          </div>
        </div>

        {reason && (
          <div className="priority-reason-banner">
            <Info size={14} className="reason-banner-icon" />
            <span><strong>Priority Rationale:</strong> {reason}</span>
          </div>
        )}

        {/* Lead Quick Facts Grid */}
        <div className="lead-facts-grid">
          <div className="fact-item">
            <div className="fact-label">
              <Home size={14} className="fact-icon text-primary" />
              Property Requirement
            </div>
            <div className="fact-value">{req}</div>
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
            <div className="fact-value">{timeline}</div>
          </div>
        </div>

        {/* Customer Inbound Message Box */}
        <div className="inbound-message-box">
          <div className="inbound-message-header">
            <MessageSquare size={16} className="text-muted" />
            <span>Customer Inbound Message</span>
          </div>
          <blockquote className="inbound-quote">"{msg}"</blockquote>
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
            <p className="ai-card-text">{analysis?.summary || 'Analysis pending.'}</p>
          </div>

          {/* 2. Customer Intent */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">2</span>
              <h3 className="ai-card-title">Customer Intent</h3>
            </div>
            <div className="intent-box">
              <Compass size={16} className="intent-icon" />
              <p className="intent-text">{analysis?.intent || 'Not specified'}</p>
            </div>
          </div>

          {/* 3. Key Requirements */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">3</span>
              <h3 className="ai-card-title">Key Requirements</h3>
            </div>
            <ul className="requirements-list">
              {keyReqs.length > 0 ? (
                keyReqs.map((item, idx) => (
                  <li key={idx} className="requirement-item">
                    <CheckCircle2 size={16} className="req-icon text-success" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>No requirements identified.</li>
              )}
            </ul>
          </div>

          {/* 4. Objections & Concerns */}
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="ai-badge-num">4</span>
              <h3 className="ai-card-title">Objections & Concerns</h3>
            </div>
            <ul className="objections-list">
              {objections.length > 0 ? (
                objections.map((obj, idx) => (
                  <li key={idx} className="objection-item">
                    <AlertTriangle size={16} className="obj-icon text-warning" />
                    <span>{obj}</span>
                  </li>
                ))
              ) : (
                <li>No objections identified.</li>
              )}
            </ul>
          </div>

          {/* 5. Recommended Next Action */}
          <div className="ai-card ai-card-action">
            <div className="ai-card-header">
              <span className="ai-badge-num">5</span>
              <h3 className="ai-card-title">Recommended Next Action</h3>
            </div>
            <div className="recommended-action-box">
              <p className="action-text">{nextAction || 'Contact customer to review details.'}</p>
            </div>
          </div>

          {/* 6. Suggested Response */}
          <div className="ai-card ai-card-response">
            <div className="ai-card-header">
              <span className="ai-badge-num">6</span>
              <h3 className="ai-card-title">Suggested First Response</h3>
              {suggestedResp && (
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
              )}
            </div>
            <blockquote className="suggested-response-quote">
              "{suggestedResp || 'No response drafted yet.'}"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
