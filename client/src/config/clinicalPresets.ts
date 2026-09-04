/**
 * Standardized Clinical Prescription Presets for AYUSH & Allopathy Consultations.
 * Prevents hardcoded clinical text in view components and enables hospital admin configuration.
 */

export interface ClinicalPreset {
  id: string;
  label: string;
  insertionText: string;
  category: 'treatment' | 'diet' | 'followup' | 'investigation';
}

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: 'preset_janu_basti',
    label: '+ जानु बस्ति (Janu Basti)',
    insertionText: ' जानु बस्ति (Janu Basti) 7 दिन हेतु अनुशंसित।',
    category: 'treatment',
  },
  {
    id: 'preset_pathya',
    label: '+ पथ्य-अपथ्य निर्देश (Dietary Advice)',
    insertionText: ' पथ्य: वातवर्धक आहार (उड़द, गोभी, ठंडा पानी) का त्याग करें।',
    category: 'diet',
  },
  {
    id: 'preset_followup_15',
    label: '+ 15 दिन फॉलो-अप (Follow-up)',
    insertionText: ' 15 दिन पश्चात पुनर्परीक्षण (Follow-up after 15 days)।',
    category: 'followup',
  },
  {
    id: 'preset_rasayana',
    label: '+ रसायन चिकित्सा (Rasayana)',
    insertionText: ' च्यवनप्राश अवलेह 1 चम्मच प्रातःकाल दुग्ध के साथ।',
    category: 'treatment',
  },
];
