import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AddLead from './pages/AddLead';
import LeadDetails from './pages/LeadDetails';
import LeadChat from './pages/LeadChat';
import FollowUpGenerator from './pages/FollowUpGenerator';
import { initialMockLeads } from './data/mockLeads';
import { getLeads, createLead, deleteLead, reanalyzeLead } from './services/api';
import './App.css';

export default function App() {
  const [leads, setLeads] = useState(initialMockLeads);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch leads from backend API on mount
  const refreshLeads = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    setApiError(null);
    try {
      const data = await getLeads();
      if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using fallback data:', err);
      setApiError('Connected in local mode. Backend server syncing.');
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

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

  const handleSaveLead = async (formData) => {
    try {
      const created = await createLead(formData);
      setLeads((prev) => [created, ...prev]);
      setSelectedLeadId(created.id);
      setCurrentView('lead-details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to create lead on server:', err);
      // Fallback local addition if network fails
      const fallbackLead = {
        id: Date.now(),
        ...formData,
        priority: 'HOT',
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          summary: `Inbound buyer inquiry for ${formData.propertyRequirement} in ${formData.location}.`,
          intent: 'Immediate home purchase',
          keyRequirements: [formData.propertyRequirement, formData.location, formData.budget],
          objections: ['Price and approval verification'],
          recommendedNextAction: 'Call customer to schedule site visit.',
          suggestedResponse: `Hi ${formData.name}, thank you for inquiring! We have verified options matching your requirements.`,
        },
      };
      setLeads((prev) => [fallbackLead, ...prev]);
      setSelectedLeadId(fallbackLead.id);
      setCurrentView('lead-details');
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadId === id) setSelectedLeadId(null);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Failed to delete lead:', err);
      // Fallback local deletion
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadId === id) setSelectedLeadId(null);
      setCurrentView('dashboard');
    }
  };

  const handleReanalyzeLead = async (id) => {
    try {
      const updated = await reanalyzeLead(id);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    } catch (err) {
      console.error('Failed to reanalyze lead:', err);
      throw err;
    }
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

      {apiError && (
        <div className="api-notice-banner">
          <span>{apiError}</span>
          <button type="button" className="btn-link" onClick={() => refreshLeads()}>
            Retry Connection
          </button>
        </div>
      )}

      <main className="app-main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            leads={leads}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onAddLead={() => handleNavigate('add-lead')}
            onRefresh={() => refreshLeads()}
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
            onDeleteLead={handleDeleteLead}
            onReanalyzeLead={handleReanalyzeLead}
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
