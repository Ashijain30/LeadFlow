import React, { useState } from 'react';
import { User, MapPin, Home, IndianRupee, Clock, MessageSquare, ArrowLeft, Check } from 'lucide-react';

export default function AddLead({ onSaveLead, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    propertyRequirement: '',
    budget: '',
    buyingTimeline: 'Within 1 month',
    customerMessage: '',
  });

  const [errors, setErrors] = useState({});

  const timelineOptions = [
    'Immediate / Ready to move',
    'Within 1 month',
    'Within 2–3 months',
    'Within 4–6 months',
    'More than 6 months',
    'Just exploring / Long-term',
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Customer full name is required';
    if (!formData.location.trim()) newErrors.location = 'City / Location is required';
    if (!formData.propertyRequirement.trim())
      newErrors.propertyRequirement = 'Property requirement is required (e.g., 2 BHK apartment)';
    if (!formData.budget.trim()) newErrors.budget = 'Budget range is required (e.g., ₹80L–₹95L)';
    if (!formData.customerMessage.trim())
      newErrors.customerMessage = 'Inbound customer message or inquiry note is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Determine mock priority based on buying timeline for realistic behavior
    let priority = 'WARM';
    if (
      formData.buyingTimeline.includes('Immediate') ||
      formData.buyingTimeline.includes('1 month')
    ) {
      priority = 'HOT';
    } else if (
      formData.buyingTimeline.includes('More than 6 months') ||
      formData.buyingTimeline.includes('exploring')
    ) {
      priority = 'COLD';
    }

    const newLead = {
      id: Date.now(),
      name: formData.name.trim(),
      location: formData.location.trim(),
      propertyRequirement: formData.propertyRequirement.trim(),
      budget: formData.budget.trim(),
      buyingTimeline: formData.buyingTimeline,
      customerMessage: formData.customerMessage.trim(),
      priority,
      createdAt: new Date().toISOString(),
      aiAnalysis: {
        summary: `Prospective homebuyer looking for ${formData.propertyRequirement} in ${formData.location} with budget ${formData.budget}.`,
        intent: `${formData.buyingTimeline.includes('Immediate') ? 'Immediate purchase' : 'Planned purchase'} in ${formData.location}`,
        keyRequirements: [
          formData.propertyRequirement,
          `Location: ${formData.location}`,
          `Budget: ${formData.budget}`,
          `Timeline: ${formData.buyingTimeline}`,
        ],
        objections: [
          'Needs pricing and payment breakdown confirmation',
          'Requires RERA / approval status verification',
        ],
        recommendedNextAction: `Contact ${formData.name} via phone or WhatsApp with 2 curated property brochures in ${formData.location}.`,
        suggestedResponse: `Hello ${formData.name}, thank you for reaching out! We have prime options for ${formData.propertyRequirement} in ${formData.location} matching your ${formData.budget} budget. Would you be free for a brief call today to review shortlists?`,
      },
    };

    onSaveLead(newLead);
  };

  return (
    <div className="add-lead-page">
      <div className="page-header-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </button>
        <div>
          <h2 className="page-title">Add New Lead</h2>
          <p className="page-subtitle">
            Capture inbound lead details to evaluate pipeline priority and generate AI strategy.
          </p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Customer Full Name <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                City / Preferred Location <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  id="location"
                  type="text"
                  className={`form-input ${errors.location ? 'is-invalid' : ''}`}
                  placeholder="e.g. Bengaluru, Whitefield"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>

            {/* Property Requirement */}
            <div className="form-group">
              <label htmlFor="propertyRequirement" className="form-label">
                Property Requirement <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <Home size={16} className="input-icon" />
                <input
                  id="propertyRequirement"
                  type="text"
                  className={`form-input ${errors.propertyRequirement ? 'is-invalid' : ''}`}
                  placeholder="e.g. 2 BHK ready to move, high floor"
                  value={formData.propertyRequirement}
                  onChange={(e) => handleChange('propertyRequirement', e.target.value)}
                />
              </div>
              {errors.propertyRequirement && (
                <span className="form-error">{errors.propertyRequirement}</span>
              )}
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget" className="form-label">
                Budget Range <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <IndianRupee size={16} className="input-icon" />
                <input
                  id="budget"
                  type="text"
                  className={`form-input ${errors.budget ? 'is-invalid' : ''}`}
                  placeholder="e.g. ₹85L – ₹95L"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                />
              </div>
              {errors.budget && <span className="form-error">{errors.budget}</span>}
            </div>

            {/* Buying Timeline */}
            <div className="form-group form-col-full">
              <label htmlFor="buyingTimeline" className="form-label">
                Buying Timeline <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <Clock size={16} className="input-icon" />
                <select
                  id="buyingTimeline"
                  className="form-select"
                  value={formData.buyingTimeline}
                  onChange={(e) => handleChange('buyingTimeline', e.target.value)}
                >
                  {timelineOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Message */}
            <div className="form-group form-col-full">
              <label htmlFor="customerMessage" className="form-label">
                Inbound Customer Message / Inquiry <span className="text-danger">*</span>
              </label>
              <div className="textarea-wrapper">
                <textarea
                  id="customerMessage"
                  rows={4}
                  className={`form-textarea ${errors.customerMessage ? 'is-invalid' : ''}`}
                  placeholder="Paste the inbound WhatsApp, portal, or website message received from the lead..."
                  value={formData.customerMessage}
                  onChange={(e) => handleChange('customerMessage', e.target.value)}
                />
              </div>
              {errors.customerMessage && (
                <span className="form-error">{errors.customerMessage}</span>
              )}
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Save Lead & Generate Insights</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
