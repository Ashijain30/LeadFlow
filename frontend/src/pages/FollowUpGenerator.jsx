import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
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

  const channels = ['WhatsApp', 'Email', 'Call'];
  const tones = ['Professional', 'Friendly', 'Assertive', 'Urgent'];

  const getFallbackContent = (selectedChannel, selectedTone) => {
    const name = lead?.name || 'Customer';
    if (selectedChannel === 'WhatsApp') {
      if (selectedTone === 'Friendly') {
        return `Hey ${name}! 👋 Hope your week is going great.\n\nSaw your note about looking for a ${req} in ${loc} within ${budget}. We just got two lovely verified options that match what you're looking for!\n\nWhen would be a good time for a quick 5-min chat or to share photos over WhatsApp?`;
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
        return `Subject: Great options for your ${req} in ${loc}! 🏡\n\nHi ${name},\n\nHope you are having a wonderful day!\n\nI came across your inquiry regarding a ${req} in ${loc}. We have a couple of verified properties that fall right inside your ${budget} budget.\n\nI’ve attached the digital brochures with photos and floor plans. Whenever you have a free moment, take a look and let me know your thoughts!\n\nWarm regards,\nLeadFlow Advisory Team`;
      }
      if (selectedTone === 'Assertive') {
        return `Subject: Shortlisted Properties: ${req} in ${loc} [Action Required]\n\nDear ${name},\n\nThank you for your inquiry. Properties matching ${req} in prime ${loc} within the ${budget} bracket have limited inventory.\n\nTo ensure you don’t miss out on units aligned with your "${timeline}" timeline, I recommend scheduling a 15-minute consultation to review RERA documents and lock in pricing.\n\nPlease confirm whether tomorrow at 11:00 AM or 3:00 PM works for your calendar.\n\nSincerely,\nLeadFlow Advisory`;
      }
      if (selectedTone === 'Urgent') {
        return `Subject: Priority Alert: Limited availability for ${req} in ${loc}\n\nDear ${name},\n\nWe are writing with an urgent update regarding your search for a ${req} in ${loc}.\n\nDue to recent price revisions taking effect next Monday, the existing inventory within your ${budget} range will expire shortly. Given your planned timeline of "${timeline}", acting this week will save significant capital.\n\nPlease reply directly to this email or call me immediately to schedule priority site access.\n\nBest regards,\nLeadFlow Advisory Team`;
      }
      return `Subject: Curated Property Portfolio: ${req} in ${loc}\n\nDear ${name},\n\nThank you for contacting us regarding your requirement for a ${req} in ${loc} within the ${budget} budget range.\n\nWe have conducted a preliminary inventory assessment tailored to your purchase horizon (${timeline}) and identified two high-potential properties that satisfy your criteria.\n\nAttached please find the comprehensive project dossier. We would welcome the opportunity to coordinate a private site inspection for you.\n\nRespectfully yours,\nLeadFlow Realty`;
    }

    // Call Script
    return `[CALL SCRIPT — ${selectedTone.toUpperCase()} TONE]\nLead: ${name} | Location: ${loc} | Budget: ${budget}\n\n1. INTRODUCTION:\n"Hello ${name}, this is [Your Name] from LeadFlow Realty following up on your inquiry for a ${req} in ${loc}."\n\n2. VALUE PROPOSITION:\n"We have two verified options fitting your ${budget} budget with ready access for inspection."\n\n3. PROPOSED NEXT STEP:\n"I can reserve a priority site visit for you this Saturday. Would 11:00 AM or 3:00 PM suit your schedule best?"`;
  };

  const [generatedText, setGeneratedText] = useState(() =>
    getFallbackContent('WhatsApp', 'Professional')
  );

  if (!lead) {
    return (
      <div className="followup-page">
        <p>Lead not found.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          Dashboard
        </button>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const channelParam = channel === 'Call' ? 'Call Script' : channel;
      const res = await generateFollowUp(lead.id, channelParam, tone);
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
      {/* Header */}
      <div className="page-header-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <div className="followup-header-title">
          <h2 className="page-title">Follow-up</h2>
          <span className="followup-lead-tag">· {lead.name}</span>
        </div>
      </div>

      {/* Compact Controls Toolbar */}
      <div className="followup-toolbar-card">
        <div className="control-group">
          <span className="control-label">Channel:</span>
          <div className="control-pills">
            {channels.map((ch) => (
              <button
                key={ch}
                type="button"
                className={`control-pill ${channel === ch ? 'is-selected' : ''}`}
                onClick={() => setChannel(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Tone:</span>
          <div className="control-pills">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                className={`control-pill ${tone === t ? 'is-selected' : ''}`}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles size={13} className={isGenerating ? 'spin-icon' : ''} />
          <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {/* Output Preview */}
      <div className="followup-output-card">
        <div className="output-card-header">
          <div className="output-meta-tags">
            <span className="meta-tag">{channel}</span>
            <span className="meta-tag">{tone}</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-xs copy-btn"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={12} className="text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="output-content-area">
          <pre className="output-preformatted-text">{generatedText}</pre>
        </div>
      </div>
    </div>
  );
}
