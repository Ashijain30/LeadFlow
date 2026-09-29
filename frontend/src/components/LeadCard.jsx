import React from 'react';
import { MapPin, Home, IndianRupee, Clock, MessageSquare, Sparkles, ArrowRight, Info } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function LeadCard({ lead, onViewDetails }) {
  const {
    id,
    name,
    location,
    propertyRequirement,
    budget,
    buyingTimeline,
    customerMessage,
    priority,
    priorityReason,
    priority_reason,
    aiAnalysis,
  } = lead;

  const reason = priorityReason || priority_reason;

  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div className="lead-title-area">
          <h3 className="lead-name">{name}</h3>
          <span className="lead-location">
            <MapPin size={14} className="icon-inline text-muted" />
            {location}
          </span>
        </div>
        <PriorityBadge priority={priority} />
      </div>

      {reason && (
        <div className="priority-reason-pill">
          <Info size={12} className="reason-icon" />
          <span>{reason}</span>
        </div>
      )}

      <div className="lead-property-info">
        <div className="lead-info-row">
          <Home size={15} className="icon-inline text-primary" />
          <span className="lead-requirement">{propertyRequirement}</span>
        </div>
      </div>

      <div className="lead-meta-chips">
        <div className="meta-chip">
          <IndianRupee size={13} className="chip-icon" />
          <span>{budget}</span>
        </div>
        <div className="meta-chip">
          <Clock size={13} className="chip-icon" />
          <span>{buyingTimeline}</span>
        </div>
      </div>

      <div className="lead-message-snippet">
        <MessageSquare size={14} className="snippet-icon" />
        <p className="snippet-text">"{customerMessage}"</p>
      </div>

      {aiAnalysis?.recommendedNextAction && (
        <div className="lead-ai-action-preview">
          <div className="ai-preview-header">
            <Sparkles size={13} className="text-ai" />
            <span>AI Recommended Next Step</span>
          </div>
          <p className="ai-preview-text">{aiAnalysis.recommendedNextAction}</p>
        </div>
      )}

      <div className="lead-card-footer">
        <button
          type="button"
          className="btn btn-outline btn-full"
          onClick={() => onViewDetails(id)}
        >
          <span>View Lead & AI Analysis</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
