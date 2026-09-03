"""
Medical Test Aliases and String Normalization Utilities.
Matches lab findings and Ayurvedic test names for cross-verification.
"""

import math
import re
from typing import Dict, List, Optional

MEDICAL_TEST_ALIASES: Dict[str, List[str]] = {
    "hemoglobin": ["hb", "hgb", "haemoglobin", "hemoglobin", "hgb."],
    "white blood cell": ["wbc", "white blood cells", "leukocytes", "tlc", "total leukocyte count", "wbc count"],
    "platelet count": ["platelets", "platelet", "plt", "platelet count", "thrombocytes", "total platelets"],
    "red blood cell": ["rbc", "red blood cells", "erythrocytes", "total rbc", "rbc count"],
    "hematocrit": ["hematocrit", "hct", "pcv", "packed cell volume"],
    "fasting blood sugar": ["fbs", "fasting blood sugar", "fasting glucose", "glucose fasting", "fpg"],
    "postprandial blood sugar": ["ppbs", "postprandial blood sugar", "pp glucose", "post prandial glucose"],
    "random blood sugar": ["rbs", "random blood sugar", "blood glucose", "glucose", "plasma glucose"],
    "hba1c": ["hba1c", "glycated hemoglobin", "hemoglobin a1c", "glycosylated hemoglobin", "a1c"],
    "creatinine": ["serum creatinine", "creatinine", "creat", "s. creatinine", "sr creatinine"],
    "blood urea nitrogen": ["bun", "blood urea nitrogen", "urea", "blood urea"],
    "uric acid": ["uric acid", "serum uric acid", "s. uric acid"],
    "total cholesterol": ["total cholesterol", "cholesterol", "tc", "s. cholesterol"],
    "hdl cholesterol": ["hdl", "hdl cholesterol", "high density lipoprotein", "hdl-c"],
    "ldl cholesterol": ["ldl", "ldl cholesterol", "low density lipoprotein", "ldl-c"],
    "triglycerides": ["triglycerides", "triglyceride", "tg", "s. triglycerides"],
    "total bilirubin": ["total bilirubin", "bilirubin total", "t. bilirubin", "s. bilirubin total"],
    "sgot": ["sgot", "ast", "aspartate aminotransferase", "aspartate transaminase"],
    "sgpt": ["sgpt", "alt", "alanine aminotransferase", "alanine transaminase"],
    "alkaline phosphatase": ["alkaline phosphatase", "alp", "alk phos"],
    "thyroid stimulating hormone": ["tsh", "thyroid stimulating hormone", "s. tsh", "ultra tsh"],
    "blood pressure": ["bp", "blood pressure", "b.p.", "nibp"],
    "erythrocyte sedimentation rate": ["esr", "erythrocyte sedimentation rate"],
}


def get_aliases_for_test(test_name: str) -> List[str]:
    """Returns a list of matching search keywords/aliases for a given medical test name."""
    test_clean = test_name.strip().lower()
    aliases = {test_clean}

    for key, alias_list in MEDICAL_TEST_ALIASES.items():
        if key in test_clean or any(alias in test_clean for alias in alias_list):
            aliases.add(key)
            aliases.update(alias_list)

    return sorted(list(aliases), key=len, reverse=True)


def normalize_numeric_string(val: Optional[str]) -> Optional[str]:
    """
    Normalizes numeric strings for medical value comparison.
    Handles ratios, percentages, and decimals.
    """
    if not val:
        return None
    val = str(val).strip().lower()

    # If it's a ratio like blood pressure (120/80)
    ratio_match = re.match(r"^(\d+)\s*/\s*(\d+)$", val)
    if ratio_match:
        return f"{ratio_match.group(1)}/{ratio_match.group(2)}"

    # If it's a percentage (e.g. 12.5% or 12%)
    pct_match = re.match(r"^([-+]?\d[\d,]*\.?\d*)\s*%$", val)
    if pct_match:
        num_part = pct_match.group(1).replace(",", "")
        try:
            f = float(num_part)
            return f"{f:g}%"
        except ValueError:
            return f"{num_part}%"

    # Clean standard number
    cleaned = val.replace(",", "")
    match = re.search(r"[-+]?\d*\.?\d+", cleaned)
    if match:
        num_str = match.group(0)
        try:
            f = float(num_str)
            return f"{f:g}"
        except ValueError:
            return num_str

    return val


def are_values_consistent(val1: str, val2: str) -> bool:
    """
    Determines if two values extracted from the document are consistent.
    Prioritizes strict medical numeric consistency.
    """
    if not val1 or not val2:
        return False

    v1_norm = normalize_numeric_string(val1)
    v2_norm = normalize_numeric_string(val2)

    if not v1_norm or not v2_norm:
        return False

    if v1_norm == v2_norm:
        return True

    # Check floating point equivalence with small tolerance
    try:
        f1 = float(v1_norm.rstrip("%"))
        f2 = float(v2_norm.rstrip("%"))
        return abs(f1 - f2) < 1e-4
    except ValueError:
        pass

    return False
