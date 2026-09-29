import React, { useState, useMemo } from 'react';
import { Search, RotateCw } from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import SmartFollowUps from '../components/SmartFollowUps';
import LeadCard from '../components/LeadCard';
import EmptyState from '../components/EmptyState';

export default function Dashboard({
  leads,
  isLoading,
  onViewDetails,
  onOpenChat,
  onOpenFollowUp,
  onAddLead,
  onRefresh,
  onMarkDone,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Compute pipeline counts
  const counts = useMemo(() => {
    return {
      total: leads.length,
      hot: leads.filter((l) => l.priority === 'HOT').length,
      warm: leads.filter((l) => l.priority === 'WARM').length,
      cold: leads.filter((l) => l.priority === 'COLD').length,
    };
  }, [leads]);

  // Filter leads based on search query and priority tab
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesPriority =
        priorityFilter === 'ALL' || lead.priority === priorityFilter;

      if (!matchesPriority) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const name = (lead.name || '').toLowerCase();
      const loc = (lead.location || '').toLowerCase();
      const req = (lead.propertyRequirement || lead.property_requirement || '').toLowerCase();
      const msg = (lead.customerMessage || lead.customer_message || '').toLowerCase();

      return (
        name.includes(q) ||
        loc.includes(q) ||
        req.includes(q) ||
        msg.includes(q)
      );
    });
  }, [leads, priorityFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
  };

  return (
    <div className="dashboard-page">
      {/* 1. Pipeline Summary Bar */}
      <SummaryCards
        counts={counts}
        activeFilter={priorityFilter}
        onSelectFilter={setPriorityFilter}
      />

      {/* 2. Smart Follow-ups (Required Own Feature) */}
      <SmartFollowUps
        leads={leads}
        onViewDetails={onViewDetails}
        onMarkDone={onMarkDone}
      />

      {/* 3. Leads Section Header & Compact Toolbar */}
      <div className="leads-section">
        <div className="leads-section-header">
          <div className="leads-title-row">
            <span className="leads-main-title">LEADS</span>
            <span className="leads-count-tag">{filteredLeads.length} leads</span>
          </div>
        </div>

        {/* Compact Search & Filter Toolbar */}
        <div className="search-filter-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-pill-group">
            {['ALL', 'HOT', 'WARM', 'COLD'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`filter-tab-pill ${priorityFilter === tab ? 'is-active' : ''}`}
                onClick={() => setPriorityFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              type="button"
              className="btn btn-secondary btn-xs refresh-btn"
              onClick={onRefresh}
              title="Refresh leads"
            >
              <RotateCw size={13} className={isLoading ? 'spin-icon' : ''} />
            </button>
          )}
        </div>

        {/* 4. Leads Grid (3-column on desktop) */}
        {isLoading && leads.length === 0 ? (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <p>Loading leads...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="leads-grid">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onViewDetails={onViewDetails}
                onOpenChat={onOpenChat}
                onOpenFollowUp={onOpenFollowUp}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              searchQuery || priorityFilter !== 'ALL'
                ? 'No leads match your filter.'
                : 'No leads available.'
            }
            onReset={handleResetFilters}
            onAddLead={onAddLead}
            isSearchOrFilter={searchQuery !== '' || priorityFilter !== 'ALL'}
          />
        )}
      </div>
    </div>
  );
}
