import React from 'react';
import {
  MapPin,
  Home,
  IndianRupee,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Bot,
  SendHorizontal,
  CalendarClock,
  Info,
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';

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
    buyingTimeline,
    buying_timeline,
    customerMessage,
    customer_message,
    priority,
    priorityReason,
    priority_reason,
    aiAnalysis,
    ai_analysis,
    nextFollowUpAt,
    next_follow_up_at,
  } = lead;

  const req = propertyRequirement || property_requirement;
  const timeline = buyingTimeline || buying_timeline;
  const message = customerMessage || customer_message;
  const reason = priorityReason || priority_reason;
  const analysis = aiAnalysis || ai_analysis;
  const nextAction =
    analysis?.recommendedNextAction ||
    analysis?.recommended_next_action;
  const scheduledFollowUp = nextFollowUpAt || next_follow_up_at;

  return (
    <div className="lead-card">
      {/* Card Header: Identity & Priority */}
      <div className="lead-card-header">
        <div className="lead-identity">
          <h3 className="lead-name" onClick={() => onViewDetails(id)}>
            {name}
          </h3>
          <span className="lead-location">
            <MapPin size={13} className="inline-icon text-muted" />
            {location}
          </span>
        </div>
        <PriorityBadge priority={priority} size="sm" />
      </div>

      {/* Priority Reason / Urgency Pill */}
      {reason && (
        <div className="lead-reason-pill">
          <Info size={12} className="reason-icon text-muted" />
          <span className="reason-text">{reason}</span>
        </div>
      )}

      {/* Compact Specs / Metadata Row */}
      <div className="lead-specs-row">
        <span className="spec-item" title="Property Requirement">
          <Home size={13} className="spec-icon text-primary" />
          <span>{req}</span>
        </span>
        <span className="spec-divider">•</span>
        <span className="spec-item" title="Budget">
          <IndianRupee size={13} className="spec-icon text-success" />
          <span>{budget}</span>
        </span>
        <span className="spec-divider">•</span>
        <span className="spec-item" title="Buying Timeline">
          <Clock size={13} className="spec-icon text-warning" />
          <span>{timeline}</span>
        </span>
      </div>

      {/* Scheduled Follow-up Banner if set */}
      {scheduledFollowUp && (
        <div className="lead-scheduled-banner">
          <CalendarClock size={12} className="text-ai" />
          <span>
            Follow-up scheduled:{' '}
            {new Date(scheduledFollowUp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}

      {/* Customer Message Snippet */}
      {message && (
        <div className="lead-message-snippet">
          <MessageSquare size={13} className="snippet-icon text-muted" />
          <p className="snippet-text">"{message}"</p>
        </div>
      )}

      {/* AI Next Action Box */}
      {nextAction && (
        <div className="lead-ai-next-box">
          <div className="ai-next-header">
            <Sparkles size={12} className="text-ai" />
            <span>AI Next Step</span>
          </div>
          <p className="ai-next-text">{nextAction}</p>
        </div>
      )}

      {/* Card Action Buttons: View, Chat, Follow-up */}
      <div className="lead-card-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm flex-1"
          onClick={() => onViewDetails(id)}
        >
          <span>View Details</span>
          <ArrowRight size={13} />
        </button>

        {onOpenChat && (
          <button
            type="button"
            className="btn btn-outline btn-sm action-icon-btn"
            onClick={() => onOpenChat(id)}
            title="Chat with AI about this lead"
          >
            <Bot size={14} className="text-ai" />
            <span>Chat</span>
          </button>
        )}

        {onOpenFollowUp && (
          <button
            type="button"
            className="btn btn-outline btn-sm action-icon-btn"
            onClick={() => onOpenFollowUp(id)}
            title="Generate personalized follow-up"
          >
            <SendHorizontal size={14} />
            <span>Follow-up</span>
          </button>
        )}
      </div>
    </div>
  );
}
