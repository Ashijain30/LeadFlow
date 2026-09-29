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

  // Compute pipeline statistics
  const counts = useMemo(() => {
    return {
      total: leads.length,
      hot: leads.filter((l) => (l.priority || '').toUpperCase() === 'HOT').length,
      warm: leads.filter((l) => (l.priority || '').toUpperCase() === 'WARM').length,
      cold: leads.filter((l) => (l.priority || '').toUpperCase() === 'COLD').length,
    };
  }, [leads]);

  // Filter leads based on priority and search query
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const p = (lead.priority || 'WARM').toUpperCase();
      const matchesPriority =
        priorityFilter === 'ALL' || p === priorityFilter;

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
      {/* 1. Pipeline Summary Stat Cards */}
      <SummaryCards
        counts={counts}
        activeFilter={priorityFilter}
        onSelectFilter={setPriorityFilter}
      />

      {/* 2. Follow-up Reminders (Required Own Feature) */}
      <SmartFollowUps
        leads={leads}
        onViewDetails={onViewDetails}
        onMarkDone={onMarkDone}
      />

      {/* 3. Leads Section */}
      <section className="leads-section" aria-label="Leads Pipeline">
        <div className="leads-section-header">
          <h2 className="section-title">LEADS</h2>
        </div>

        {/* Search & Filter Toolbar */}
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
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HOT', label: 'Hot' },
              { id: 'WARM', label: 'Warm' },
              { id: 'COLD', label: 'Cold' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`filter-pill ${priorityFilter === id ? 'is-active' : ''}`}
                onClick={() => setPriorityFilter(id)}
              >
                {label}
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

        {/* 4. Leads Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        {isLoading && leads.length === 0 ? (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <p>Loading pipeline...</p>
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
      </section>
    </div>
  );
}
