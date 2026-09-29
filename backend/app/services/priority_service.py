import re
from typing import Tuple


def calculate_lead_priority(
    buying_timeline: str,
    budget: str,
    property_requirement: str,
    customer_message: str,
) -> Tuple[str, str]:
    """Calculate an explainable lead priority (HOT, WARM, COLD) and explanation.

    Scoring is based on transparent weighted signals:
    1. Timeline Urgency (max 40 pts)
    2. Budget Specificity (max 25 pts)
    3. Requirement Definition (max 15 pts)
    4. Actionable Intent in Message (max 20 pts)
    Total: 0 - 100 points
      HOT:  >= 70 pts
      WARM: 40 - 69 pts
      COLD: < 40 pts
    """
    score = 0
    reasons = []

    # 1. Timeline Urgency (0 - 40 pts)
    tl = (buying_timeline or "").lower()
    if any(k in tl for k in ["immediate", "ready to move", "1 month", "urgent", "right away"]):
        score += 40
        reasons.append("immediate timeline (< 1 month)")
    elif any(k in tl for k in ["2 month", "3 month", "2-3", "2–3", "quarter"]):
        score += 25
        reasons.append("near-term purchase horizon (2–3 months)")
    elif any(k in tl for k in ["4 month", "6 month", "mid next year", "under construction"]):
        score += 15
        reasons.append("mid-term horizon (4–6 months)")
    else:
        score += 5
        reasons.append("long-term / exploratory timeline (> 6 months)")

    # 2. Budget Specificity (0 - 25 pts)
    bg = (budget or "").lower()
    has_currency_symbols = any(s in bg for s in ["₹", "cr", "lakh", "l", "k", "$"])
    has_numbers = bool(re.search(r"\d", bg))
    if has_currency_symbols and has_numbers:
        score += 25
        reasons.append("clearly defined budget bracket")
    elif has_numbers:
        score += 15
        reasons.append("budget indicated")
    else:
        score += 5
        reasons.append("unspecified budget")

    # 3. Requirement Definition (0 - 15 pts)
    req = (property_requirement or "").lower()
    if any(k in req for k in ["bhk", "villa", "penthouse", "plot", "sqft", "office", "retail"]):
        score += 15
        reasons.append("specific unit configuration specified")
    else:
        score += 8

    # 4. Inbound Message Intent & Actionability (0 - 20 pts)
    msg = (customer_message or "").lower()
    high_intent_keywords = [
        "visit", "weekend", "saturday", "sunday", "ready to move", "call me",
        "book", "token", "cheque", "register", "immediate", "cash"
    ]
    hesitation_keywords = [
        "just exploring", "not in a rush", "checking rates", "later", "only text", "family will decide"
    ]

    matched_intent = [k for k in high_intent_keywords if k in msg]
    matched_hesitation = [k for k in hesitation_keywords if k in msg]

    if matched_intent and not matched_hesitation:
        score += 20
        reasons.append(f"high engagement signal ('{matched_intent[0]}')")
    elif matched_intent and matched_hesitation:
        score += 10
        reasons.append("active interest with pending alignment")
    elif matched_hesitation:
        score += 0
        reasons.append("exploratory browsing without near-term commitment")
    else:
        score += 10
        reasons.append("standard inquiry")

    # Final Classification
    if score >= 70:
        priority = "HOT"
    elif score >= 40:
        priority = "WARM"
    else:
        priority = "COLD"

    reason_summary = f"{priority} ({score}/100 pts) based on " + ", ".join(reasons[:3]) + "."
    return priority, reason_summary
