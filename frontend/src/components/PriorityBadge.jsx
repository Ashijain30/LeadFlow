import React from 'react';
import { Flame, SunMedium, Snowflake } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const normPriority = (priority || 'WARM').toUpperCase();

  const configs = {
    HOT: {
      label: 'HOT LEAD',
      classes: 'badge-hot',
      Icon: Flame,
    },
    WARM: {
      label: 'WARM LEAD',
      classes: 'badge-warm',
      Icon: SunMedium,
    },
    COLD: {
      label: 'COLD LEAD',
      classes: 'badge-cold',
      Icon: Snowflake,
    },
  };

  const config = configs[normPriority] || configs.WARM;
  const { label, classes, Icon } = config;

  return (
    <span className={`priority-badge ${classes} badge-${size}`}>
      <Icon className="badge-icon" size={size === 'lg' ? 16 : 13} />
      <span>{label}</span>
    </span>
  );
}
