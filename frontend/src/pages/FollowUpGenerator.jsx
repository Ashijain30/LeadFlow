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

export default function FollowUpGenerator({ lead, onBack }) {
  const [channel, setChannel] = useState('WhatsApp');
  const [tone, setTone] = useState('Professional');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', Icon: MessageCircle },
    { id: 'Email', label: 'Email', Icon: Mail },
    { id: 'Call Script', label: 'Call Script', Icon: PhoneCall },
  ];

  const tones = ['Professional', 'Friendly', 'Assertive', 'Urgent'];

  // Helper to generate context-grounded mock follow-ups
  const getMockContent = (selectedChannel, selectedTone) => {
    const { name, location, propertyRequirement, budget, buyingTimeline } = lead;

    if (selectedChannel === 'WhatsApp') {
      if (selectedTone === 'Friendly') {
        return `Hey ${name}! 👋 Hope your week is going great.

Saw your note about looking for a ${propertyRequirement} in ${location} within ${budget}. We just got two lovely ready options that match what you're looking for!

When would be a good time for a quick 5-min chat or to share the photos over WhatsApp? Cheers!`;
      }
      if (selectedTone === 'Assertive') {
        return `Hi ${name}, following up regarding your inquiry for ${propertyRequirement} in ${location}.

High-demand inventory within your ${budget} range moves fast, especially for buyers with a "${buyingTimeline}" timeline. I have shortlisted 2 verified units for you. 

Let's fix a 10-minute call today to lock in your site visit before these units are booked.`;
      }
      if (selectedTone === 'Urgent') {
        return `Urgent Update for ${name}: Two premium ${propertyRequirement} units in ${location} within ${budget} just opened up today. 

Given your timeline (${buyingTimeline}), I strongly suggest reviewing these today. Can I call you in 15 minutes?`;
      }
      // Professional (Default)
      return `Dear ${name}, thank you for your interest in real estate opportunities in ${location}.

Regarding your requirement for a ${propertyRequirement} with a budget of ${budget}, we have curated shortlisted properties matching your "${buyingTimeline}" purchase timeline.

Please let me know if I may share the project brochure and schedule a site inspection at your convenience.`;
    }

    if (selectedChannel === 'Email') {
      if (selectedTone === 'Friendly') {
        return `Subject: Great options for your ${propertyRequirement} in ${location}! 🏡

Hi ${name},

Hope you are having a wonderful day!

I came across your inquiry regarding a ${propertyRequirement} in ${location}. Finding the right home can take time, but we happen to have a couple of verified properties that fall right inside your ${budget} budget.

I’ve attached the digital brochures with photos and floor plans. Whenever you have a free moment, take a look and let me know your thoughts!

Warm regards,
Your Dedicated Property Advisor
Masal AI Realty`;
      }
      if (selectedTone === 'Assertive') {
        return `Subject: Shortlisted Properties: ${propertyRequirement} in ${location} [Action Required]

Dear ${name},

Thank you for your inquiry. Properties matching ${propertyRequirement} in prime ${location} within the ${budget} bracket have limited inventory.

To ensure you don’t miss out on units aligned with your "${buyingTimeline}" timeline, I recommend scheduling a 15-minute consultation to review RERA documents and lock in pricing.

Please confirm whether tomorrow at 11:00 AM or 3:00 PM works for your calendar.

Sincerely,
Sales Lead
Masal AI Realty`;
      }
      if (selectedTone === 'Urgent') {
        return `Subject: Priority Alert: Limited availability for ${propertyRequirement} in ${location}

Dear ${name},

We are writing with an urgent update regarding your search for a ${propertyRequirement} in ${location}. 

Due to recent price revisions taking effect next Monday, the existing inventory within your ${budget} range will expire shortly. Given your planned timeline of "${buyingTimeline}", acting this week will save significant capital.

Please reply directly to this email or call me immediately to schedule priority site access.

Best regards,
Masal AI Advisory Team`;
      }
      // Professional (Default)
      return `Subject: Curated Property Portfolio: ${propertyRequirement} in ${location}

Dear ${name},

Thank you for contacting us regarding your requirement for a ${propertyRequirement} in ${location} within the ${budget} budget range.

We have conducted a preliminary inventory assessment tailored to your purchase horizon (${buyingTimeline}). We have identified two high-potential properties that satisfy your criteria, complete with approved legal documentation and verified amenities.

Attached please find the comprehensive project dossier. We would welcome the opportunity to coordinate a private site inspection for you and your family.

Respectfully yours,
Senior Relationship Manager
Masal AI Realty`;
    }

    // Call Script
    if (selectedTone === 'Friendly') {
      return `[CALL SCRIPT — FRIENDLY TONE]
Lead: ${name} | Location: ${location} | Budget: ${budget}

1. INTRODUCTION:
"Hi ${name}! This is [Your Name] from Masal Realty. How is your day going?"

2. CONTEXT & RAPPORT:
"I noticed you were looking for a ${propertyRequirement} in ${location}. I wanted to reach out personally because we have two exciting options that fit your ${budget} budget wonderfully."

3. DISCOVERY:
"I saw you are planning to move ${buyingTimeline}. Are you looking primarily for good school connectivity, or is easy commute to work your biggest priority?"

4. CALL TO ACTION:
"I would love to send over the 3D walkthrough video right after this call on WhatsApp. Can I also book you for an informal visit this weekend?"`;
    }

    if (selectedTone === 'Assertive') {
      return `[CALL SCRIPT — ASSERTIVE TONE]
Lead: ${name} | Location: ${location} | Budget: ${budget}

1. DIRECT OPENING:
"Hello ${name}, this is [Your Name] from Masal Realty regarding your inquiry for a ${propertyRequirement} in ${location}."

2. VALUE PROPOSITION & URGENCY:
"I'm calling because ready inventory in ${location} at ${budget} is scarce, and with your timeline of ${buyingTimeline}, delay will mean settling for compromise units or higher prices."

3. OVERCOME OBJECTIONS:
"All shortlists I'm recommending have full Occupancy Certificates and clear bank loan approvals. You won't face any regulatory delays."

4. FIRM CLOSING:
"I have an open inspection slot Saturday at 11 AM and another Sunday at 3 PM. Which of those two works better for you?"`;
    }

    if (selectedTone === 'Urgent') {
      return `[CALL SCRIPT — URGENT TONE]
Lead: ${name} | Location: ${location} | Budget: ${budget}

1. HIGH-ENERGY HOOK:
"Hello ${name}, [Your Name] here from Masal Realty. I'm calling you with an urgent notification regarding ${location}."

2. CRITICAL WINDOW:
"A high-floor ${propertyRequirement} unit in the ${budget} range was just released back into inventory this morning due to a cancelled booking. Because your timeline is ${buyingTimeline}, you have first right of refusal before it goes on open listing tomorrow."

3. IMMEDIATE ACTION:
"Can you join a 5-minute video call right now to review the floor layout, or should I reserve an on-site visit for you today?"`;
    }

    // Professional (Default)
    return `[CALL SCRIPT — PROFESSIONAL TONE]
Lead: ${name} | Location: ${location} | Budget: ${budget}

1. FORMAL GREETING:
"Good day, Mr./Ms. ${name}. My name is [Your Name] representing Masal AI Real Estate Advisory."

2. PURPOSE OF CALL:
"I am following up on your registered inquiry regarding a ${propertyRequirement} in ${location}. We have analyzed your budget of ${budget} against current market availabilities."

3. QUALIFICATION & VERIFICATION:
"To ensure our advisory aligns with your objectives: You mentioned a timeline of ${buyingTimeline}. Are there specific amenities or developer preferences you prioritize?"

4. NEXT STEP PROPOSAL:
"I will dispatch the verified prospectus to your email immediately. May I follow up with you tomorrow at 2 PM once you have had a moment to review the documentation?"`;
  };

  const [generatedText, setGeneratedText] = useState(() =>
    getMockContent('WhatsApp', 'Professional'),
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedText(getMockContent(channel, tone));
      setIsGenerating(false);
    }, 300);
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
            {lead.propertyRequirement} ({lead.location})
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
              <Sparkles size={16} />
              <span>{isGenerating ? 'Generating...' : 'Generate Follow-up'}</span>
            </button>
          </div>

          <div className="lead-quick-context">
            <h4>Lead Context Referenced:</h4>
            <ul>
              <li><strong>Name:</strong> {lead.name}</li>
              <li><strong>Requirement:</strong> {lead.propertyRequirement}</li>
              <li><strong>Budget:</strong> {lead.budget}</li>
              <li><strong>Timeline:</strong> {lead.buyingTimeline}</li>
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
