import React from 'react';
import { SearchX, Plus, RotateCcw } from 'lucide-react';

export default function EmptyState({ message, onReset, onAddLead, isSearchOrFilter }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <SearchX size={36} />
      </div>
      <h3 className="empty-state-title">No leads found</h3>
      <p className="empty-state-desc">
        {message || "We couldn't find any leads matching your current criteria."}
      </p>
      <div className="empty-state-actions">
        {isSearchOrFilter && onReset && (
          <button type="button" className="btn btn-secondary" onClick={onReset}>
            <RotateCcw size={15} />
            <span>Reset Search & Filters</span>
          </button>
        )}
        {onAddLead && (
          <button type="button" className="btn btn-primary" onClick={onAddLead}>
            <Plus size={15} />
            <span>Add New Lead</span>
          </button>
        )}
      </div>
    </div>
  );
}
