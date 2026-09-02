export interface PrakritiOption {
  textHindi: string;
  textEnglish: string;
  dosha: 'vata' | 'pitta' | 'kapha';
  points: number;
}

export interface PrakritiQuestion {
  id: string;
  categoryHindi: string;
  categoryEnglish: string;
  sanskritParam: string;
  questionHindi: string;
  questionEnglish: string;
  options: [PrakritiOption, PrakritiOption, PrakritiOption];
}

export const PRAKRITI_15_QUESTIONS: PrakritiQuestion[] = [
  {
    id: 'PK-01',
    categoryHindi: 'शारीरिक बनावट (Body Build)',
    categoryEnglish: 'Body Build & Structure',
    sanskritParam: 'Sharira Pramana',
    questionHindi: 'आपके शरीर की बनावट और वजन बढ़ने की प्रवृत्ति कैसी है?',
    questionEnglish: 'How would you describe your physical frame and weight tendency?',
    options: [
      {
        textHindi: 'पतला, दुबला शरीर; वजन बढ़ाना बहुत मुश्किल होता है',
        textEnglish: 'Thin, slender frame; find it very hard to gain weight',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम, गठीला शरीर; वजन सामान्य और संतुलित रहता है',
        textEnglish: 'Medium, athletic build; maintain balanced weight easily',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'चौड़ा, मजबूत भारी शरीर; वजन बहुत आसानी से बढ़ जाता है',
        textEnglish: 'Broad, heavy, sturdy frame; tend to gain weight easily',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-02',
    categoryHindi: 'त्वचा का प्रकार (Skin Texture)',
    categoryEnglish: 'Skin Texture & Moisture',
    sanskritParam: 'Twak Guna',
    questionHindi: 'आपकी त्वचा (Skin) सामान्यतः कैसी रहती है?',
    questionEnglish: 'How is the natural texture and moisture of your skin?',
    options: [
      {
        textHindi: 'रूखी, खुरदरी, फटने वाली और ठंडी त्वचा',
        textEnglish: 'Dry, rough, prone to cracking, feels cool to touch',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मुलायम, गर्म, तैलीय; जल्दी लाल चकत्ते या मुंहासे होना',
        textEnglish: 'Soft, warm, oily; prone to redness, moles, or acne',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'चिकनी, चमकदार, मोटी, नमीयुक्त और ठंडी त्वचा',
        textEnglish: 'Smooth, lustrous, thick, well-hydrated and glowing',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-03',
    categoryHindi: 'बालों का स्वभाव (Hair Quality)',
    categoryEnglish: 'Hair Nature & Quality',
    sanskritParam: 'Kesha Prakriti',
    questionHindi: 'आपके सिर के बाल प्राकृतिक रूप से कैसे हैं?',
    questionEnglish: 'What are the natural characteristics of your hair?',
    options: [
      {
        textHindi: 'सूखे, पतले, दोमुंहे, घुंघराले या उलझने वाले',
        textEnglish: 'Dry, thin, frizzy, brittle with split ends',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मुलायम, पतले, भूरे या समय से पहले सफेद/झड़ने वाले',
        textEnglish: 'Soft, fine, early graying or premature thinning/balding',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'घने, मोटे, काले, चिकने, चमकदार और मजबूत बाल',
        textEnglish: 'Thick, dense, dark, glossy, wavy, very strong roots',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-04',
    categoryHindi: 'भूख और खान-पान (Appetite & Hunger)',
    categoryEnglish: 'Appetite Pattern',
    sanskritParam: 'Agni / Kshudha',
    questionHindi: 'आपको भूख किस प्रकार लगती है?',
    questionEnglish: 'How is your regular appetite and hunger pattern?',
    options: [
      {
        textHindi: 'अनियमित; कभी बहुत तेज भूख लगती है तो कभी खाने की इच्छा नहीं होती',
        textEnglish: 'Irregular; sometimes famished, sometimes skip meals easily',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'बहुत तेज भूख; समय पर खाना न मिलने पर चिड़चिड़ापन या सिरदर्द होना',
        textEnglish: 'Sharp, intense hunger; irritable or dizzy if meals are delayed',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमी लेकिन स्थिर भूख; भोजन देर से मिले तो भी परेशानी नहीं होती',
        textEnglish: 'Slow, steady appetite; can comfortably postpone meals without distress',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-05',
    categoryHindi: 'पाचन एवं पेट की स्थिति (Digestion & Bowel)',
    categoryEnglish: 'Digestion & Bowel Habits',
    sanskritParam: 'Koshtha / Mala',
    questionHindi: 'आपका पाचन और पेट साफ होने की आदत कैसी है?',
    questionEnglish: 'How would you describe your digestion and bowel movements?',
    options: [
      {
        textHindi: 'कब्ज (Constipation), गैस और पेट में भारीपन की शिकायत अक्सर रहती है',
        textEnglish: 'Prone to constipation, gas, bloating and hard irregular stools',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'तेज पाचन; दिन में 2-3 बार शौच जाना या जलन/ढीला मल होना',
        textEnglish: 'Fast digestion, soft/loose stools, tendency for acidity or burning',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमा पाचन लेकिन नियमित; मल भारी और सामान्य बंधा हुआ होता है',
        textEnglish: 'Slow but regular digestion, well-formed and consistent stools',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-06',
    categoryHindi: 'प्यास और पानी पीने की आदत (Thirst & Water)',
    categoryEnglish: 'Thirst Level',
    sanskritParam: 'Trishna',
    questionHindi: 'आपको प्यास सामान्यतः कितनी लगती है?',
    questionEnglish: 'What is your normal pattern of thirst and fluid intake?',
    options: [
      {
        textHindi: 'परिवर्तनशील; कभी बहुत कम तो कभी अचानक ज्यादा प्यास लगना',
        textEnglish: 'Variable; sometimes forget to drink water, sometimes dry throat',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'बहुत अधिक प्यास; हमेशा ठंडा पानी पीने की तीव्र इच्छा होना',
        textEnglish: 'Excessive thirst; strong craving for cool or chilled drinks',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'कम प्यास; दिनभर में बहुत कम पानी की आवश्यकता महसूस होना',
        textEnglish: 'Low/moderate thirst; comfortable with minimal fluid intake',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-07',
    categoryHindi: 'मौसम और तापमान सहनशीलता (Weather Tolerance)',
    categoryEnglish: 'Weather & Climate Preference',
    sanskritParam: 'Satmya Guna',
    questionHindi: 'आप कौन सा मौसम सबसे कम सहन कर पाते हैं?',
    questionEnglish: 'Which weather or climate is most uncomfortable for you?',
    options: [
      {
        textHindi: 'ठंड और सूखी हवा बिल्कुल सहन नहीं होती; गर्म मौसम पसंद है',
        textEnglish: 'Intolerant to cold, dry or windy weather; love warm warmth',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'गर्मी और तेज धूप बिल्कुल सहन नहीं होती; पसीना बहुत आता है',
        textEnglish: 'Intolerant to heat, sun, and summer; sweat profusely',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'गीला, बादल वाला या उमस भरा ठंडा मौसम सहन नहीं होता',
        textEnglish: 'Intolerant to damp, rainy, cold and humid weather',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-08',
    categoryHindi: 'नींद की गुणवत्ता (Sleep Quality)',
    categoryEnglish: 'Sleep Pattern & Depth',
    sanskritParam: 'Nidra Guna',
    questionHindi: 'आपकी नींद का स्वभाव कैसा रहता है?',
    questionEnglish: 'How would you describe your natural sleep quality and depth?',
    options: [
      {
        textHindi: 'हल्की नींद, बार-बार टूटने वाली या करवटें बदलने वाली (4-6 घंटे)',
        textEnglish: 'Light, interrupted sleep, easily awakened by small noises (4-6 hrs)',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम लेकिन गहरी नींद; कभी-कभी रात में प्यास या गर्मी से जागना (6-7 घंटे)',
        textEnglish: 'Moderate sound sleep; occasionally wake up feeling hot or thirsty (6-7 hrs)',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'गहरी, भारी और लंबी नींद; सुबह उठने में भारीपन या आलस्य लगना (8+ घंटे)',
        textEnglish: 'Deep, heavy, uninterrupted sleep; difficult to wake up early (8+ hrs)',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-09',
    categoryHindi: 'सपने (Dream Tendencies)',
    categoryEnglish: 'Dream Characteristics',
    sanskritParam: 'Swapna Darshana',
    questionHindi: 'आपको सपने ज्यादातर किस प्रकार के आते हैं?',
    questionEnglish: 'What kind of themes dominate your dreams?',
    options: [
      {
        textHindi: 'उड़ने वाले, दौड़ने, गिरने, भयभीत होने या बेचैनी वाले सपने',
        textEnglish: 'Flying, running, falling, danger, high places or wind',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'आग, धूप, लड़ाई, चमकती रोशनी या वाद-विवाद वाले सपने',
        textEnglish: 'Fire, bright lights, conflicts, sun, blood, passion or ambition',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'नदी, तालाब, शांत बाग-बगीचे, बारिश या बादलों वाले सपने',
        textEnglish: 'Lakes, oceans, swimming, romantic, serene gardens, snow or clouds',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-10',
    categoryHindi: 'याददाश्त और सीखने का तरीका (Memory & Learning)',
    categoryEnglish: 'Memory & Retention',
    sanskritParam: 'Smriti / Medha',
    questionHindi: 'आपकी याददाश्त और नई चीजें सीखने का ढंग कैसा है?',
    questionEnglish: 'How is your memory and learning style?',
    options: [
      {
        textHindi: 'जल्दी सीख जाते हैं लेकिन बहुत जल्दी भूल भी जाते हैं',
        textEnglish: 'Quick to grasp new ideas, but forget very quickly',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'स्पष्ट और तार्किक ढंग से सीखते हैं; लंबे समय तक याद रहता है',
        textEnglish: 'Sharp, analytical learning; good long-term precision memory',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'सीखने में समय लगता है लेकिन एक बार याद होने पर जीवनभर नहीं भूलते',
        textEnglish: 'Slow to learn initially, but once learned, retain permanently for life',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-11',
    categoryHindi: 'क्रोध और भावनाएं (Emotional Response & Temper)',
    categoryEnglish: 'Emotional Temperament',
    sanskritParam: 'Manasika Prakriti',
    questionHindi: 'तनाव या गुस्से की स्थिति में आपका व्यवहार कैसा होता है?',
    questionEnglish: 'How do you react to emotional stress or provocation?',
    options: [
      {
        textHindi: 'जल्दी घबरा जाना, चिंता (Anxiety) होना या डर लगना',
        textEnglish: 'Quick to become anxious, nervous, worried or fearful',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'जल्दी गुस्सा आना, अधीर होना या तर्क-वितर्क करना',
        textEnglish: 'Quick to anger, impatient, irritable, sharp and critical',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'शांत, धैर्यवान; गुस्सा बहुत कम आता है, बातों को दिल में दबाए रखना',
        textEnglish: 'Calm, patient, forgiving; very slow to anger, peaceful',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-12',
    categoryHindi: 'बोलने की गति (Speech Pattern)',
    categoryEnglish: 'Speech & Communication Pace',
    sanskritParam: 'Vak Pravritti',
    questionHindi: 'आपकी बातचीत करने की गति और आवाज़ कैसी है?',
    questionEnglish: 'What is your natural pace of speech and voice tone?',
    options: [
      {
        textHindi: 'तेज गति से बोलना, कभी-कभी बोलते समय शब्द अटकना या बहुत बातें करना',
        textEnglish: 'Fast-paced, talkative, rapid speech, sometimes skipping words',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'स्पष्ट, सटीक, जोरदार और आत्मविश्वास से भरी आवाज़',
        textEnglish: 'Clear, sharp, authoritative, articulate and persuasive tone',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमी, शांत, मधुर, गंभीर और कम शब्दों में बात करना',
        textEnglish: 'Slow, melodious, resonant, calm and economical with words',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-13',
    categoryHindi: 'चलने की गति एवं शारीरिक फुर्ती (Physical Movement)',
    categoryEnglish: 'Physical Activity & Gait',
    sanskritParam: 'Cheshta / Gati',
    questionHindi: 'आपके चलने-फिरने और काम करने की गति कैसी है?',
    questionEnglish: 'How is your typical walking speed and bodily agility?',
    options: [
      {
        textHindi: 'तेज चाल, चंचल, हमेशा जल्दी में रहना, शरीर के जोड़ों में कटकट आवाज़ होना',
        textEnglish: 'Quick restless walking, agile, always in a hurry, cracking joints',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम, उद्देश्यपूर्ण, संतुलित और ऊर्जावान चाल',
        textEnglish: 'Moderate, purposeful, determined and confident stride',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमी, स्थिर, भारी और स्थिर गति से चलना',
        textEnglish: 'Slow, graceful, steady, deliberate and unhurried movement',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-14',
    categoryHindi: 'आंखों की विशेषताएं (Eye Characteristics)',
    categoryEnglish: 'Eye Appearance',
    sanskritParam: 'Netra Rupa',
    questionHindi: 'आपकी आंखों का आकार और स्वभाव कैसा है?',
    questionEnglish: 'How would you describe the natural appearance of your eyes?',
    options: [
      {
        textHindi: 'छोटी, सूखी, चंचल और पलकें जल्दी-जल्दी झपकाने वाली',
        textEnglish: 'Small, dry, blinking frequently, restless gaze',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम, चमकदार, तेज निगाह वाली; जल्दी लाल होने की प्रवृत्ति',
        textEnglish: 'Medium, sharp penetrating gaze, sensitive to light, prone to redness',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'बड़ी, सुंदर, सफेद भाग साफ व चमकदार, घनी पलकों वाली',
        textEnglish: 'Large, wide, calm, deep-set, white sclera, thick eyelashes',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-15',
    categoryHindi: 'शारीरिक सहनशक्ति (Physical Endurance)',
    categoryEnglish: 'Stamina & Energy Level',
    sanskritParam: 'Bala / Vyayama Shakti',
    questionHindi: 'आपकी शारीरिक ताकत और सहनशक्ति (Stamina) कैसी रहती है?',
    questionEnglish: 'How is your physical strength and stamina during work or exercise?',
    options: [
      {
        textHindi: 'जल्दी थक जाना; ऊर्जा में बार-बार उतार-चढ़ाव आना',
        textEnglish: 'Tire quickly; energy levels fluctuate in short bursts with fatigue',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम ताकत; काम पूरा करने का दृढ़ संकल्प लेकिन अधिक श्रम से गर्मी लगना',
        textEnglish: 'Moderate stamina; strong drive to finish tasks, easily overheated',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'उत्कृष्ट ताकत; बिना थके लंबे समय तक लगातार मेहनत कर पाना',
        textEnglish: 'High endurance; sustained stamina, slow to fatigue during long exertion',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
];
