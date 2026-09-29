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
  CalendarClock,
  Calendar,
  X,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

export default function LeadDetails({
  lead,
  onBack,
  onOpenChat,
  onOpenFollowUp,
  onDeleteLead,
  onReanalyzeLead,
  onScheduleFollowUp,
}) {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

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
    lastContactedAt,
    last_contacted_at,
    nextFollowUpAt,
    next_follow_up_at,
  } = lead;

  const req = propertyRequirement || property_requirement;
  const timeline = buyingTimeline || buying_timeline;
  const msg = customerMessage || customer_message;
  const reason = priorityReason || priority_reason;
  const analysis = aiAnalysis || ai_analysis;
  const lastContacted = lastContactedAt || last_contacted_at;
  const nextFollowUp = nextFollowUpAt || next_follow_up_at;

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

  const handleMarkContactedToday = async () => {
    if (!onScheduleFollowUp) return;
    setIsScheduling(true);
    try {
      await onScheduleFollowUp(id, {
        lastContactedAt: new Date().toISOString(),
      });
      setScheduleSuccess('Contact recorded for today.');
      setTimeout(() => setScheduleSuccess(''), 2500);
    } catch (err) {
      console.error('Failed to update contact date:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleApplySchedule = async (preset) => {
    if (!onScheduleFollowUp) return;
    setIsScheduling(true);
    let targetIso = null;
    const now = new Date();

    if (preset === 'today-5pm') {
      const d = new Date();
      d.setHours(17, 0, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      targetIso = d.toISOString();
    } else if (preset === 'tomorrow-11am') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(11, 0, 0, 0);
      targetIso = d.toISOString();
    } else if (preset === 'in-2days') {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(11, 0, 0, 0);
      targetIso = d.toISOString();
    } else if (preset === 'clear') {
      targetIso = null;
    } else if (customDateTime) {
      targetIso = new Date(customDateTime).toISOString();
    }

    try {
      await onScheduleFollowUp(id, {
        nextFollowUpAt: targetIso,
      });
      setShowScheduleModal(false);
      setScheduleSuccess(targetIso ? 'Follow-up scheduled!' : 'Follow-up cleared.');
      setTimeout(() => setScheduleSuccess(''), 2500);
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    } finally {
      setIsScheduling(false);
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

        {/* Delete Confirmation Banner */}
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

        {/* Follow-up & Contact Tracking Bar */}
        <div className="lead-tracking-bar">
          <div className="tracking-item">
            <div className="tracking-meta">
              <CalendarClock size={15} className="tracking-icon text-ai" />
              <span className="tracking-title">Next Scheduled Follow-up</span>
            </div>
            <div className="tracking-value">
              {nextFollowUp ? (
                <span className="scheduled-tag">
                  {new Date(nextFollowUp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ) : (
                <span className="text-muted">None scheduled</span>
              )}
            </div>
          </div>

          <div className="tracking-item">
            <div className="tracking-meta">
              <Clock size={15} className="tracking-icon text-muted" />
              <span className="tracking-title">Last Contacted</span>
            </div>
            <div className="tracking-value">
              {lastContacted ? (
                <span className="contacted-tag">
                  {new Date(lastContacted).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ) : (
                <span className="text-muted">Not contacted yet</span>
              )}
            </div>
          </div>

          <div className="tracking-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkContactedToday}
              disabled={isScheduling}
              title="Record contact attempt today"
            >
              <Check size={14} />
              <span>Mark Contacted</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowScheduleModal(true)}
              disabled={isScheduling}
            >
              <CalendarClock size={14} />
              <span>{nextFollowUp ? 'Reschedule' : 'Schedule Follow-up'}</span>
            </button>
          </div>
        </div>

        {/* Schedule Success Alert */}
        {scheduleSuccess && (
          <div className="schedule-success-toast">
            <Check size={14} className="text-success" />
            <span>{scheduleSuccess}</span>
          </div>
        )}

        {/* Customer Inbound Message Box */}
        <div className="inbound-message-box">
          <div className="inbound-message-header">
            <MessageSquare size={16} className="text-muted" />
            <span>Customer Inbound Message</span>
          </div>
          <blockquote className="inbound-quote">"{msg}"</blockquote>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="schedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <CalendarClock size={18} className="text-ai" />
                <h3 className="modal-title">Schedule Follow-up for {name}</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowScheduleModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p className="modal-description">
              Choose a quick preset or pick a specific date and time to keep this lead on track.
            </p>

            <div className="preset-buttons-grid">
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleApplySchedule('today-5pm')}
                disabled={isScheduling}
              >
                <span>Today</span>
                <strong>5:00 PM</strong>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleApplySchedule('tomorrow-11am')}
                disabled={isScheduling}
              >
                <span>Tomorrow</span>
                <strong>11:00 AM</strong>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handleApplySchedule('in-2days')}
                disabled={isScheduling}
              >
                <span>In 2 Days</span>
                <strong>11:00 AM</strong>
              </button>
            </div>

            <div className="custom-schedule-box">
              <label htmlFor="custom-datetime" className="custom-schedule-label">
                Or select custom date & time:
              </label>
              <div className="custom-datetime-row">
                <input
                  id="custom-datetime"
                  type="datetime-local"
                  className="datetime-input"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleApplySchedule('custom')}
                  disabled={!customDateTime || isScheduling}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="modal-footer-actions">
              {nextFollowUp && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-danger"
                  onClick={() => handleApplySchedule('clear')}
                  disabled={isScheduling}
                >
                  Clear Follow-up
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
