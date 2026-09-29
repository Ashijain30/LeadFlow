import React from 'react';

/**
 * Compact horizontal pipeline filter bar:
 * ALL 5   HOT 3   WARM 2   COLD 0
 */
export default function SummaryCards({ counts, activeFilter, onSelectFilter }) {
  const items = [
    { id: 'ALL', label: 'ALL', count: counts.total },
    { id: 'HOT', label: 'HOT', count: counts.hot },
    { id: 'WARM', label: 'WARM', count: counts.warm },
    { id: 'COLD', label: 'COLD', count: counts.cold },
  ];

  return (
    <div className="pipeline-bar" role="toolbar" aria-label="Pipeline filter bar">
      {items.map(({ id, label, count }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            className={`pipeline-pill ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelectFilter(id)}
            aria-pressed={isActive}
          >
            <span className="pipeline-pill-label">{label}</span>
            <span className="pipeline-pill-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
