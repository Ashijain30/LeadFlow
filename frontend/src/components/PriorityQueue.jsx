import React from 'react';

/**
 * Condenses long AI-generated sentences into a crisp 2-4 word tactical action phrase.
 */
export function formatShortNextAction(actionText) {
  if (!actionText || typeof actionText !== 'string') return 'Call within 2h';
  const s = actionText.toLowerCase().trim();

  if (s.includes('call') && (s.includes('2') || s.includes('urgent') || s.includes('today') || s.includes('immediat'))) {
    return 'Call within 2h';
  }
  if (s.includes('call') && (s.includes('visit') || s.includes('site') || s.includes('inspect'))) {
    return 'Call to book visit';
  }
  if (s.includes('call') && (s.includes('confirm') || s.includes('lock'))) {
    return 'Call to confirm';
  }
  if (s.includes('whatsapp') && (s.includes('brochure') || s.includes('option') || s.includes('detail') || s.includes('unit'))) {
    return 'Send WhatsApp options';
  }
  if (s.includes('whatsapp')) {
    return 'Follow up on WhatsApp';
  }
  if (s.includes('visit') || s.includes('site') || s.includes('schedule')) {
    return 'Schedule site visit';
  }
  if (s.includes('brochure') || s.includes('portfolio') || s.includes('option')) {
    return 'Send project options';
  }
  if (s.includes('follow up') || s.includes('follow-up')) {
    return 'Follow up tomorrow';
  }
  if (s.includes('call') || s.includes('phone')) {
    return 'Call customer';
  }

  // If already short, use it
  if (actionText.length <= 26) {
    return actionText.replace(/[.]+$/, '');
  }

  // Fallback: take first 4 words
  const words = actionText.split(' ').slice(0, 4).join(' ');
  return words.replace(/[.,;:]+$/, '');
}

/**
 * Returns top 3 most actionable leads.
 */
export function getPriorityQueueLeads(leads) {
  if (!leads || leads.length === 0) return [];

  const sorted = [...leads].sort((a, b) => {
    // 1. Follow-up scheduled
    const aNext = a.nextFollowUpAt || a.next_follow_up_at;
    const bNext = b.nextFollowUpAt || b.next_follow_up_at;
    if (aNext && !bNext) return -1;
    if (!aNext && bNext) return 1;
    if (aNext && bNext) return new Date(aNext) - new Date(bNext);

    // 2. Priority rank (HOT > WARM > COLD)
    const rank = { HOT: 3, WARM: 2, COLD: 1 };
    const aRank = rank[a.priority] || 2;
    const bRank = rank[b.priority] || 2;
    if (aRank !== bRank) return bRank - aRank;

    // 3. Urgency
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
    <section className="priority-queue-section" aria-label="AI Priority Queue">
      <div className="queue-header">
        <span className="queue-title-tag">AI PRIORITY</span>
      </div>

      <div className="queue-cards-grid">
        {queueLeads.map((lead) => {
          const rawAction =
            lead.aiAnalysis?.recommendedNextAction ||
            lead.ai_analysis?.recommended_next_action ||
            'Call within 2h';
          const shortAction = formatShortNextAction(rawAction);
          const priority = lead.priority || 'WARM';

          return (
            <div key={lead.id} className="queue-card">
              <div className="queue-card-top">
                <h3 className="queue-lead-name" onClick={() => onViewDetails(lead.id)}>
                  {lead.name}
                </h3>
                <span className="queue-lead-meta">
                  <strong className={`queue-meta-priority priority-${priority.toLowerCase()}`}>
                    {priority}
                  </strong>{' '}
                  · {lead.location} · {lead.budget}
                </span>
              </div>

              <div className="queue-next-action">
                <span className="queue-next-label">Next:</span>
                <span className="queue-next-val">{shortAction}</span>
              </div>

              <div className="queue-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => onViewDetails(lead.id)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => onOpenFollowUp(lead.id)}
                >
                  Follow-up
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
