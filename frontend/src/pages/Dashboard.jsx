import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import LeadCard from '../components/LeadCard';
import EmptyState from '../components/EmptyState';

export default function Dashboard({ leads, onViewDetails, onAddLead }) {
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
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.propertyRequirement.toLowerCase().includes(q) ||
        lead.customerMessage.toLowerCase().includes(q)
      );
    });
  }, [leads, priorityFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
  };

  return (
    <div className="dashboard-page">
      {/* Top summary cards */}
      <SummaryCards
        counts={counts}
        activeFilter={priorityFilter}
        onSelectFilter={setPriorityFilter}
      />

      {/* Search and filter controls bar */}
      <div className="filter-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search leads by name, city, requirement, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="priority-filter-tabs">
          <SlidersHorizontal size={15} className="filter-icon" />
          {['ALL', 'HOT', 'WARM', 'COLD'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-tab ${priorityFilter === tab ? 'is-active' : ''}`}
              onClick={() => setPriorityFilter(tab)}
            >
              {tab === 'ALL' ? 'All Leads' : tab}
              <span className="tab-count">
                {tab === 'ALL'
                  ? counts.total
                  : tab === 'HOT'
                    ? counts.hot
                    : tab === 'WARM'
                      ? counts.warm
                      : counts.cold}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lead Cards List */}
      <div className="leads-section">
        <div className="leads-section-header">
          <h2 className="section-title">
            Inbound Leads{' '}
            <span className="leads-count-badge">({filteredLeads.length})</span>
          </h2>
          <span className="section-subtitle">
            Prioritized by urgency, budget feasibility, and customer intent
          </span>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="leads-grid">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              searchQuery || priorityFilter !== 'ALL'
                ? `No leads match "${searchQuery || priorityFilter}". Try adjusting your filters.`
                : 'No leads available in the pipeline yet.'
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
