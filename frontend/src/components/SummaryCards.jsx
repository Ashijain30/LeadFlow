import React from 'react';
import { Users, Flame, SunMedium, Snowflake } from 'lucide-react';

export default function SummaryCards({ counts, activeFilter, onSelectFilter }) {
  const cards = [
    {
      id: 'ALL',
      label: 'Total Leads',
      count: counts.total,
      subtext: 'Active in pipeline',
      Icon: Users,
      theme: 'summary-total',
    },
    {
      id: 'HOT',
      label: 'Hot Leads',
      count: counts.hot,
      subtext: 'High urgency (< 1-2 mos)',
      Icon: Flame,
      theme: 'summary-hot',
    },
    {
      id: 'WARM',
      label: 'Warm Leads',
      count: counts.warm,
      subtext: 'Evaluating (2-6 mos)',
      Icon: SunMedium,
      theme: 'summary-warm',
    },
    {
      id: 'COLD',
      label: 'Cold Leads',
      count: counts.cold,
      subtext: 'Exploratory (> 6 mos)',
      Icon: Snowflake,
      theme: 'summary-cold',
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card) => {
        const { id, label, count, subtext, Icon, theme } = card;
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            className={`summary-card ${theme} ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelectFilter(id)}
          >
            <div className="summary-card-header">
              <span className="summary-label">{label}</span>
              <div className="summary-icon-pill">
                <Icon size={18} />
              </div>
            </div>
            <div className="summary-count">{count}</div>
            <div className="summary-subtext">{subtext}</div>
          </button>
        );
      })}
    </div>
  );
}
