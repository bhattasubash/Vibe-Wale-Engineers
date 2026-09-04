# AYUSH-Care Adaptive Socratic Question Sets

This directory contains standardized bilingual (Hindi / English) clinical question sets mapped to classical Ayurvedic syndromic presentations and ICD-11 / NAMASTE categories.

## Included Question Sets
1. `joint_pain.json`: Musculoskeletal disorders & Sandhivata (गठिया, संधिवात, कमर दर्द, घुटने का दर्द).
2. `digestive_acidity.json`: Gastrointestinal disorders & Amlapitta (एसिडिटी, गैस, खट्टी डकार, पेट में जलन).
3. `respiratory_cough.json`: Respiratory disorders & Kasa-Shwasa (खांसी, बलगम, सांस फूलना, दमा).
4. `skin_dermatology.json`: Dermatology & Twak Rog (त्वचा में खुजली, दाद, एक्जिमा, पित्ती).

## Architecture & Extensibility
- Each JSON file defines an `id`, `title`, `titleHindi`, `description`, `keywords` (English + Hindi), and an array of `questions`.
- Every question includes `id`, `key`, `category`, `titleHindi`, `titleEnglish`, and 3-4 touch `options` with `{ hindi, english, value }`.
- When a patient speaks or types a complaint, `ComplaintInferenceService` analyzes the text and matches it to a registered question set.
- To add a new disease domain (e.g., `diabetes_prameha.json`), simply drop a valid JSON file into this folder. It is automatically discovered dynamically without code changes.
