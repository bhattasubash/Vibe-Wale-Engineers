import sys
import os

# Add server directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.scoring import calculate_prakriti_scores
from app.services.red_flags import evaluate_red_flags


def test_extreme_single_dosha_dominance():
    """
    Test 15-0-0 distribution: All 15 answers are Vata.
    Gap = 15 >= 5 -> High confidence, Predominantly Vata.
    """
    answers = [{"dosha_tag": "vata", "points": 1} for _ in range(15)]
    result = calculate_prakriti_scores(answers)

    assert result.scores.vata == 15
    assert result.scores.pitta == 0
    assert result.scores.kapha == 0
    assert result.percentages["vata"] == 100
    assert result.confidence == "high"
    assert "Predominantly Vata" in result.dominant_prakriti
    assert result.secondary_prakriti is None


def test_dual_dosha_distribution():
    """
    Test 8-5-2 distribution: Pitta=8, Kapha=5, Vata=2.
    Gap = 8 - 5 = 3 in [3, 4] -> Medium confidence, Pitta-Kapha.
    """
    answers = (
        [{"dosha_tag": "pitta", "points": 1} for _ in range(8)]
        + [{"dosha_tag": "kapha", "points": 1} for _ in range(5)]
        + [{"dosha_tag": "vata", "points": 1} for _ in range(2)]
    )
    result = calculate_prakriti_scores(answers)

    assert result.scores.pitta == 8
    assert result.scores.kapha == 5
    assert result.scores.vata == 2
    assert result.confidence == "medium"
    assert "Pitta-Kapha" in result.dominant_prakriti
    assert result.secondary_prakriti == "kapha"


def test_balanced_sama_distribution():
    """
    Test 5-5-5 equal distribution: Vata=5, Pitta=5, Kapha=5.
    Gap = 0 < 3 -> Low confidence, Sama / Tri-Doshic.
    """
    answers = (
        [{"dosha_tag": "vata", "points": 1} for _ in range(5)]
        + [{"dosha_tag": "pitta", "points": 1} for _ in range(5)]
        + [{"dosha_tag": "kapha", "points": 1} for _ in range(5)]
    )
    result = calculate_prakriti_scores(answers)

    assert result.scores.vata == 5
    assert result.scores.pitta == 5
    assert result.scores.kapha == 5
    assert result.confidence == "low"
    assert "SAMA" in result.dominant_prakriti


def test_red_flag_critical_cardiac():
    """
    Test detection of acute chest pain emergency symptom.
    """
    text = "मुझे 2 घंटे से सीने में तेज दर्द और भारीपन हो रहा है"
    evaluation = evaluate_red_flags(text)

    assert evaluation.triggered is True
    assert evaluation.severity == "critical"
    assert evaluation.rule_id == "RF-001-CARDIAC"
    assert "Emergency" in evaluation.destination_room


def test_red_flag_non_emergency():
    """
    Test normal non-emergency symptom passes cleanly.
    """
    text = "पिछले 3 महीने से दोनों घुटनों में कट-कट की आवाज और हल्का दर्द है"
    evaluation = evaluate_red_flags(text)

    assert evaluation.triggered is False
    assert evaluation.severity is None
