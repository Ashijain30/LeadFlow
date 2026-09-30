import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Bot,
  SendHorizontal,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import { getShortLeadSummary } from '../utils/leadHelpers';

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
  const [reanalyzeError, setReanalyzeError] = useState('');
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
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
            Back to Leads
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
    createdAt,
    created_at,
  } = lead;

  const req = propertyRequirement || property_requirement;
  const timeline = buyingTimeline || buying_timeline;
  const msg = customerMessage || customer_message;
  const analysis = aiAnalysis || ai_analysis || {};
  const lastContacted = lastContactedAt || last_contacted_at;
  const nextFollowUp = nextFollowUpAt || next_follow_up_at;
  const createdDate = createdAt || created_at;

  // AI Structured Fields
  const rawSummary = analysis.summary || '';
  const intent = analysis.intent || analysis.customer_intent || 'High purchase intent';
  const keyReqs = analysis.key_requirements || analysis.keyRequirements || [req, location, budget, timeline].filter(Boolean);
  const objections = analysis.objections || analysis.concerns || ['Requires verified project approvals and clear pricing'];
  const nextAction = analysis.recommended_next_action || analysis.recommendedNextAction || 'Call within 2 hours to confirm inspection';
  const suggestedResp = analysis.suggested_response || analysis.suggestedResponse || `Hi ${name}, thank you for reaching out! We have shortlisted verified properties matching your requirements in ${location}.`;

  // Focus 1-2 sentence AI summary
  const executiveSummary =
    rawSummary && rawSummary.length > 20 && !rawSummary.toLowerCase().includes('pts')
      ? rawSummary
      : `${name} is looking for a ${req} in ${location} within ${budget}. Ready to evaluate verified project options and should be contacted soon.`;

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
    setReanalyzeError('');
    try {
      await onReanalyzeLead(id);
    } catch (err) {
      console.error('Re-analysis failed:', err);
      const msg =
        err.response?.data?.detail || 'Gemini is temporarily unavailable. Please try again shortly.';
      setReanalyzeError(msg);
      setTimeout(() => setReanalyzeError(''), 5000);
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
      setScheduleSuccess(targetIso ? 'Follow-up scheduled.' : 'Follow-up cleared.');
      setTimeout(() => setScheduleSuccess(''), 2500);
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="lead-details-page">
      {/* Top Navigation */}
      <div className="details-nav-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </button>

        <div className="details-header-actions">
          {onReanalyzeLead && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReanalyzeClick}
              disabled={isReanalyzing}
              title="Refresh AI analysis"
            >
              <RefreshCw size={13} className={isReanalyzing ? 'spin-icon' : ''} />
              <span>{isReanalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenChat(id)}
          >
            <Bot size={14} />
            <span>AI Chat</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpenFollowUp(id)}
          >
            <SendHorizontal size={14} />
            <span>Generate Follow-up</span>
          </button>

          {onDeleteLead && (
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete lead"
              aria-label="Delete lead"
            >
              <Trash2 size={14} className="text-danger" />
            </button>
          )}
        </div>
      </div>

      {reanalyzeError && (
        <div className="api-notice-banner" style={{ marginTop: '12px' }}>
          <span>⚠️ {reanalyzeError}</span>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteConfirm && (
        <div className="delete-alert-card">
          <p>Delete <strong>{name}</strong>? This action cannot be undone.</p>
          <div className="delete-alert-actions">
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

      {/* Lead Title Header */}
      <div className="lead-details-title-card">
        <div className="lead-identity-row">
          <h1 className="details-lead-name">{name}</h1>
          <PriorityBadge priority={priority} size="md" />
        </div>
        <div className="lead-identity-subline">
          <span>{location}</span>
          <span className="dot-sep">·</span>
          <span>{budget}</span>
          {req && (
            <>
              <span className="dot-sep">·</span>
              <span>{req}</span>
            </>
          )}
        </div>
      </div>

      {/* Two-Column Desktop Layout */}
      <div className="details-columns-grid">
        {/* ================= LEFT COLUMN: AI Strategy & Insights ================= */}
        <div className="details-left-col">
          {/* 1. AI Summary */}
          <div className="detail-card">
            <span className="detail-card-label">AI SUMMARY</span>
            <p className="ai-summary-highlight">{executiveSummary}</p>
          </div>

          {/* 2. Customer Intent */}
          <div className="detail-card">
            <span className="detail-card-label">CUSTOMER INTENT</span>
            <p className="detail-card-body">{intent}</p>
          </div>

          {/* 3. Key Requirements */}
          <div className="detail-card">
            <span className="detail-card-label">KEY REQUIREMENTS</span>
            <ul className="clean-bullets-list">
              {Array.isArray(keyReqs) && keyReqs.length > 0 ? (
                keyReqs.map((item, idx) => <li key={idx}>{item}</li>)
              ) : (
                <li>{req} in {location}</li>
              )}
            </ul>
          </div>

          {/* 4. Concerns & Objections */}
          <div className="detail-card">
            <span className="detail-card-label">CONCERNS</span>
            <ul className="clean-bullets-list">
              {Array.isArray(objections) && objections.length > 0 ? (
                objections.map((item, idx) => <li key={idx}>{item}</li>)
              ) : (
                <li>No critical concerns noted.</li>
              )}
            </ul>
          </div>

          {/* 5. Recommended Next Action */}
          <div className="detail-card">
            <span className="detail-card-label">NEXT ACTION</span>
            <p className="detail-card-body font-medium">{nextAction}</p>
          </div>

          {/* 6. Suggested First Response */}
          <div className="detail-card">
            <div className="detail-card-header-row">
              <span className="detail-card-label">SUGGESTED RESPONSE</span>
              {suggestedResp && (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs copy-response-btn"
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
            <blockquote className="suggested-response-box">
              "{suggestedResp}"
            </blockquote>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Lead Info, Follow-up & Message ================= */}
        <div className="details-right-col">
          {/* Lead Information Card */}
          <div className="detail-card">
            <span className="detail-card-label">LEAD INFO</span>
            <div className="info-pairs-list">
              <div className="info-pair">
                <span className="info-key">Location</span>
                <span className="info-value">{location}</span>
              </div>
              <div className="info-pair">
                <span className="info-key">Budget</span>
                <span className="info-value">{budget}</span>
              </div>
              <div className="info-pair">
                <span className="info-key">Property</span>
                <span className="info-value">{req}</span>
              </div>
              <div className="info-pair">
                <span className="info-key">Timeline</span>
                <span className="info-value">{timeline}</span>
              </div>
              {createdDate && (
                <div className="info-pair">
                  <span className="info-key">Added</span>
                  <span className="info-value">
                    {new Date(createdDate).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Tracking Card */}
          <div className="detail-card">
            <span className="detail-card-label">FOLLOW-UP</span>
            <div className="followup-status-block">
              <div className="followup-status-line">
                <span className="info-key">Next follow-up</span>
                <span className="info-value">
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

              <div className="followup-status-line">
                <span className="info-key">Last contacted</span>
                <span className="info-value">
                  {lastContacted ? (
                    new Date(lastContacted).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })
                  ) : (
                    'Not contacted yet'
                  )}
                </span>
              </div>

              {scheduleSuccess && (
                <div className="schedule-success-text">
                  <Check size={13} className="text-success" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              <div className="followup-action-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-xs flex-1"
                  onClick={handleMarkContactedToday}
                  disabled={isScheduling}
                >
                  <Check size={13} />
                  <span>Mark Contacted</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-xs flex-1"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={isScheduling}
                >
                  <Calendar size={13} />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Inbound Message Card */}
          <div className="detail-card">
            <span className="detail-card-label">CUSTOMER MESSAGE</span>
            <blockquote className="customer-inbound-quote">
              "{msg || 'No original message provided.'}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
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
                <X size={16} />
              </button>
            </div>

            <p className="modal-description">
              Select a quick preset or choose a specific date and time for {name}.
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
                Or custom date & time:
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
                  Clear
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
    </div>
  );
}
