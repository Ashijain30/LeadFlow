import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

export default function Header({ currentView, onNavigate }) {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-text">
            <span className="brand-title">LeadFlow</span>
            <span className="brand-tagline">AI-powered real estate sales copilot</span>
          </div>
        </div>

        <div className="navbar-actions">
          {currentView !== 'dashboard' ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft size={14} />
              <span>Back to Leads</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('add-lead')}
            >
              <Plus size={14} />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
