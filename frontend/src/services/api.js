/**
 * Centralized API client for Masal AI Backend.
 * Uses Vite proxy (/api -> http://localhost:8000) or explicit API_BASE_URL.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Normalizes backend snake_case lead fields for seamless frontend consumption.
 */
export function normalizeLead(lead) {
  if (!lead) return null;
  return {
    ...lead,
    propertyRequirement: lead.property_requirement || lead.propertyRequirement || '',
    buyingTimeline: lead.buying_timeline || lead.buyingTimeline || '',
    customerMessage: lead.customer_message || lead.customerMessage || '',
    priorityReason: lead.priority_reason || lead.priorityReason || '',
    aiAnalysis: lead.ai_analysis || lead.aiAnalysis || null,
    lastContactedAt: lead.last_contacted_at || lead.lastContactedAt || null,
    nextFollowUpAt: lead.next_follow_up_at || lead.nextFollowUpAt || null,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string'
          ? errorJson.detail
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Keep default errorDetail if response is not JSON
    }
    throw new Error(errorDetail);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

/**
 * GET /api/leads
 */
export async function getLeads(search = '', priority = 'ALL') {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (priority && priority !== 'ALL') params.append('priority', priority);

  const url = `${API_BASE}/api/leads${params.toString() ? `?${params.toString()}` : ''}`;
  const data = await handleResponse(await fetch(url));
  return Array.isArray(data) ? data.map(normalizeLead) : [];
}

/**
 * GET /api/leads/:id
 */
export async function getLeadById(id) {
  const url = `${API_BASE}/api/leads/${id}`;
  const data = await handleResponse(await fetch(url));
  return normalizeLead(data);
}

/**
 * POST /api/leads
 */
export async function createLead(leadData) {
  const payload = {
    name: leadData.name,
    location: leadData.location,
    property_requirement: leadData.propertyRequirement || leadData.property_requirement,
    budget: leadData.budget,
    buying_timeline: leadData.buyingTimeline || leadData.buying_timeline,
    customer_message: leadData.customerMessage || leadData.customer_message,
  };

  const url = `${API_BASE}/api/leads`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return normalizeLead(data);
}

/**
 * PUT /api/leads/:id
 */
export async function updateLead(id, updateData) {
  const payload = {
    ...(updateData.name && { name: updateData.name }),
    ...(updateData.location && { location: updateData.location }),
    ...(updateData.propertyRequirement && { property_requirement: updateData.propertyRequirement }),
    ...(updateData.budget && { budget: updateData.budget }),
    ...(updateData.buyingTimeline && { buying_timeline: updateData.buyingTimeline }),
    ...(updateData.customerMessage && { customer_message: updateData.customerMessage }),
  };

  const url = `${API_BASE}/api/leads/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return normalizeLead(data);
}

/**
 * DELETE /api/leads/:id
 */
export async function deleteLead(id) {
  const url = `${API_BASE}/api/leads/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res);
}

/**
 * POST /api/leads/:id/analyze
 */
export async function reanalyzeLead(id) {
  const url = `${API_BASE}/api/leads/${id}/analyze`;
  const res = await fetch(url, { method: 'POST' });
  const data = await handleResponse(res);
  return normalizeLead(data);
}

/**
 * POST /api/leads/:id/chat
 */
export async function chatWithLead(id, message, history = []) {
  const url = `${API_BASE}/api/leads/${id}/chat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  return handleResponse(res);
}

/**
 * POST /api/leads/:id/follow-up
 */
export async function generateFollowUp(id, channel, tone, instruction = '') {
  const url = `${API_BASE}/api/leads/${id}/follow-up`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, tone, instruction }),
  });
  return handleResponse(res);
}

/**
 * PUT /api/leads/:id/schedule
 */
export async function scheduleFollowUp(id, nextFollowUpAt, lastContactedAt = null) {
  const url = `${API_BASE}/api/leads/${id}/schedule`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      next_follow_up_at: nextFollowUpAt,
      last_contacted_at: lastContactedAt,
    }),
  });
  const data = await handleResponse(res);
  return normalizeLead(data);
}
