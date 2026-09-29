import React from 'react';
import PriorityBadge from './PriorityBadge';
import { formatShortNextAction } from './PriorityQueue';

/**
 * Compact, scannable lead card following strict hierarchy:
 * 1. Name & Priority Badge
 * 2. Location · Budget
 * 3. Property Requirement
 * 4. Short Next Action
 * 5. Actions: [View] [Chat] [Follow-up]
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
    'Follow up on inquiry';
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

      {/* 2. Location & Budget */}
      <div className="lead-loc-budget">
        <span>{location}</span>
        <span className="dot-sep">·</span>
        <span className="lead-budget-val">{budget}</span>
      </div>

      {/* 3. Property Requirement */}
      <div className="lead-requirement-line">
        {req}
      </div>

      {/* 4. Short Next Action */}
      <div className="lead-next-row">
        <span className="lead-next-label">Next:</span>
        <span className="lead-next-text">{shortAction}</span>
      </div>

      {/* 5. Actions: [View] [Chat] [Follow-up] */}
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
            className="btn btn-outline btn-xs"
            onClick={() => onOpenChat(id)}
          >
            Chat
          </button>
        )}

        {onOpenFollowUp && (
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => onOpenFollowUp(id)}
          >
            Follow-up
          </button>
        )}
      </div>
    </div>
  );
}
