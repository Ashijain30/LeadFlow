import React from 'react';

/**
 * 4 compact horizontal stat cards:
 * TOTAL 5   HOT 3   WARM 2   COLD 0
 * Acts as an interactive filter for the pipeline.
 */
export default function SummaryCards({ counts, activeFilter, onSelectFilter }) {
  const cards = [
    { id: 'ALL', label: 'TOTAL', count: counts.total },
    { id: 'HOT', label: 'HOT', count: counts.hot },
    { id: 'WARM', label: 'WARM', count: counts.warm },
    { id: 'COLD', label: 'COLD', count: counts.cold },
  ];

  return (
    <div className="pipeline-stats-grid" role="region" aria-label="Pipeline Summary Statistics">
      {cards.map(({ id, label, count }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            className={`stat-card ${isActive ? 'is-active' : ''} stat-${id.toLowerCase()}`}
            onClick={() => onSelectFilter(id)}
            aria-pressed={isActive}
          >
            <span className="stat-label">{label}</span>
            <span className="stat-number">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
