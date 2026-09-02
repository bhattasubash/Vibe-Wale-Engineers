"""
High-performance rule-based emergency red-flag interceptor for AYUSH OPD triage.
Evaluates chief complaints and clinical responses in <1ms.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RedFlagRule(BaseModel):
    rule_id: str
    name: str
    severity: str  # 'critical' | 'high'
    trigger_keywords: List[str]
    alert_message_hi: str
    alert_message_en: str
    destination_room: str


RED_FLAG_RULES: List[RedFlagRule] = [
    RedFlagRule(
        rule_id="RF-001-CARDIAC",
        name="Acute Coronary Syndrome / Chest Pain",
        severity="critical",
        trigger_keywords=[
            "सीने में दर्द",
            "chest pain",
            "सीने में भारीपन",
            "छाती में दर्द",
            "left arm pain",
            "हार्ट",
            "heart pain",
            "घबराहट के साथ पसीना",
        ],
        alert_message_hi="सीने में तेज दर्द या भारीपन के लक्षण। तुरंत आपातकालीन कक्ष में जाएं।",
        alert_message_en="Severe chest discomfort detected. Immediate emergency triage required.",
        destination_room="Room E-01 (Emergency Care Unit)",
    ),
    RedFlagRule(
        rule_id="RF-002-STROKE",
        name="Acute Neurological Deficit / Stroke Warning",
        severity="critical",
        trigger_keywords=[
            "अचानक चेहरे का टेढ़ापन",
            "stroke",
            "लकवा",
            "paralysis",
            "बोलने में कठिनाई",
            "slurred speech",
            "हाथ पैर सुन्न",
            "बेहोशी",
            "loss of consciousness",
        ],
        alert_message_hi="अचानक कमजोरी या लकवे के लक्षण। तत्काल न्यूरोलॉजी इमरजेंसी सहायता आवश्यक।",
        alert_message_en="Acute neurological symptoms detected. Immediate emergency response required.",
        destination_room="Room E-02 (Neuro Triage)",
    ),
    RedFlagRule(
        rule_id="RF-003-RESPIRATORY",
        name="Severe Respiratory Distress",
        severity="critical",
        trigger_keywords=[
            "सांस फूलना",
            "shortness of breath",
            "सांस नहीं आ रही",
            "दम घुटना",
            "severe asthma",
            "oxygen",
            "सांस में घरघराहट",
        ],
        alert_message_hi="सांस लेने में अत्यधिक कठिनाई। तुरंत ऑक्सीजन सहायता कक्ष में जाएं।",
        alert_message_en="Severe shortness of breath. Immediate respiratory support required.",
        destination_room="Room E-01 (Emergency Respiratory Bay)",
    ),
    RedFlagRule(
        rule_id="RF-004-GI-BLEED",
        name="Gastrointestinal Bleeding / Hemoptysis",
        severity="high",
        trigger_keywords=[
            "उल्टी में खून",
            "blood in vomit",
            "खांसी में खून",
            "blood in cough",
            "काला मल",
            "black stool",
            "hemoptysis",
        ],
        alert_message_hi="रक्तस्राव के गंभीर लक्षण। विशेषज्ञ चिकित्सक द्वारा तत्काल परीक्षण आवश्यक।",
        alert_message_en="Internal bleeding signs detected. Priority clinical assessment required.",
        destination_room="Room 102 (Acute Care OPD)",
    ),
]


class RedFlagEvaluation(BaseModel):
    triggered: bool
    severity: Optional[str] = None
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    alert_message_hi: Optional[str] = None
    alert_message_en: Optional[str] = None
    destination_room: Optional[str] = None
    matched_keyword: Optional[str] = None


def evaluate_red_flags(text: str) -> RedFlagEvaluation:
    """
    Scans patient input string against critical emergency rules.
    """
    if not text or not text.strip():
        return RedFlagEvaluation(triggered=False)

    text_lower = text.lower()

    for rule in RED_FLAG_RULES:
        for keyword in rule.trigger_keywords:
            if keyword in text_lower:
                return RedFlagEvaluation(
                    triggered=True,
                    severity=rule.severity,
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    alert_message_hi=rule.alert_message_hi,
                    alert_message_en=rule.alert_message_en,
                    destination_room=rule.destination_room,
                    matched_keyword=keyword,
                )

    return RedFlagEvaluation(triggered=False)
