/**
 * LeadFlow Frontend Intelligence Helpers
 * Condenses AI analyses into crisp, salesperson-friendly summaries and action phrases.
 */

/**
 * Generates an 8-15 word, single-sentence customer summary from AI analysis.
 * Strips out score explanations, long quotes, and repetitive fluff.
 */
export function getShortSummary(lead) {
  if (!lead) return 'Ready to purchase; review shortlisted options.';

  const analysis = lead.aiAnalysis || lead.ai_analysis || {};
  const rawSummary = analysis.summary || '';
  const intent = analysis.intent || '';
  const name = lead.name || '';
  const loc = lead.location || '';
  const timeline = (lead.buyingTimeline || lead.buying_timeline || '').toLowerCase();
  const req = (lead.propertyRequirement || lead.property_requirement || '').toLowerCase();

  // If a concise summary is already present and short (under 90 chars / 15 words)
  if (rawSummary && rawSummary.length < 90 && !rawSummary.toLowerCase().includes('pts') && !rawSummary.toLowerCase().includes('score')) {
    // Clean up any name repetitions or long prefixes
    let clean = rawSummary.replace(new RegExp(`^${name}\\s+(is|looking|wants)\\s+`, 'i'), '');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    const words = clean.split(/\s+/);
    if (words.length <= 15) {
      return clean.replace(/[.]+$/, '') + '.';
    }
  }

  // Domain-specific intelligent synthesis based on lead data
  const isImmediate = timeline.includes('immediate') || timeline.includes('1 month') || timeline.includes('ready');
  const isMidTerm = timeline.includes('2') || timeline.includes('3') || timeline.includes('month');
  const isLuxury = (lead.budget || '').includes('Cr');

  if (isImmediate && isLuxury) {
    return 'High-budget buyer ready to purchase; priority site inspection requested.';
  }
  if (isImmediate) {
    return 'Ready to buy soon; wants verified ready-to-move options.';
  }
  if (isMidTerm && isLuxury) {
    return 'Shortlisting premium luxury projects with confirmed legal approvals.';
  }
  if (isMidTerm) {
    return 'Actively shortlisting projects; purchase planned within 2–3 months.';
  }
  if (timeline.includes('4') || timeline.includes('6')) {
    return 'Comparing developer projects; purchase expected in 4–6 months.';
  }
  if (req.includes('plot') || req.includes('villa')) {
    return 'Exploring gated community plot and villa options.';
  }

  // Fallback cleanly formatted to 8-12 words
  return `Inquiring for ${req || 'property'} in ${loc || 'prime location'}; awaiting options.`;
}

/**
 * Condenses recommended next action into a punchy 2-4 word phrase.
 */
export function formatShortNextAction(rawAction) {
  if (!rawAction || typeof rawAction !== 'string') return 'Call within 2h';
  const s = rawAction.toLowerCase();

  if (s.includes('call') && (s.includes('2') || s.includes('urgent') || s.includes('today') || s.includes('immediat'))) {
    return 'Call within 2h';
  }
  if (s.includes('call') && (s.includes('visit') || s.includes('site') || s.includes('inspect') || s.includes('saturday'))) {
    return 'Call to book visit';
  }
  if (s.includes('whatsapp') && (s.includes('brochure') || s.includes('option') || s.includes('unit') || s.includes('2'))) {
    return 'Send 2 options';
  }
  if (s.includes('whatsapp')) {
    return 'WhatsApp details';
  }
  if (s.includes('visit') || s.includes('site') || s.includes('schedule')) {
    return 'Schedule site visit';
  }
  if (s.includes('brochure') || s.includes('option')) {
    return 'Send 2 options';
  }
  if (s.includes('follow up') || s.includes('follow-up')) {
    return 'Follow up tomorrow';
  }
  if (s.includes('call') || s.includes('phone')) {
    return 'Call customer';
  }

  const words = rawAction.replace(/[.,;:]+$/, '').split(/\s+/).slice(0, 4).join(' ');
  return words || 'Call within 2h';
}

/**
 * Derives follow-up timing and status (TODAY, OVERDUE, TOMORROW)
 */
export function getFollowUpStatus(lead, index = 0) {
  const nextAt = lead.nextFollowUpAt || lead.next_follow_up_at;
  const now = new Date();

  if (nextAt) {
    const target = new Date(nextAt);
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        badge: 'OVERDUE',
        timeText: target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        type: 'danger',
      };
    }
    if (diffHours <= 24 && target.getDate() === now.getDate()) {
      return {
        badge: 'TODAY',
        timeText: `Today ${target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
        type: 'warning',
      };
    }
    return {
      badge: 'TOMORROW',
      timeText: 'Tomorrow 11 AM',
      type: 'info',
    };
  }

  // Realistic defaults for initial pipeline
  const defaults = [
    { badge: 'TODAY', timeText: 'Today 2 PM', type: 'warning', action: 'Call' },
    { badge: 'TODAY', timeText: 'Today 4 PM', type: 'warning', action: 'WhatsApp' },
    { badge: 'TOMORROW', timeText: 'Tomorrow', type: 'info', action: 'Follow up' },
  ];

  return defaults[index % defaults.length];
}
