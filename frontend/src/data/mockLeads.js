/**
 * Mock leads dataset representing realistic Indian real-estate inbound inquiries.
 * Designed with the exact data contract to be powered by FastAPI + SQLite in later phases.
 */
export const initialMockLeads = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Bengaluru",
    propertyRequirement: "2 BHK apartment near Whitefield",
    budget: "₹85L – ₹95L",
    buyingTimeline: "Within 1 month",
    customerMessage:
      "Looking for a ready-to-move 2 BHK near Whitefield close to ITPB. Can visit this Saturday with my family. Please share available units with parking.",
    priority: "HOT",
    createdAt: "2026-09-28T10:30:00Z",
    aiAnalysis: {
      summary:
        "High-intent IT professional looking for immediate ready-to-move 2BHK in Whitefield with family visit planned this Saturday.",
      intent: "Immediate purchase / End-user primary residence",
      keyRequirements: [
        "2 BHK ready-to-move",
        "Whitefield / near ITPB",
        "Covered car parking",
        "Budget ₹85L–₹95L",
      ],
      objections: [
        "Needs verified OC (Occupancy Certificate)",
        "Strict about weekend site inspection timing",
      ],
      recommendedNextAction:
        "Call immediately to lock in Saturday 11 AM site visit slot and WhatsApp brochure of 2 ready units.",
      suggestedResponse:
        "Hi Rahul, we have two excellent ready-to-move 2BHK units near ITPB Whitefield within ₹90L with dedicated covered parking. Can I schedule your site visit for this Saturday at 11 AM?",
    },
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Mumbai",
    propertyRequirement: "3 BHK sea-facing or high-rise in Worli / Lower Parel",
    budget: "₹4.5 Cr – ₹5.5 Cr",
    buyingTimeline: "Within 2 months",
    customerMessage:
      "Looking to upgrade to a spacious 3 BHK in Lower Parel or Worli. High floor preferred. Budget around 5 Cr. Need quick registration assistance.",
    priority: "HOT",
    createdAt: "2026-09-27T15:45:00Z",
    aiAnalysis: {
      summary:
        "High-net-worth buyer upgrading to luxury 3BHK in South/Central Mumbai; high floor priority with strong budget backing.",
      intent: "Luxury upgrade / End-user residence",
      keyRequirements: [
        "3 BHK spacious layout",
        "Lower Parel / Worli",
        "High floor (>25th floor) with open views",
        "Budget ₹4.5–5.5 Cr",
      ],
      objections: [
        "Expects end-to-end stamp duty and registration legal support",
        "Sensitive to high recurring maintenance fees",
      ],
      recommendedNextAction:
        "Share exclusive virtual walkthrough of 2 luxury towers in Lower Parel and offer legal concierge consultation.",
      suggestedResponse:
        "Hello Priya, we have premium high-floor 3BHK residences in Lower Parel offering panoramic views within your ₹5 Cr bracket. Our team provides complete legal and registration assistance. Would you prefer a brief phone call or a virtual walkthrough today?",
    },
  },
  {
    id: 3,
    name: "Amit Verma",
    location: "Gurgaon",
    propertyRequirement: "3 BHK + Servant room in Golf Course Extension Rd",
    budget: "₹1.8 Cr – ₹2.2 Cr",
    buyingTimeline: "Within 2–3 months",
    customerMessage:
      "Shortlisting 3 BHK + Utility options near Golf Course Ext Road. Still evaluating builder track records and waiting for appraisal bonus next month.",
    priority: "WARM",
    createdAt: "2026-09-25T11:20:00Z",
    aiAnalysis: {
      summary:
        "Corporate buyer evaluating 3BHK+Utility in Gurgaon; credible intent but timeline linked to next month's liquidity.",
      intent: "End-user family home upgrade",
      keyRequirements: [
        "3 BHK + Servant room",
        "Golf Course Extension Road",
        "Reputed Tier-1 builder with clean delivery track record",
        "Budget ~₹2 Cr",
      ],
      objections: [
        "Concerned about past delivery delays by certain regional developers",
        "Awaiting liquidity in 30 days before committing booking amount",
      ],
      recommendedNextAction:
        "Send comparison chart of completed projects by Tier-1 developers and nurture with construction milestone reports.",
      suggestedResponse:
        "Hi Amit, Golf Course Extension has some top-tier RERA-approved deliveries. I'll share a comparison of two Grade-A builders with zero delay track records so you have full clarity before your bonus arrives.",
    },
  },
  {
    id: 4,
    name: "Sneha Kulkarni",
    location: "Pune",
    propertyRequirement: "2 BHK in Baner or Balewadi",
    budget: "₹70L – ₹75L",
    buyingTimeline: "Within 4–6 months",
    customerMessage:
      "Working in Hinjewadi Phase 1. Looking for an under-construction project in Baner/Balewadi with possession by mid next year. Flexible on floor.",
    priority: "WARM",
    createdAt: "2026-09-24T09:10:00Z",
    aiAnalysis: {
      summary:
        "IT commuter seeking mid-stage under-construction 2BHK in Baner with possession mid next year.",
      intent: "End-user / Commuter convenience",
      keyRequirements: [
        "2 BHK",
        "Baner / Balewadi",
        "Possession mid next year",
        "Budget ₹70L–₹75L",
      ],
      objections: [
        "Cautious regarding construction progress timelines",
        "Comparing payment plans (e.g. 20:80 vs CLP)",
      ],
      recommendedNextAction:
        "Offer builder subvention / flexible payment plan options and schedule a weekday evening callback.",
      suggestedResponse:
        "Hello Sneha, we have a fast-progressing project in Balewadi with possession by June next year and an attractive 20:80 payment scheme within ₹72L. Let's connect for 5 minutes this evening to discuss floor plans.",
    },
  },
  {
    id: 5,
    name: "Vikram Reddy",
    location: "Hyderabad",
    propertyRequirement: "Commercial office space or retail shop in Gachibowli",
    budget: "₹1.2 Cr – ₹1.5 Cr",
    buyingTimeline: "Next 6–12 months",
    customerMessage:
      "Just exploring commercial rental yield options in Gachibowli or Financial District. Not in a rush, just want market brochures.",
    priority: "COLD",
    createdAt: "2026-09-20T14:15:00Z",
    aiAnalysis: {
      summary:
        "Passive investor researching commercial rental yields in Western Hyderabad without near-term purchase pressure.",
      intent: "Long-term investment / Rental yield",
      keyRequirements: [
        "Commercial / Retail unit",
        "Gachibowli or Financial District",
        "High rental ROI (7%+)",
        "Budget ₹1.2–1.5 Cr",
      ],
      objections: [
        "Long decision cycle (6-12 months)",
        "Skeptical about vacancy rates in commercial towers",
      ],
      recommendedNextAction:
        "Add to monthly commercial yield newsletter and send a high-level Gachibowli rental report.",
      suggestedResponse:
        "Hi Vikram, I have shared our Q3 Western Hyderabad Commercial Yield Report to your email. Whenever you are ready to evaluate pre-leased assets with guaranteed rental returns, I would be glad to assist.",
    },
  },
  {
    id: 6,
    name: "Ananya Sen",
    location: "Kolkata",
    propertyRequirement: "2 BHK budget flat in New Town",
    budget: "₹40L – ₹45L",
    buyingTimeline: "More than 6 months",
    customerMessage:
      "Checking rates for 2 BHK near Action Area 2 or 3. Need to discuss with family before making any plans. Send details over WhatsApp only.",
    priority: "COLD",
    createdAt: "2026-09-18T16:00:00Z",
    aiAnalysis: {
      summary:
        "Early-stage exploratory buyer with price sensitivity looking in New Town; requires family alignment and prefers text-only.",
      intent: "Exploratory / Budget housing",
      keyRequirements: [
        "2 BHK",
        "New Town Action Area 2/3",
        "Budget under ₹45L",
        "WhatsApp communication only",
      ],
      objections: [
        "Price sensitive",
        "Multiple family stakeholders involved in decision",
        "Does not want phone calls yet",
      ],
      recommendedNextAction:
        "Respect text-only preference. Send curated PDF brochure via WhatsApp and follow up after 2 weeks.",
      suggestedResponse:
        "Hello Ananya, here is a PDF brochure of verified 2BHK projects in Action Area 2 under ₹45L. Take your time reviewing it with your family, and feel free to text me anytime if you'd like more details.",
    },
  },
];
