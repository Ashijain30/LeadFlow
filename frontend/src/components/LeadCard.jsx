import React from 'react';
import PriorityBadge from './PriorityBadge';
import { getShortSummary, formatShortNextAction } from '../utils/leadHelpers';

/**
 * Minimal, high-scannability Lead Card matching the required structure:
 *
 * Rahul Sharma                         HOT
 * Bengaluru · ₹85L–₹95L
 * 2 BHK · Whitefield
 *
 * AI Summary
 * Ready to buy soon; wants verified options.
 *
 * Next
 * Call within 2h
 *
 * [Open] [Chat] [Follow-up]
 */
export default function LeadCard({
  lead,
  onViewDetails,
  onOpenChat,
  onOpenFollowUp,
}) {
  const {
    id,
    name,
    location,
    propertyRequirement,
    property_requirement,
    budget,
    priority,
    aiAnalysis,
    ai_analysis,
  } = lead;

  const req = propertyRequirement || property_requirement;
  const analysis = aiAnalysis || ai_analysis;
  const rawAction =
    analysis?.recommendedNextAction ||
    analysis?.recommended_next_action ||
    'Call within 2h';

  const shortSummary = getShortSummary(lead);
  const shortAction = formatShortNextAction(rawAction);

  return (
    <div className="lead-card">
      {/* 1. Name & Priority Badge */}
      <div className="lead-card-header">
        <h3 className="lead-name" onClick={() => onViewDetails(id)}>
          {name}
        </h3>
        <PriorityBadge priority={priority} size="sm" />
      </div>

      {/* 2. Location · Budget */}
      <div className="lead-meta-line">
        <span>{location}</span>
        <span className="dot-sep">·</span>
        <span className="lead-budget-val">{budget}</span>
      </div>

      {/* 3. Property Requirement */}
      <div className="lead-requirement-line">
        {req}
      </div>

      {/* 4. AI Summary */}
      <div className="lead-summary-section">
        <span className="card-section-label">AI Summary</span>
        <p className="card-summary-text">{shortSummary}</p>
      </div>

      {/* 5. Next Action */}
      <div className="lead-next-section">
        <span className="card-section-label">Next</span>
        <p className="card-next-text">{shortAction}</p>
      </div>

      {/* 6. Three Compact Actions: [Open] [Chat] [Follow-up] */}
      <div className="lead-card-actions">
        <button
          type="button"
          className="btn btn-secondary btn-xs flex-1"
          onClick={() => onViewDetails(id)}
        >
          Open
        </button>

        {onOpenChat && (
          <button
            type="button"
            className="btn btn-outline btn-xs flex-1"
            onClick={() => onOpenChat(id)}
          >
            Chat
          </button>
        )}

        {onOpenFollowUp && (
          <button
            type="button"
            className="btn btn-outline btn-xs flex-1"
            onClick={() => onOpenFollowUp(id)}
          >
            Follow-up
          </button>
        )}
      </div>
    </div>
  );
}
