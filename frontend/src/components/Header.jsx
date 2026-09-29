import React from 'react';
import { Building2, Plus, ArrowLeft } from 'lucide-react';

export default function Header({ currentView, onNavigate }) {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <Building2 className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">Masal AI</span>
              <span className="brand-badge">Sales Assistant</span>
            </div>
            <p className="brand-tagline">Inbound Real Estate Lead Prioritization & Action Hub</p>
          </div>
        </div>

        <div className="navbar-actions">
          {currentView !== 'dashboard' ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('add-lead')}
            >
              <Plus size={16} />
              <span>Add New Lead</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
