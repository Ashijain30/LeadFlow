import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
  SendHorizontal,
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import { generateFollowUp } from '../services/api';

export default function FollowUpGenerator({ lead, onBack }) {
  const [channel, setChannel] = useState('WhatsApp');
  const [tone, setTone] = useState('Professional');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const req = lead?.propertyRequirement || lead?.property_requirement || '';
  const loc = lead?.location || '';
  const budget = lead?.budget || '';
  const timeline = lead?.buyingTimeline || lead?.buying_timeline || '';

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', Icon: MessageCircle },
    { id: 'Email', label: 'Email', Icon: Mail },
    { id: 'Call Script', label: 'Call Script', Icon: PhoneCall },
  ];

  const tones = ['Professional', 'Friendly', 'Assertive', 'Urgent'];

  // High quality contextual fallback if network is offline
  const getFallbackContent = (selectedChannel, selectedTone) => {
    const name = lead?.name || 'Customer';
    if (selectedChannel === 'WhatsApp') {
      if (selectedTone === 'Friendly') {
        return `Hey ${name}! 👋 Hope your week is going great.\n\nSaw your note about looking for a ${req} in ${loc} within ${budget}. We just got two lovely verified options that match what you're looking for!\n\nWhen would be a good time for a quick 5-min chat or to share photos over WhatsApp? Cheers!`;
      }
      if (selectedTone === 'Assertive') {
        return `Hi ${name}, following up regarding your inquiry for ${req} in ${loc}.\n\nHigh-demand inventory within your ${budget} range moves fast, especially for buyers with a "${timeline}" timeline. I have shortlisted 2 verified units for you.\n\nLet's fix a 10-minute call today to lock in your site visit before these units are booked.`;
      }
      if (selectedTone === 'Urgent') {
        return `Urgent Update for ${name}: Two premium ${req} units in ${loc} within ${budget} just opened up today.\n\nGiven your timeline (${timeline}), I strongly suggest reviewing these today. Can I call you in 15 minutes?`;
      }
      return `Dear ${name}, thank you for your interest in real estate opportunities in ${loc}.\n\nRegarding your requirement for a ${req} with a budget of ${budget}, we have curated shortlisted properties matching your "${timeline}" purchase timeline.\n\nPlease let me know if I may share the project brochure and schedule a site inspection at your convenience.`;
    }

    if (selectedChannel === 'Email') {
      if (selectedTone === 'Friendly') {
        return `Subject: Great options for your ${req} in ${loc}! 🏡\n\nHi ${name},\n\nHope you are having a wonderful day!\n\nI came across your inquiry regarding a ${req} in ${loc}. Finding the right home can take time, but we happen to have a couple of verified properties that fall right inside your ${budget} budget.\n\nI’ve attached the digital brochures with photos and floor plans. Whenever you have a free moment, take a look and let me know your thoughts!\n\nWarm regards,\nMasal AI Realty Team`;
      }
      if (selectedTone === 'Assertive') {
        return `Subject: Shortlisted Properties: ${req} in ${loc} [Action Required]\n\nDear ${name},\n\nThank you for your inquiry. Properties matching ${req} in prime ${loc} within the ${budget} bracket have limited inventory.\n\nTo ensure you don’t miss out on units aligned with your "${timeline}" timeline, I recommend scheduling a 15-minute consultation to review RERA documents and lock in pricing.\n\nPlease confirm whether tomorrow at 11:00 AM or 3:00 PM works for your calendar.\n\nSincerely,\nSales Lead | Masal AI Realty`;
      }
      if (selectedTone === 'Urgent') {
        return `Subject: Priority Alert: Limited availability for ${req} in ${loc}\n\nDear ${name},\n\nWe are writing with an urgent update regarding your search for a ${req} in ${loc}.\n\nDue to recent price revisions taking effect next Monday, the existing inventory within your ${budget} range will expire shortly. Given your planned timeline of "${timeline}", acting this week will save significant capital.\n\nPlease reply directly to this email or call me immediately to schedule priority site access.\n\nBest regards,\nMasal AI Advisory Team`;
      }
      return `Subject: Curated Property Portfolio: ${req} in ${loc}\n\nDear ${name},\n\nThank you for contacting us regarding your requirement for a ${req} in ${loc} within the ${budget} budget range.\n\nWe have conducted a preliminary inventory assessment tailored to your purchase horizon (${timeline}). We have identified two high-potential properties that satisfy your criteria, complete with approved legal documentation and verified amenities.\n\nAttached please find the comprehensive project dossier. We would welcome the opportunity to coordinate a private site inspection for you and your family.\n\nRespectfully yours,\nSenior Relationship Manager\nMasal AI Realty`;
    }

    // Call Script
    return `[CALL SCRIPT — ${selectedTone.toUpperCase()} TONE]\nLead: ${name} | Location: ${loc} | Budget: ${budget}\n\n1. INTRODUCTION:\n"Hello ${name}, this is [Your Name] from Masal AI Realty following up on your inquiry for a ${req} in ${loc}."\n\n2. VALUE PROPOSITION:\n"We have two verified options fitting your ${budget} budget with ready access for inspection."\n\n3. PROPOSED NEXT STEP:\n"I can reserve a priority site visit for you this Saturday. Would 11:00 AM or 3:00 PM suit your schedule best?"`;
  };

  const [generatedText, setGeneratedText] = useState(() =>
    getFallbackContent('WhatsApp', 'Professional')
  );

  if (!lead) {
    return (
      <div className="followup-page">
        <p>Lead not found.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateFollowUp(lead.id, channel, tone);
      setGeneratedText(res.content || res.text);
    } catch (err) {
      console.warn('Real AI follow-up endpoint error, using contextual fallback:', err);
      setGeneratedText(getFallbackContent(channel, tone));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="followup-page">
      {/* Page Header */}
      <div className="page-header-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Lead</span>
        </button>
        <div className="followup-header-title">
          <div className="followup-title-flex">
            <h2 className="page-title">AI Follow-up Generator</h2>
            <PriorityBadge priority={lead.priority} size="sm" />
          </div>
          <p className="page-subtitle">
            Generating customized communication for <strong>{lead.name}</strong> •{' '}
            {req} ({loc})
          </p>
        </div>
      </div>

      <div className="followup-layout-grid">
        {/* Left Column: Controls */}
        <div className="followup-controls-card">
          <h3 className="controls-section-title">1. Select Channel</h3>
          <div className="channel-selector-group">
            {channels.map((item) => {
              const { id, label, Icon } = item;
              const isSelected = channel === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`channel-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setChannel(id)}
                >
                  <Icon size={18} className="channel-icon" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <h3 className="controls-section-title">2. Select Tone</h3>
          <div className="tone-selector-grid">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                className={`tone-pill ${tone === t ? 'is-selected' : ''}`}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="generate-action-box">
            <button
              type="button"
              className="btn btn-primary btn-full generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles size={16} className={isGenerating ? 'spin-icon' : ''} />
              <span>{isGenerating ? 'Generating with AI...' : 'Generate Follow-up'}</span>
            </button>
          </div>

          <div className="lead-quick-context">
            <h4>Lead Context Referenced:</h4>
            <ul>
              <li><strong>Name:</strong> {lead.name}</li>
              <li><strong>Requirement:</strong> {req}</li>
              <li><strong>Budget:</strong> {budget}</li>
              <li><strong>Timeline:</strong> {timeline}</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Output Preview */}
        <div className="followup-output-card">
          <div className="output-card-header">
            <div className="output-meta-tags">
              <span className="output-tag channel-tag">{channel}</span>
              <span className="output-tag tone-tag">{tone} Tone</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm copy-btn"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-success" />
                  <span className="text-success">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="output-content-area">
            <pre className="output-preformatted-text">{generatedText}</pre>
          </div>

          <div className="output-footer-info">
            <SendHorizontal size={14} className="text-muted" />
            <span>Ready to send to {lead.name} via {channel}. Context dynamically tailored.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
