"""
HL7 FHIR R4 Serializer for ABDM & Hospital Information System (HIS) Integration.
Formats clinical intake sessions into official ABDM-compliant FHIR R4 Bundle resources.
Compatible with National Health Authority (NHA) M1, M2, and M3 standards.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid


def generate_fhir_r4_bundle(
    session_id: str,
    patient_data: Optional[Dict[str, Any]] = None,
    session_data: Optional[Dict[str, Any]] = None,
    socrates_data: Optional[Dict[str, Any]] = None,
    vitals_data: Optional[Dict[str, Any]] = None,
    prakriti_data: Optional[Dict[str, Any]] = None,
    ocr_reports: Optional[List[Dict[str, Any]]] = None,
    summary_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Serializes an AYUSH-Care OPD intake into a standard HL7 FHIR R4 Bundle (Document).
    Includes:
      - Bundle (Document type)
      - Composition (Clinical OPD Intake Header)
      - Patient (Demographics & ABHA ID)
      - Encounter (OPD Kiosk Consultation)
      - Condition (Chief Complaint & Diagnoses)
      - Observation (Prakriti Tridosha & Dashavidha Pariksha)
      - Observation (Vitals & Out-of-Range Lab Reports)
      - MedicationStatement (Prescribed / Spoken Medications)
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    bundle_id = f"bundle-{session_id}"
    patient_id = (patient_data or {}).get("id") or f"pat-{session_id[:8]}"
    encounter_id = f"enc-{session_id}"
    composition_id = f"comp-{session_id}"

    entries: List[Dict[str, Any]] = []

    # ──────────────────────────────────────────────────────────
    # 1. Patient Resource
    # ──────────────────────────────────────────────────────────
    patient_resource: Dict[str, Any] = {
        "resourceType": "Patient",
        "id": patient_id,
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
        },
        "identifier": [
            {
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                            "code": "MR",
                            "display": "Medical Record Number",
                        }
                    ]
                },
                "system": "https://aiia.gov.in/patient",
                "value": patient_id,
            }
        ],
        "name": [
            {
                "use": "official",
                "text": (patient_data or {}).get("full_name") or "Anonymous OPD Patient",
            }
        ],
        "gender": ((patient_data or {}).get("gender") or "unknown").lower(),
    }

    if patient_data and patient_data.get("age"):
        patient_resource["extension"] = [
            {
                "url": "https://nrces.in/ndhm/fhir/r4/StructureDefinition/Age",
                "valueQuantity": {
                    "value": int(patient_data["age"]),
                    "unit": "years",
                    "system": "http://unitsofmeasure.org",
                    "code": "a",
                },
            }
        ]

    if patient_data and patient_data.get("phone"):
        patient_resource["telecom"] = [
            {"system": "phone", "value": patient_data["phone"], "use": "mobile"}
        ]

    if patient_data and patient_data.get("abha_id"):
        patient_resource["identifier"].append({
            "type": {
                "coding": [
                    {
                        "system": "https://nrces.in/ndhm/fhir/r4/StructureDefinition/IdentifierType",
                        "code": "ABHA",
                        "display": "Ayushman Bharat Health Account",
                    }
                ]
            },
            "system": "https://healthid.ndhm.gov.in",
            "value": patient_data["abha_id"],
        })

    if patient_data and patient_data.get("abha_address"):
        patient_resource["identifier"].append({
            "system": "https://abdm.gov.in/abha-address",
            "value": patient_data["abha_address"],
        })

    entries.append({
        "fullUrl": f"urn:uuid:{patient_id}",
        "resource": patient_resource,
    })

    # ──────────────────────────────────────────────────────────
    # 2. Encounter Resource
    # ──────────────────────────────────────────────────────────
    encounter_resource: Dict[str, Any] = {
        "resourceType": "Encounter",
        "id": encounter_id,
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory",
        },
        "serviceType": {
            "coding": [
                {
                    "system": "https://aiia.gov.in/specialty",
                    "code": (session_data or {}).get("department") or "ayurveda",
                    "display": "All India Institute of Ayurveda - OPD Kiosk Intake",
                }
            ]
        },
        "subject": {"reference": f"urn:uuid:{patient_id}"},
        "period": {"start": (session_data or {}).get("created_at") or now_iso},
    }
    entries.append({
        "fullUrl": f"urn:uuid:{encounter_id}",
        "resource": encounter_resource,
    })

    section_entries: List[Dict[str, Any]] = []

    # ──────────────────────────────────────────────────────────
    # 3. Condition Resource (Chief Complaint & SOCRATES)
    # ──────────────────────────────────────────────────────────
    complaint_text = (session_data or {}).get("chief_complaint") or "General Health Evaluation"
    condition_id = f"cond-{session_id}"

    socrates_notes = []
    if socrates_data:
        for k, v in socrates_data.items():
            if v and k not in ("session_id", "id", "created_at"):
                socrates_notes.append(f"{k.capitalize()}: {v}")

    condition_resource: Dict[str, Any] = {
        "resourceType": "Condition",
        "id": condition_id,
        "clinicalStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": "active",
                    "display": "Active",
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code": "encounter-diagnosis",
                        "display": "Encounter Diagnosis",
                    }
                ]
            }
        ],
        "code": {
            "text": complaint_text,
            "coding": [
                {
                    "system": "https://aiia.gov.in/ayush-morbidity-codes",
                    "code": (session_data or {}).get("complaint_category") or "general",
                    "display": complaint_text,
                }
            ],
        },
        "subject": {"reference": f"urn:uuid:{patient_id}"},
        "encounter": {"reference": f"urn:uuid:{encounter_id}"},
        "recordedDate": now_iso,
    }
    if socrates_notes:
        condition_resource["note"] = [{"text": " | ".join(socrates_notes)}]

    entries.append({
        "fullUrl": f"urn:uuid:{condition_id}",
        "resource": condition_resource,
    })
    section_entries.append({
        "title": "Chief Complaint & SOCRATES Analysis",
        "entry": [{"reference": f"urn:uuid:{condition_id}"}],
    })

    # ──────────────────────────────────────────────────────────
    # 4. Observation Resource: Prakriti & Dashavidha Pariksha
    # ──────────────────────────────────────────────────────────
    if prakriti_data and (prakriti_data.get("dominant_prakriti") or prakriti_data.get("dominantPrakriti")):
        dom_prakriti = prakriti_data.get("dominant_prakriti") or prakriti_data.get("dominantPrakriti")
        vata = prakriti_data.get("vata_score") or prakriti_data.get("vataScore", 0)
        pitta = prakriti_data.get("pitta_score") or prakriti_data.get("pittaScore", 0)
        kapha = prakriti_data.get("kapha_score") or prakriti_data.get("kaphaScore", 0)
        confidence = prakriti_data.get("confidence") or "medium"
        obs_prakriti_id = f"obs-prakriti-{session_id}"

        prakriti_obs: Dict[str, Any] = {
            "resourceType": "Observation",
            "id": obs_prakriti_id,
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "exam",
                            "display": "Exam",
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "https://aiia.gov.in/ayush-pariksha",
                        "code": "PRAKRITI-DOSHA-VIMANA-8",
                        "display": "Charaka Samhita Vimana Sthana Deha-Prakriti Assessment",
                    }
                ],
                "text": f"Dominant Prakriti: {dom_prakriti} (Confidence: {confidence})",
            },
            "subject": {"reference": f"urn:uuid:{patient_id}"},
            "encounter": {"reference": f"urn:uuid:{encounter_id}"},
            "effectiveDateTime": now_iso,
            "component": [
                {
                    "code": {"text": "Vata Dosha Score"},
                    "valueQuantity": {"value": vata, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
                },
                {
                    "code": {"text": "Pitta Dosha Score"},
                    "valueQuantity": {"value": pitta, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
                },
                {
                    "code": {"text": "Kapha Dosha Score"},
                    "valueQuantity": {"value": kapha, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
                },
            ],
        }
        entries.append({
            "fullUrl": f"urn:uuid:{obs_prakriti_id}",
            "resource": prakriti_obs,
        })
        section_entries.append({
            "title": "Ayurvedic Constitution (Prakriti)",
            "entry": [{"reference": f"urn:uuid:{obs_prakriti_id}"}],
        })

    # ──────────────────────────────────────────────────────────
    # 5. Observation Resource: General Vitals / Medical History
    # ──────────────────────────────────────────────────────────
    if vitals_data:
        obs_vitals_id = f"obs-vitals-{session_id}"
        vitals_components = []
        if vitals_data.get("blood_pressure_history") or vitals_data.get("bloodPressureHistory"):
            vitals_components.append({
                "code": {"text": "Hypertension / BP History"},
                "valueString": str(vitals_data.get("blood_pressure_history") or vitals_data.get("bloodPressureHistory")),
            })
        if vitals_data.get("diabetes_status") or vitals_data.get("diabetesStatus"):
            vitals_components.append({
                "code": {"text": "Diabetes Mellitus Status"},
                "valueString": str(vitals_data.get("diabetes_status") or vitals_data.get("diabetesStatus")),
            })
        if vitals_data.get("known_allergies") or vitals_data.get("knownAllergies"):
            vitals_components.append({
                "code": {"text": "Allergies"},
                "valueString": str(vitals_data.get("known_allergies") or vitals_data.get("knownAllergies")),
            })
        if vitals_data.get("past_surgeries") or vitals_data.get("pastSurgeries"):
            vitals_components.append({
                "code": {"text": "Past Surgeries & Hospitalizations"},
                "valueString": str(vitals_data.get("past_surgeries") or vitals_data.get("pastSurgeries")),
            })

        if vitals_components:
            vitals_obs = {
                "resourceType": "Observation",
                "id": obs_vitals_id,
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "vital-signs",
                                "display": "Vital Signs",
                            }
                        ]
                    }
                ],
                "code": {"text": "General Clinical Intake & Chronic History"},
                "subject": {"reference": f"urn:uuid:{patient_id}"},
                "encounter": {"reference": f"urn:uuid:{encounter_id}"},
                "effectiveDateTime": now_iso,
                "component": vitals_components,
            }
            entries.append({
                "fullUrl": f"urn:uuid:{obs_vitals_id}",
                "resource": vitals_obs,
            })
            section_entries.append({
                "title": "General Vitals & Chronic History",
                "entry": [{"reference": f"urn:uuid:{obs_vitals_id}"}],
            })

    # ──────────────────────────────────────────────────────────
    # 6. MedicationStatement Resources (OCR Prescriptions & Voice)
    # ──────────────────────────────────────────────────────────
    med_entries = []
    if ocr_reports:
        for idx, report in enumerate(ocr_reports):
            meds = report.get("medications") or []
            for m_idx, m in enumerate(meds):
                med_id = f"med-{session_id}-{idx}-{m_idx}"
                drug_name = m.get("drugName") or m.get("drug_name") or "Unspecified Medication"
                dosage = m.get("dosage") or "As directed"
                freq = m.get("frequency") or ""
                med_res: Dict[str, Any] = {
                    "resourceType": "MedicationStatement",
                    "id": med_id,
                    "status": "active",
                    "medicationCodeableConcept": {"text": drug_name},
                    "subject": {"reference": f"urn:uuid:{patient_id}"},
                    "dosage": [{"text": f"{dosage} {freq}".strip()}],
                    "note": [{"text": f"Source: {report.get('report_type') or 'Prescription'} ({report.get('facility_name') or 'Hospital'})"}],
                }
                entries.append({
                    "fullUrl": f"urn:uuid:{med_id}",
                    "resource": med_res,
                })
                med_entries.append({"reference": f"urn:uuid:{med_id}"})

    if med_entries:
        section_entries.append({
            "title": "Previous Medications & Prescriptions",
            "entry": med_entries,
        })

    # ──────────────────────────────────────────────────────────
    # 7. Composition Header (Placed First in Bundle)
    # ──────────────────────────────────────────────────────────
    composition_resource: Dict[str, Any] = {
        "resourceType": "Composition",
        "id": composition_id,
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord"]
        },
        "status": "final",
        "type": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "371530004",
                    "display": "Clinical consultation report",
                }
            ],
            "text": "AYUSH-Care AIIA OPD Kiosk Intake Summary",
        },
        "subject": {"reference": f"urn:uuid:{patient_id}"},
        "encounter": {"reference": f"urn:uuid:{encounter_id}"},
        "date": now_iso,
        "author": [
            {
                "display": "AYUSH-Care AIIA OPD Terminal #01",
            }
        ],
        "title": "AIIA Digital OPD Kiosk Intake Record",
        "section": section_entries,
    }

    # Prepend Composition as first entry in standard FHIR Document Bundle
    all_entries = [
        {
            "fullUrl": f"urn:uuid:{composition_id}",
            "resource": composition_resource,
        }
    ] + entries

    bundle = {
        "resourceType": "Bundle",
        "id": bundle_id,
        "meta": {
            "versionId": "1",
            "lastUpdated": now_iso,
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
        },
        "identifier": {
            "system": "https://aiia.gov.in/fhir/bundles",
            "value": bundle_id,
        },
        "type": "document",
        "timestamp": now_iso,
        "total": len(all_entries),
        "entry": all_entries,
    }

    return bundle
