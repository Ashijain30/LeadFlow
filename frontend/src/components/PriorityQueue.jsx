import React from 'react';
import SmartFollowUps from './SmartFollowUps';

/**
 * Backward compatibility alias redirecting to SmartFollowUps.
 */
export default function PriorityQueue(props) {
  return <SmartFollowUps {...props} />;
}
