import React from 'react';

/**
 * Minimal subtle priority badge:
 * HOT: soft muted red background + dark red text
 * WARM: soft muted amber background + dark amber text
 * COLD: soft gray background + dark gray text
 */
export default function PriorityBadge({ priority, size = 'sm' }) {
  const normPriority = (priority || 'WARM').toUpperCase();

  return (
    <span className={`priority-badge priority-${normPriority.toLowerCase()} badge-${size}`}>
      {normPriority}
    </span>
  );
}
