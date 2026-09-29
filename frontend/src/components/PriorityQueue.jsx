import React from 'react';
import { Sparkles, ArrowRight, SendHorizontal, CalendarClock, CheckCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

/**
 * Returns top 3 most actionable leads based on priority, scheduled follow-up, and timeline urgency.
 */
export function getPriorityQueueLeads(leads) {
  if (!leads || leads.length === 0) return [];

  const sorted = [...leads].sort((a, b) => {
    // 1. Scheduled follow-up prioritized
    const aNext = a.nextFollowUpAt || a.next_follow_up_at;
    const bNext = b.nextFollowUpAt || b.next_follow_up_at;
    if (aNext && !bNext) return -1;
    if (!aNext && bNext) return 1;
    if (aNext && bNext) return new Date(aNext) - new Date(bNext);

    // 2. Priority tier (HOT > WARM > COLD)
    const rank = { HOT: 3, WARM: 2, COLD: 1 };
    const aRank = rank[a.priority] || 2;
    const bRank = rank[b.priority] || 2;
    if (aRank !== bRank) return bRank - aRank;

    // 3. Timeline urgency
    const isUrgent = (tl) => {
      const s = (tl || '').toLowerCase();
      return s.includes('immediate') || s.includes('1 month') || s.includes('ready');
    };
    const aUrgent = isUrgent(a.buyingTimeline || a.buying_timeline);
    const bUrgent = isUrgent(b.buyingTimeline || b.buying_timeline);
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    return (b.id || 0) - (a.id || 0);
  });

  return sorted.slice(0, 3);
}

export default function PriorityQueue({ leads, onViewDetails, onOpenFollowUp }) {
  const queueLeads = getPriorityQueueLeads(leads);

  if (queueLeads.length === 0) return null;

  return (
    <section className="priority-queue-section">
      <div className="queue-header">
        <div className="queue-title-group">
          <div className="queue-icon-pill">
            <Sparkles size={16} className="text-ai" />
          </div>
          <div>
            <h2 className="queue-title">AI Priority Queue</h2>
            <p className="queue-subtitle">Leads that need your attention next</p>
          </div>
        </div>
        <span className="queue-count-tag">Top 3 Next Actions</span>
      </div>

      <div className="queue-cards-grid">
        {queueLeads.map((lead) => {
          const req = lead.propertyRequirement || lead.property_requirement;
          const timeline = lead.buyingTimeline || lead.buying_timeline;
          const action =
            lead.aiAnalysis?.recommendedNextAction ||
            lead.ai_analysis?.recommended_next_action ||
            'Follow up to review requirements.';
          const nextFollowUp = lead.nextFollowUpAt || lead.next_follow_up_at;

          return (
            <div key={lead.id} className="queue-card">
              <div className="queue-card-top">
                <div className="queue-lead-identity">
                  <h3 className="queue-lead-name">{lead.name}</h3>
                  <span className="queue-lead-meta">
                    {lead.location} · {req} · {lead.budget}
                  </span>
                </div>
                <PriorityBadge priority={lead.priority} size="sm" />
              </div>

              {nextFollowUp && (
                <div className="queue-scheduled-pill">
                  <CalendarClock size={12} />
                  <span>
                    Follow-up:{' '}
                    {new Date(nextFollowUp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              <div className="queue-action-box">
                <CheckCircle size={14} className="queue-action-icon" />
                <p className="queue-action-text">{action}</p>
              </div>

              <div className="queue-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onViewDetails(lead.id)}
                >
                  <span>Open</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onOpenFollowUp(lead.id)}
                >
                  <SendHorizontal size={13} />
                  <span>Follow-up</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
