import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AddLead from './pages/AddLead';
import LeadDetails from './pages/LeadDetails';
import LeadChat from './pages/LeadChat';
import FollowUpGenerator from './pages/FollowUpGenerator';
import { initialMockLeads } from './data/mockLeads';
import './App.css';

export default function App() {
  const [leads, setLeads] = useState(initialMockLeads);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Find currently selected lead
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  // View navigation handlers
  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (id) => {
    setSelectedLeadId(id);
    handleNavigate('lead-details');
  };

  const handleOpenChat = (id) => {
    setSelectedLeadId(id);
    handleNavigate('lead-chat');
  };

  const handleOpenFollowUp = (id) => {
    setSelectedLeadId(id);
    handleNavigate('follow-up');
  };

  const handleSaveLead = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLead = () => {
    if (selectedLeadId) {
      handleNavigate('lead-details');
    } else {
      handleNavigate('dashboard');
    }
  };

  return (
    <div className="app-root">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main className="app-main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            leads={leads}
            onViewDetails={handleViewDetails}
            onAddLead={() => handleNavigate('add-lead')}
          />
        )}

        {currentView === 'add-lead' && (
          <AddLead
            onSaveLead={handleSaveLead}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'lead-details' && (
          <LeadDetails
            lead={selectedLead}
            onBack={() => handleNavigate('dashboard')}
            onOpenChat={handleOpenChat}
            onOpenFollowUp={handleOpenFollowUp}
          />
        )}

        {currentView === 'lead-chat' && (
          <LeadChat lead={selectedLead} onBack={handleBackToLead} />
        )}

        {currentView === 'follow-up' && (
          <FollowUpGenerator lead={selectedLead} onBack={handleBackToLead} />
        )}
      </main>
    </div>
  );
}
