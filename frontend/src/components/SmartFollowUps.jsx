import React, { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { getFollowUpStatus, formatShortNextAction } from '../utils/leadHelpers';

/**
 * Smart Follow-ups Queue (Own Feature)
 * Minimal, high-scannability list of leads needing salesperson attention.
 */
export default function SmartFollowUps({ leads, onViewDetails, onMarkDone }) {
  const [completedIds, setCompletedIds] = useState(new Set());

  if (!leads || leads.length === 0) return null;

  // Pick top 3 actionable leads (HOT first, then WARM)
  const candidateLeads = [...leads]
    .filter((l) => !completedIds.has(l.id))
    .sort((a, b) => {
      const rank = { HOT: 3, WARM: 2, COLD: 1 };
      return (rank[b.priority] || 2) - (rank[a.priority] || 2);
    })
    .slice(0, 3);

  if (candidateLeads.length === 0) {
    return (
      <section className="smart-followups-card">
        <div className="smart-followups-header">
          <span className="smart-followups-title">SMART FOLLOW-UPS</span>
        </div>
        <div className="smart-followups-empty">
          <Check size={14} className="text-success" />
          <span>All urgent follow-ups completed for today!</span>
        </div>
      </section>
    );
  }

  const handleDoneClick = (leadId, e) => {
    e.stopPropagation();
    setCompletedIds((prev) => new Set([...prev, leadId]));
    if (onMarkDone) {
      onMarkDone(leadId);
    }
  };

  return (
    <section className="smart-followups-card" aria-label="Smart Follow-ups Queue">
      <div className="smart-followups-header">
        <div className="smart-followups-title-row">
          <Clock size={13} className="text-primary" />
          <span className="smart-followups-title">SMART FOLLOW-UPS</span>
        </div>
        <span className="smart-followups-badge">{candidateLeads.length} Due</span>
      </div>

      <div className="smart-followups-list">
        {candidateLeads.map((lead, index) => {
          const status = getFollowUpStatus(lead, index);
          const rawAction =
            lead.aiAnalysis?.recommendedNextAction ||
            lead.ai_analysis?.recommended_next_action ||
            'Call customer';
          const shortAction = status.action || formatShortNextAction(rawAction);
          const priority = (lead.priority || 'HOT').toUpperCase();

          return (
            <div key={lead.id} className="followup-item-row">
              {/* Lead Name */}
              <div className="followup-col-name">
                <span
                  className="followup-lead-name"
                  onClick={() => onViewDetails(lead.id)}
                >
                  {lead.name}
                </span>
              </div>

              {/* Priority & Location */}
              <div className="followup-col-meta">
                <span className={`followup-priority-tag priority-${priority.toLowerCase()}`}>
                  {priority}
                </span>
                <span className="dot-sep">·</span>
                <span className="followup-location">{lead.location}</span>
              </div>

              {/* Next Action & Schedule */}
              <div className="followup-col-action">
                <span className="followup-action-text">
                  {shortAction} · {status.timeText}
                </span>
                <span className={`followup-status-badge status-${status.type}`}>
                  {status.badge}
                </span>
              </div>

              {/* Actions: Open and Done */}
              <div className="followup-col-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => onViewDetails(lead.id)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-xs btn-done"
                  onClick={(e) => handleDoneClick(lead.id, e)}
                  title="Mark follow-up done"
                >
                  <Check size={12} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
