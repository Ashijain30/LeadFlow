import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { getFollowUpStatus, formatShortNextAction } from '../utils/leadHelpers';
import PriorityBadge from './PriorityBadge';

/**
 * Follow-up Reminders (Required Own Feature)
 * Minimal, high-scannability queue answering:
 * "Who do I contact? How? When?"
 */
export default function FollowUpReminders({ leads, onViewDetails, onMarkDone }) {
  const [completedIds, setCompletedIds] = useState(new Set());

  if (!leads || leads.length === 0) return null;

  // Filter out leads marked done in current session, prioritize HOT then WARM
  const candidateLeads = [...leads]
    .filter((l) => !completedIds.has(l.id))
    .sort((a, b) => {
      const rank = { HOT: 3, WARM: 2, COLD: 1 };
      return (rank[b.priority] || 2) - (rank[a.priority] || 2);
    })
    .slice(0, 4);

  const handleDoneClick = (leadId, e) => {
    e.stopPropagation();
    setCompletedIds((prev) => new Set([...prev, leadId]));
    if (onMarkDone) {
      onMarkDone(leadId);
    }
  };

  return (
    <section className="reminders-section" aria-label="Follow-up Reminders">
      <div className="section-header-compact">
        <h2 className="section-title">FOLLOW-UP REMINDERS</h2>
        <p className="section-subtitle">Who needs attention next?</p>
      </div>

      <div className="reminders-card">
        {candidateLeads.length === 0 ? (
          <div className="reminders-empty">
            <Check size={16} className="text-success" />
            <span>All follow-ups completed for today!</span>
          </div>
        ) : (
          <div className="reminders-list">
            {candidateLeads.map((lead, index) => {
              const status = getFollowUpStatus(lead, index);
              const rawAction =
                lead.aiAnalysis?.recommendedNextAction ||
                lead.ai_analysis?.recommended_next_action ||
                'Call customer';
              const shortAction = status.action || formatShortNextAction(rawAction);
              const priority = (lead.priority || 'HOT').toUpperCase();

              return (
                <div key={lead.id} className="reminder-row">
                  <div className="reminder-info">
                    <div className="reminder-primary-line">
                      <span
                        className="reminder-name"
                        onClick={() => onViewDetails(lead.id)}
                        role="button"
                        tabIndex={0}
                      >
                        {lead.name}
                      </span>
                      <PriorityBadge priority={priority} size="sm" />
                      <span className="dot-sep">·</span>
                      <span className="reminder-location">{lead.location}</span>
                    </div>

                    <div className="reminder-secondary-line">
                      <span className="reminder-action">
                        {shortAction} · {status.timeText}
                      </span>
                      {status.badge && (
                        <span className={`status-tag status-${status.type}`}>
                          {status.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="reminder-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => onViewDetails(lead.id)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs btn-check"
                      onClick={(e) => handleDoneClick(lead.id, e)}
                      title="Mark contacted / done"
                      aria-label="Mark done"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
