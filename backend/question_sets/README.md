# Clinical Question Sets Directory (`backend/question_sets/`)

This directory houses modular clinical question sets in JSON format. The AYUSH-Care backend dynamically scans and loads all `.json` files placed in this folder at runtime.

When a patient speaks or types their chief complaint, **Gemini AI** analyzes the complaint and checks if it matches any question set in this directory:
- **If matched**: Gemini selects the matching question set and pushes these specific questions to the kiosk frontend.
- **If no match is found**: Gemini automatically generates targeted general health questions (onset, duration, severity, past history) to collect the necessary clinical information.

---

## Question Set JSON Format

Each file should be a valid JSON object matching the following structure:

```json
{
  "id": "unique_question_set_id",
  "title": "Display Title (English)",
  "titleHindi": "शीर्षक (हिंदी)",
  "description": "Clinical description of what symptoms or conditions this question set covers.",
  "keywords": [
    "knee pain",
    "joint pain",
    "कमर दर्द",
    "संधिवात"
  ],
  "questions": [
    {
      "id": "q_01",
      "key": "site",
      "category": "स्थान (Location)",
      "titleHindi": "यह दर्द या समस्या शरीर के किस हिस्से में सबसे ज्यादा महसूस होती है?",
      "titleEnglish": "Where exactly is this trouble located in your body?",
      "options": [
        {
          "hindi": "दोनों घुटने / पैर",
          "english": "Both Knees / Legs",
          "value": "bilateral_knees"
        },
        {
          "hindi": "कमर / रीढ़ की हड्डी",
          "english": "Lower Back / Spine",
          "value": "lower_back"
        }
      ]
    }
  ]
}
```

### Fields Explanation:
- `id`: A unique string identifier for the set (e.g., `joint_pain`, `digestive_acidity`).
- `title`: Primary name displayed on the kiosk screen.
- `titleHindi`: Bilingual Hindi title.
- `description`: A thorough description of the symptoms, conditions, and diagnoses. Gemini reads this description to match complaints accurately.
- `keywords`: Common keywords and phrases in English, Hindi, and Ayush terminology.
- `questions`: Array of questions.
  - `id`: Unique question identifier.
  - `key`: Clinical property key (e.g. `site`, `onset`, `severity`, `triggers`, `familyHistory`).
  - `category`: Category label (e.g. `स्थान (Site & Location)`).
  - `titleHindi`: Hindi question prompt.
  - `titleEnglish`: English question prompt.
  - `options`: Array of touch options with `hindi`, `english`, and `value`.
