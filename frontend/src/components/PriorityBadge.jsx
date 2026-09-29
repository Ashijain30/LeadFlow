import React from 'react';
import { Flame, SunMedium, Snowflake } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'sm', showIcon = true }) {
  const norm = (priority || 'WARM').toUpperCase();
  const valid = ['HOT', 'WARM', 'COLD'].includes(norm) ? norm : 'WARM';

  const icons = {
    HOT: Flame,
    WARM: SunMedium,
    COLD: Snowflake,
  };
  const Icon = icons[valid];

  return (
    <span className={`priority-badge badge-${valid.toLowerCase()} badge-${size}`}>
      {showIcon && <Icon className="badge-icon" size={size === 'lg' ? 13 : 11} />}
      <span>{valid}</span>
    </span>
  );
}
