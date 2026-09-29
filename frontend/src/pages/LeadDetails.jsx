import React, { useState } from 'react';
import {
  ArrowLeft,
  Bot,
  SendHorizontal,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  CalendarClock,
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
          <p>Lead not found.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
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
  const analysis = aiAnalysis || ai_analysis;
  const lastContacted = lastContactedAt || last_contacted_at;
  const nextFollowUp = nextFollowUpAt || next_follow_up_at;

  const rawKeyReqs = analysis?.key_requirements || analysis?.keyRequirements || [];
  const objections = analysis?.objections || [];
  const nextAction = analysis?.recommended_next_action || analysis?.recommendedNextAction;
  const suggestedResp = analysis?.suggested_response || analysis?.suggestedResponse;

  // Build bulleted requirements if AI list is sparse
  const requirementsList = rawKeyReqs.length > 0 ? rawKeyReqs : [req, location, budget, timeline].filter(Boolean);

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
      setScheduleSuccess('Contact recorded');
      setTimeout(() => setScheduleSuccess(''), 2000);
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
      setScheduleSuccess(targetIso ? 'Follow-up scheduled' : 'Follow-up cleared');
      setTimeout(() => setScheduleSuccess(''), 2000);
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="lead-details-page">
      {/* Top Navigation & Actions Bar */}
      <div className="details-nav-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>

        <div className="details-action-buttons">
          {onReanalyzeLead && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReanalyzeClick}
              disabled={isReanalyzing}
              title="Re-analyze with AI"
            >
              <RefreshCw size={13} className={isReanalyzing ? 'spin-icon text-ai' : 'text-ai'} />
              <span>{isReanalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenChat(id)}
          >
            <Bot size={14} className="text-ai" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpenFollowUp(id)}
          >
            <SendHorizontal size={14} />
            <span>Follow-up</span>
          </button>
          {onDeleteLead && (
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-danger-hover"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete lead"
            >
              <Trash2 size={14} className="text-danger" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirm-banner">
          <span>Delete <strong>{name}</strong> permanently?</span>
          <div className="delete-confirm-actions">
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-xs"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Lead Profile Header */}
      <div className="details-card lead-profile-card">
        <div className="details-title-row">
          <div className="details-customer-identity">
            <h1 className="details-lead-name">{name}</h1>
            <span className="details-meta-line">
              {location} · {budget} · {req}
            </span>
          </div>
          <PriorityBadge priority={priority} size="md" />
        </div>

        {/* Inbound Message */}
        {msg && (
          <div className="details-inbound-quote">
            "{msg}"
          </div>
        )}

        {/* Compact Follow-up & Contact Status */}
        <div className="lead-tracking-bar">
          <div className="tracking-item">
            <span className="tracking-title">Next Follow-up</span>
            <span className="tracking-val">
              {nextFollowUp ? (
                new Date(nextFollowUp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              ) : (
                'None scheduled'
              )}
            </span>
          </div>

          <div className="tracking-item">
            <span className="tracking-title">Last Contacted</span>
            <span className="tracking-val">
              {lastContacted ? (
                new Date(lastContacted).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              ) : (
                'Not yet'
              )}
            </span>
          </div>

          <div className="tracking-actions">
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={handleMarkContactedToday}
              disabled={isScheduling}
            >
              Mark Contacted
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setShowScheduleModal(true)}
              disabled={isScheduling}
            >
              <CalendarClock size={12} />
              <span>{nextFollowUp ? 'Reschedule' : 'Schedule'}</span>
            </button>
          </div>
        </div>

        {scheduleSuccess && (
          <div className="schedule-toast">
            <Check size={12} className="text-success" />
            <span>{scheduleSuccess}</span>
          </div>
        )}
      </div>

      {/* Structured Sections (Lead, AI Summary, Requirements, Concerns, Next Action, Suggested Reply) */}
      <div className="details-sections-grid">
        {/* AI Summary */}
        <div className="details-card">
          <h3 className="section-label">AI Summary</h3>
          <p className="section-body">
            {analysis?.summary || 'Analysis pending.'}
          </p>
        </div>

        {/* Requirements (Short Bullets) */}
        <div className="details-card">
          <h3 className="section-label">Requirements</h3>
          <ul className="bullet-list">
            {requirementsList.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        {/* Concerns (Short Bullets) */}
        <div className="details-card">
          <h3 className="section-label">Concerns</h3>
          <ul className="bullet-list">
            {objections.length > 0 ? (
              objections.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))
            ) : (
              <li className="text-muted">No major objections identified.</li>
            )}
          </ul>
        </div>

        {/* Next Action */}
        <div className="details-card highlight-card">
          <h3 className="section-label">Next Action</h3>
          <p className="action-highlight-text">
            {nextAction || 'Contact customer to review details.'}
          </p>
        </div>

        {/* Suggested Reply */}
        <div className="details-card reply-card">
          <div className="card-header-flex">
            <h3 className="section-label">Suggested Reply</h3>
            {suggestedResp && (
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={handleCopySuggestedResponse}
              >
                {copiedResponse ? (
                  <>
                    <Check size={12} className="text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="suggested-quote-box">
            "{suggestedResp || 'No response drafted yet.'}"
          </div>
        </div>
      </div>

      {/* Quick Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="schedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Follow-up</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowScheduleModal(false)}
              >
                <X size={15} />
              </button>
            </div>

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
                Custom time:
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
                  className="btn btn-primary btn-xs"
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
                  className="btn btn-secondary btn-xs text-danger"
                  onClick={() => handleApplySchedule('clear')}
                  disabled={isScheduling}
                >
                  Clear Follow-up
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
