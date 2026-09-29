import React from 'react';
import { Users, Flame, SunMedium, Snowflake } from 'lucide-react';

/**
 * Compact horizontal pipeline summary row for high scannability and fast filtering.
 */
export default function SummaryCards({ counts, activeFilter, onSelectFilter }) {
  const items = [
    {
      id: 'ALL',
      label: 'All Leads',
      count: counts.total,
      Icon: Users,
      colorClass: 'pill-all',
    },
    {
      id: 'HOT',
      label: 'Hot Leads',
      count: counts.hot,
      Icon: Flame,
      colorClass: 'pill-hot',
    },
    {
      id: 'WARM',
      label: 'Warm Leads',
      count: counts.warm,
      Icon: SunMedium,
      colorClass: 'pill-warm',
    },
    {
      id: 'COLD',
      label: 'Cold Leads',
      count: counts.cold,
      Icon: Snowflake,
      colorClass: 'pill-cold',
    },
  ];

  return (
    <div className="pipeline-summary-strip" role="region" aria-label="Pipeline overview">
      <div className="pipeline-strip-left">
        <span className="pipeline-label">Pipeline Overview</span>
      </div>
      <div className="pipeline-pills-row">
        {items.map((item) => {
          const { id, label, count, Icon, colorClass } = item;
          const isActive = activeFilter === id;
          return (
            <button
              key={id}
              type="button"
              className={`pipeline-pill ${colorClass} ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectFilter(id)}
              aria-pressed={isActive}
            >
              <Icon size={14} className="pill-icon" />
              <span className="pill-name">{label}</span>
              <span className="pill-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
