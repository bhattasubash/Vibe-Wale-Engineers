# Prakriti Logic & Scoring Rubric

## Section 1: Background
Prakriti is the innate psycho-somatic constitution of an individual in Ayurveda, determined at the time of conception and generally remains unchanged throughout life. 
- **Three Doshas**: Vata (air+ether, governs movement), Pitta (fire+water, governs metabolism), and Kapha (earth+water, governs structure).
- **Constitution Types**: Every individual has a unique combination of these doshas. A person can be single-dosha dominant, dual-dosha dominant, or sama (balanced).
- **Assessment Basis**: The assessment is based on physical, physiological, and psychological traits detailed in classical texts like Charaka Samhita (Vimana Sthana, Chapter 8).
- **Purpose**: This scoring is NOT a diagnostic tool. It is a constitutional typing tool to provide essential context for clinical assessment.

## Section 2: The 15 Questions

```json
{
  "Question PK-01": {
    "text_en": "How would you describe your body build?",
    "text_hi": "आपके शरीर की बनावट कैसी है?",
    "options": [
      {
        "text_en": "Thin, lean frame; find it hard to gain weight",
        "text_hi": "पतला, दुबला शरीर; वजन बढ़ाना मुश्किल",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Medium, athletic build; moderate weight",
        "text_hi": "मध्यम, एथलेटिक बनावट; सामान्य वजन",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Large, sturdy frame; gain weight easily",
        "text_hi": "भारी, मजबूत शरीर; वजन आसानी से बढ़ता है",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Sharira (Body Frame & Build)"
  },
  "Question PK-02": {
    "text_en": "How does your weight tend to change?",
    "text_hi": "आपके वजन में बदलाव की प्रवृत्ति कैसी है?",
    "options": [
      {
        "text_en": "Difficulty gaining weight, always lean",
        "text_hi": "वजन बढ़ाने में कठिनाई, हमेशा दुबला",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Maintains steady weight easily",
        "text_hi": "आसानी से स्थिर वजन बनाए रखता है",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Gains weight quickly, hard to lose",
        "text_hi": "वजन जल्दी बढ़ता है, कम करना मुश्किल",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Body Weight Tendency"
  },
  "Question PK-03": {
    "text_en": "How would you describe your skin?",
    "text_hi": "आपकी त्वचा कैसी है?",
    "options": [
      {
        "text_en": "Dry, rough, tends to crack easily",
        "text_hi": "सूखी, खुरदरी, आसानी से फटने वाली",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Soft, warm, prone to acne or freckles",
        "text_hi": "मुलायम, गर्म, मुहांसे या झाइयां होने का खतरा",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Thick, oily, cool, and smooth",
        "text_hi": "मोटी, तैलीय, ठंडी और चिकनी",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Twak (Skin Type & Texture)"
  },
  "Question PK-04": {
    "text_en": "How would you describe your hair?",
    "text_hi": "आपके बाल कैसे हैं?",
    "options": [
      {
        "text_en": "Dry, frizzy, thin, and prone to split ends",
        "text_hi": "सूखे, घुंघराले, पतले, और दोमुंहे होने वाले",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Fine, straight, prone to early graying or thinning",
        "text_hi": "महीन, सीधे, जल्दी सफेद होने या झड़ने वाले",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Thick, lustrous, wavy, and oily",
        "text_hi": "घने, चमकदार, लहरदार, और तैलीय",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Kesha (Hair Type)"
  },
  "Question PK-05": {
    "text_en": "What is the general shape of your face?",
    "text_hi": "आपके चेहरे का सामान्य आकार कैसा है?",
    "options": [
      {
        "text_en": "Long, angular, with prominent bones",
        "text_hi": "लंबा, कोणीय, उभरी हुई हड्डियों के साथ",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Heart-shaped or pointed chin",
        "text_hi": "दिल के आकार का या नुकीली ठुड्डी",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Round, full, and soft features",
        "text_hi": "गोल, भरा हुआ और मुलायम विशेषताएं",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Mukha (Face Shape & Features)"
  },
  "Question PK-06": {
    "text_en": "How are your eyes?",
    "text_hi": "आपकी आँखें कैसी हैं?",
    "options": [
      {
        "text_en": "Small, dry, active, often look tired",
        "text_hi": "छोटी, सूखी, सक्रिय, अक्सर थकी हुई दिखती हैं",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Piercing, sharp, sensitive to light",
        "text_hi": "तेज, तीक्ष्ण, प्रकाश के प्रति संवेदनशील",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Large, calm, attractive with thick lashes",
        "text_hi": "बड़ी, शांत, घनी पलकों वाली आकर्षक",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Netra (Eye Characteristics)"
  },
  "Question PK-07": {
    "text_en": "How is your appetite?",
    "text_hi": "आपकी भूख कैसी है?",
    "options": [
      {
        "text_en": "Irregular, varies from day to day",
        "text_hi": "अनियमित, दिन-प्रतिदिन बदलती है",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Strong, cannot skip meals without feeling irritable",
        "text_hi": "तेज, खाना छोड़े तो चिड़चिड़ापन होता है",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Steady but slow, can easily skip meals",
        "text_hi": "स्थिर लेकिन धीमी, आसानी से खाना छोड़ सकते हैं",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Agni/Kshudha (Appetite Pattern)"
  },
  "Question PK-08": {
    "text_en": "How are your bowel movements?",
    "text_hi": "आपका पेट कैसे साफ होता है?",
    "options": [
      {
        "text_en": "Irregular, tendency towards constipation",
        "text_hi": "अनियमित, कब्ज की प्रवृत्ति",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Regular, quick, tendency towards loose stools",
        "text_hi": "नियमित, जल्दी, दस्त की प्रवृत्ति",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Regular, slow, heavy and well-formed",
        "text_hi": "नियमित, धीमा, भारी और अच्छी तरह से बना हुआ",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Koshtha/Mala (Digestion & Bowel Habit)"
  },
  "Question PK-09": {
    "text_en": "How often do you feel thirsty?",
    "text_hi": "आपको कितनी बार प्यास लगती है?",
    "options": [
      {
        "text_en": "Variable, sometimes sip water, sometimes forget",
        "text_hi": "बदलती हुई, कभी पानी पीते हैं, कभी भूल जाते हैं",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Frequent, need cold drinks often",
        "text_hi": "लगातार, अक्सर ठंडे पेय की आवश्यकता होती है",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Rarely thirsty, prefer warm drinks",
        "text_hi": "शायद ही कभी प्यास लगती है, गर्म पेय पसंद हैं",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Trishna (Thirst Pattern)"
  },
  "Question PK-10": {
    "text_en": "How is your sleep?",
    "text_hi": "आपकी नींद कैसी है?",
    "options": [
      {
        "text_en": "Light, interrupted, often wake up feeling tired",
        "text_hi": "हल्की, बीच में टूटने वाली, अक्सर थके हुए उठते हैं",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Moderate, sound, usually wake up alert",
        "text_hi": "मध्यम, गहरी, आमतौर पर सतर्क उठते हैं",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Deep, heavy, difficult to wake up",
        "text_hi": "गहरी, भारी, उठने में कठिनाई",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Nidra (Sleep Pattern)"
  },
  "Question PK-11": {
    "text_en": "What kind of dreams do you mostly have?",
    "text_hi": "आपको ज्यादातर कैसे सपने आते हैं?",
    "options": [
      {
        "text_en": "Flying, running, fearful, or very active",
        "text_hi": "उड़ने, दौड़ने, डरावने, या बहुत सक्रिय",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Action, anger, fire, or problem-solving",
        "text_hi": "कार्रवाई, क्रोध, आग, या समस्या-समाधान",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Water, clouds, slow-moving, or calm scenes",
        "text_hi": "पानी, बादल, धीमी गति वाले, या शांत दृश्य",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Swapna (Dream Tendency)"
  },
  "Question PK-12": {
    "text_en": "How is your memory and learning style?",
    "text_hi": "आपकी याददाश्त और सीखने की शैली कैसी है?",
    "options": [
      {
        "text_en": "Learn quickly, forget quickly",
        "text_hi": "जल्दी सीखते हैं, जल्दी भूल जाते हैं",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Sharp memory, learn well if interested",
        "text_hi": "तेज याददाश्त, रुचि हो तो अच्छी तरह सीखते हैं",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Learn slowly, but never forget",
        "text_hi": "धीरे सीखते हैं, लेकिन कभी नहीं भूलते",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Smriti (Memory & Learning Style)"
  },
  "Question PK-13": {
    "text_en": "What is your emotional temperament?",
    "text_hi": "आपका भावनात्मक स्वभाव कैसा है?",
    "options": [
      {
        "text_en": "Anxious, worry easily, enthusiastic",
        "text_hi": "चिंतित, जल्दी घबराने वाले, उत्साही",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Driven, easily angered, focused",
        "text_hi": "प्रेरित, जल्दी क्रोधित होने वाले, केंद्रित",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Calm, tolerant, loving, but sometimes stubborn",
        "text_hi": "शांत, सहनशील, प्यार करने वाले, लेकिन कभी-कभी जिद्दी",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Manasika Prakriti (Emotional Temperament)"
  },
  "Question PK-14": {
    "text_en": "How do you usually speak?",
    "text_hi": "आप आमतौर पर कैसे बोलते हैं?",
    "options": [
      {
        "text_en": "Fast, talkative, sometimes disjointed",
        "text_hi": "तेज, बातूनी, कभी-कभी असंबद्ध",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Clear, sharp, commanding",
        "text_hi": "स्पष्ट, तीक्ष्ण, आदेशात्मक",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Slow, melodious, thoughtful",
        "text_hi": "धीमा, मधुर, विचारशील",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Vak (Speech Pattern)"
  },
  "Question PK-15": {
    "text_en": "How is your physical activity level?",
    "text_hi": "आपका शारीरिक गतिविधि स्तर कैसा है?",
    "options": [
      {
        "text_en": "Very active, restless, always moving",
        "text_hi": "बहुत सक्रिय, बेचैन, हमेशा चलते रहने वाले",
        "points": { "vata": 1, "pitta": 0, "kapha": 0 }
      },
      {
        "text_en": "Moderate, purposeful movements",
        "text_hi": "मध्यम, उद्देश्यपूर्ण चाल",
        "points": { "vata": 0, "pitta": 1, "kapha": 0 }
      },
      {
        "text_en": "Slow, steady, prefer to sit",
        "text_hi": "धीमा, स्थिर, बैठना पसंद करते हैं",
        "points": { "vata": 0, "pitta": 0, "kapha": 1 }
      }
    ],
    "reference": "Cheshta (Physical Activity & Movement)"
  }
}
```

## Section 3: Scoring Algorithm

```python
def calculate_prakriti(answers: list[dict]) -> dict:
    scores = { 'vata': 0, 'pitta': 0, 'kapha': 0 }
    
    for answer in answers:
        scores[answer['dosha_tag']] += answer['points']
    
    total = sum(scores.values())  # Should be 15
    percentages = { k: round(v / total * 100) for k, v in scores.items() }
    
    # Determine dominant prakriti
    sorted_doshas = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    dominant = sorted_doshas[0][0]
    
    # Determine confidence
    gap = sorted_doshas[0][1] - sorted_doshas[1][1]
    if gap >= 5:
        confidence = 'high'     # Clear single-dosha dominance
    elif gap >= 3:
        confidence = 'medium'   # Probable dominance with secondary influence
    else:
        confidence = 'low'      # Dual-dosha or near-balanced (Sama Prakriti)
    
    # Determine secondary prakriti (if dual-dosha)
    secondary = None
    if gap < 3 and sorted_doshas[1][1] > sorted_doshas[2][1]:
        secondary = sorted_doshas[1][0]
    
    # Prakriti label
    if secondary:
        prakriti_label = f"{dominant.capitalize()}-{secondary.capitalize()}"
    else:
        prakriti_label = dominant.capitalize()
    
    return {
        'scores': scores,
        'percentages': percentages,
        'dominant_prakriti': prakriti_label,
        'secondary_prakriti': secondary,
        'confidence': confidence
    }
```

## Section 4: Confidence Interpretation Guide
- **High** (gap >= 5): Strong single-dosha dominance (e.g., Vata: 10, Pitta: 3, Kapha: 2). Display as 'Predominantly Vata'.
- **Medium** (gap 3-4): Dominant dosha with notable secondary (e.g., Pitta: 8, Kapha: 5, Vata: 2). Display as 'Pitta-Kapha'.
- **Low** (gap < 3): Near-balanced or tri-dosha. Requires physician clinical judgment. Display as 'Balanced / Requires Clinical Assessment'.

## Section 5: Remaining Dashavidha Pariksha Parameters

1. **Vikriti (Current Imbalance):**
   - EN: "Are you currently experiencing any specific health issues or imbalances?" (Free text)
   - HI: "क्या आप वर्तमान में किसी विशिष्ट स्वास्थ्य समस्या या असंतुलन का अनुभव कर रहे हैं?" (मुक्त पाठ)
2. **Sara (Tissue Quality):**
   - EN: "How would you describe your overall physical strength?" (Strong / Average / Weak)
   - HI: "आप अपनी समग्र शारीरिक शक्ति का वर्णन कैसे करेंगे?" (मजबूत / औसत / कमजोर)
3. **Samhanana (Body Compactness):**
   - EN: "How would you describe your bone and joint structure?" (Compact & Sturdy / Medium / Loose & Flexible)
   - HI: "आप अपनी हड्डी और जोड़ों की संरचना का वर्णन कैसे करेंगे?" (ठोस और मजबूत / मध्यम / ढीली और लचीली)
4. **Pramana (Body Proportions):**
   - EN: "How would you describe your height relative to your build?" (Tall & Thin / Medium & Proportionate / Short & Broad)
   - HI: "आप अपनी बनावट के सापेक्ष अपनी ऊंचाई का वर्णन कैसे करेंगे?" (लंबा और पतला / मध्यम और आनुपातिक / छोटा और चौड़ा)
5. **Satmya (Adaptability):**
   - EN: "How easily do you adapt to changes in food, weather, or routine?" (Very easily / Somewhat / With difficulty)
   - HI: "आप भोजन, मौसम या दिनचर्या में बदलाव के अनुकूल कितनी आसानी से ढल जाते हैं?" (बहुत आसानी से / कुछ हद तक / कठिनाई से)
6. **Satva (Mental Resilience):**
   - EN: "How do you handle stressful situations?" (Stay calm / Get anxious sometimes / Become very disturbed)
   - HI: "आप तनावपूर्ण स्थितियों को कैसे संभालते हैं?" (शांत रहते हैं / कभी-कभी चिंतित हो जाते हैं / बहुत परेशान हो जाते हैं)
7. **Ahara Shakti (Digestive Capacity):**
   - EN: "How would you describe your digestion?" (Strong, can eat anything / Moderate, sometimes issues / Weak, often have problems)
   - HI: "आप अपने पाचन का वर्णन कैसे करेंगे?" (मजबूत, कुछ भी खा सकते हैं / मध्यम, कभी-कभी समस्याएँ / कमजोर, अक्सर समस्याएँ होती हैं)
8. **Vyayama Shakti (Exercise Tolerance):**
   - EN: "How much physical activity can you handle comfortably?" (High endurance / Moderate / Low, tire easily)
   - HI: "आप आराम से कितनी शारीरिक गतिविधि कर सकते हैं?" (उच्च सहनशक्ति / मध्यम / कम, आसानी से थक जाते हैं)
9. **Vaya (Age Group):**
   - Captured from patient registration (Bala: 0-16, Madhyama: 17-60, Vriddha: 61+)

## Section 6: JSON Config Format

*(The structured JSON payload from Section 2 represents the exact schema for `client/src/config/prakriti-questions.json`)*

## Section 7: Red Flag Rules

```json
[
  {
    "id": "RF-01",
    "name": "Cardiac and Respiratory Alert",
    "trigger_keywords": ["chest pain", "angina", "shortness of breath", "difficulty breathing", "छाती में दर्द", "सीने में दर्द", "सांस लेने में तकलीफ", "दम फूलना"],
    "required_combination": "OR",
    "severity": "Critical",
    "alert_message_en": "Critical: Possible acute cardiac or respiratory emergency. Immediate medical attention required.",
    "alert_message_hi": "गंभीर: संभावित तीव्र हृदय या श्वसन आपातकाल। तत्काल चिकित्सा सहायता आवश्यक है।"
  },
  {
    "id": "RF-02",
    "name": "Neurological & Stroke Signs",
    "trigger_keywords": ["sudden severe headache", "facial drooping", "slurred speech", "loss of consciousness", "paralysis", "vision loss", "अचानक गंभीर सिरदर्द", "मुंह टेढ़ा होना", "बोलने में लड़खड़ाहट", "बेहोशी", "लकवा", "अंधापन"],
    "required_combination": "OR",
    "severity": "Critical",
    "alert_message_en": "Critical: Possible acute neurological event. Seek emergency medical care immediately.",
    "alert_message_hi": "गंभीर: संभावित तीव्र न्यूरोलॉजिकल घटना। तुरंत आपातकालीन चिकित्सा देखभाल लें।"
  },
  {
    "id": "RF-03",
    "name": "Meningitis & Sepsis Signs",
    "trigger_keywords": ["stiff neck", "high fever with confusion", "seizure", "fit", "गर्दन में अकड़न", "दौरा", "तेज बुखार के साथ बेहोशी"],
    "required_combination": "OR",
    "severity": "Critical",
    "alert_message_en": "Critical: Signs of severe infection or central nervous system distress. Urgent evaluation required.",
    "alert_message_hi": "गंभीर: गंभीर संक्रमण या तंत्रिका तंत्र संकट के संकेत। तत्काल मूल्यांकन आवश्यक है।"
  },
  {
    "id": "RF-04",
    "name": "Severe Internal Bleeding",
    "trigger_keywords": ["vomiting blood", "black tarry stools", "coughing blood", "खून की उल्टी", "खून का दस्त", "खांसी में खून"],
    "required_combination": "OR",
    "severity": "High",
    "alert_message_en": "High Alert: Potential active internal bleeding. Seek physician review right away.",
    "alert_message_hi": "उच्च चेतावनी: संभावित सक्रिय आंतरिक रक्तस्राव। तुरंत चिकित्सक से संपर्क करें।"
  },
  {
    "id": "RF-05",
    "name": "Self Harm Ideation",
    "trigger_keywords": ["suicide", "kill myself", "self-harm", "end my life", "आत्महत्या", "खुद को मारना", "खुद को नुकसान"],
    "required_combination": "OR",
    "severity": "Critical",
    "alert_message_en": "Critical: Patient expressing distress or thoughts of self-harm. Immediate clinical support alerted.",
    "alert_message_hi": "गंभीर: रोगी संकट या आत्म-नुकसान के विचार व्यक्त कर रहा है। तत्काल नैदानिक सहायता को सूचित किया गया।"
  }
]
```
