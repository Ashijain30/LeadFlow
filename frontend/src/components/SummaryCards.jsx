import React from 'react';

/**
 * Ultra-compact horizontal stat/filter bar: All 5 · Hot 3 · Warm 2 · Cold 0
 */
export default function SummaryCards({ counts, activeFilter, onSelectFilter }) {
  const items = [
    { id: 'ALL', label: 'All', count: counts.total, type: 'all' },
    { id: 'HOT', label: 'Hot', count: counts.hot, type: 'hot' },
    { id: 'WARM', label: 'Warm', count: counts.warm, type: 'warm' },
    { id: 'COLD', label: 'Cold', count: counts.cold, type: 'cold' },
  ];

  return (
    <div className="pipeline-stat-bar" role="toolbar" aria-label="Pipeline filter bar">
      {items.map(({ id, label, count, type }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            className={`stat-pill stat-${type} ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelectFilter(id)}
            aria-pressed={isActive}
          >
            <span className="stat-label">{label}</span>
            <span className="stat-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
