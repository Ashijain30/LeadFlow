import React from 'react';
import PriorityBadge from './PriorityBadge';
import { getShortLeadSummary, formatShortNextAction } from '../utils/leadHelpers';

/**
 * Concise Lead Card strictly adhering to the 7-item hierarchy:
 *
 * Rahul Sharma                         HOT
 * Bengaluru · ₹85L–₹95L
 * 2 BHK · Whitefield
 *
 * AI SUMMARY
 * Ready to buy soon; wants verified options.
 *
 * NEXT
 * Call within 2h
 *
 * [View] [Chat] [Follow-up]
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

  const shortSummary = getShortLeadSummary(lead);
  const shortAction = formatShortNextAction(rawAction);

  return (
    <div className="lead-card">
      {/* 1. Name & Priority */}
      <div className="lead-card-header">
        <h3
          className="lead-name"
          onClick={() => onViewDetails(id)}
          role="button"
          tabIndex={0}
        >
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
      <div className="lead-card-section">
        <span className="card-section-label">AI SUMMARY</span>
        <p className="card-summary-text">{shortSummary}</p>
      </div>

      {/* 5. Next Action */}
      <div className="lead-card-section">
        <span className="card-section-label">NEXT</span>
        <p className="card-next-text">{shortAction}</p>
      </div>

      {/* 6. Three Actions: [View] [Chat] [Follow-up] */}
      <div className="lead-card-actions">
        <button
          type="button"
          className="btn btn-secondary btn-xs flex-1"
          onClick={() => onViewDetails(id)}
        >
          View
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
