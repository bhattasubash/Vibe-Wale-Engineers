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

/**
 * Classical Charaka Samhita Prakriti Pariksha (15 Questions)
 * Doctor-verified clinical question set (Section 8) phrased in natural spoken Hindi and English.
 */
export const PRAKRITI_15_QUESTIONS: PrakritiQuestion[] = [
  {
    id: 'PK-01',
    categoryHindi: 'शारीरिक बनावट (Body Build)',
    categoryEnglish: 'Body Build & Structure',
    sanskritParam: 'Sharira Pramana',
    questionHindi: 'आपका शरीर स्वाभाविक रूप से पतला है और वज़न बढ़ना मुश्किल होता है, सामान्य है, या वज़न आसानी से बढ़ जाता है?',
    questionEnglish: 'Are you naturally thin and find it hard to gain weight, of medium build, or do you gain weight easily?',
    options: [
      {
        textHindi: 'स्वाभाविक रूप से पतला शरीर और वज़न बढ़ना मुश्किल होता है',
        textEnglish: 'Naturally thin frame; find it hard to gain weight',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'मध्यम व सामान्य शरीर; वज़न संतुलित रहता है',
        textEnglish: 'Medium build; maintain steady, balanced weight',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'भारी शरीर; वज़न बहुत आसानी से बढ़ जाता है',
        textEnglish: 'Heavy, broad frame; gain weight very easily',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-02',
    categoryHindi: 'त्वचा का प्रकार (Skin Texture)',
    categoryEnglish: 'Skin Texture & Temperature',
    sanskritParam: 'Twak Guna',
    questionHindi: 'आपकी त्वचा आमतौर पर सूखी और खुरदरी रहती है, गर्म और थोड़ी लाल रहती है, या मुलायम, ठंडी और थोड़ी तैलीय रहती है?',
    questionEnglish: 'Is your skin usually dry and rough, warm and slightly reddish, or soft, cool and a little oily?',
    options: [
      {
        textHindi: 'सूखी, खुरदरी और ठंडी त्वचा',
        textEnglish: 'Usually dry, rough, and cool skin',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'गर्म, थोड़ी लाल और संवेदनशील त्वचा',
        textEnglish: 'Warm, slightly reddish, and sensitive skin',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'मुलायम, ठंडी, चिकनी और थोड़ी तैलीय त्वचा',
        textEnglish: 'Soft, cool, smooth, and slightly oily skin',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-03',
    categoryHindi: 'बालों का स्वभाव (Hair Quality)',
    categoryEnglish: 'Hair Nature & Texture',
    sanskritParam: 'Kesha Prakriti',
    questionHindi: 'आपके बाल सूखे और पतले हैं, बारीक हैं और जल्दी सफ़ेद या कम होने लगे, या घने, तैलीय और मज़बूत हैं?',
    questionEnglish: 'Is your hair dry and thin, fine with early greying/thinning, or thick, oily and strong?',
    options: [
      {
        textHindi: 'सूखे, पतले, रूखे और दोमुंहे बाल',
        textEnglish: 'Dry, thin, and brittle hair',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'बारीक, मुलायम, जल्दी सफ़ेद या झड़ने वाले बाल',
        textEnglish: 'Fine hair with early greying or thinning',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'घने, तैलीय, काले और मज़बूत बाल',
        textEnglish: 'Thick, oily, dark, and strong hair',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-04',
    categoryHindi: 'भूख का स्वभाव (Appetite Pattern)',
    categoryEnglish: 'Appetite & Hunger Pattern',
    sanskritParam: 'Agni Bala',
    questionHindi: 'आपकी भूख अनियमित रहती है, यानी कभी-कभी खाना भूल जाते हैं; बहुत तेज़ रहती है, यानी देर होने पर चिड़चिड़ापन होता है; या एकदम स्थिर रहती है, यानी एक बार खाना छूट जाए तो ज़्यादा फ़र्क नहीं पड़ता?',
    questionEnglish: 'Is your hunger irregular, strong, or steady?',
    options: [
      {
        textHindi: 'अनियमित भूख (कभी भूख नहीं लगती, कभी भूल जाते हैं)',
        textEnglish: 'Irregular hunger (variable appetite, may skip meals)',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'बहुत तेज़ भूख (खाना देर होने पर गुस्सा/चिड़चिड़ापन होता है)',
        textEnglish: 'Strong, sharp hunger (cannot tolerate meal delays)',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'स्थिर और मध्यम भूख (खाना छूटने पर भी बेचैनी नहीं होती)',
        textEnglish: 'Steady, moderate hunger (comfortable skipping a meal)',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-05',
    categoryHindi: 'पाचन व कोष्ठ (Digestion & Bowels)',
    categoryEnglish: 'Digestion & Elimination',
    sanskritParam: 'Kostha & Jathara',
    questionHindi: 'अक्सर गैस या पेट फूलना और मल अनियमित रहता है, एसिडिटी या पतले दस्त जल्दी हो जाते हैं, या पाचन धीमा है पर स्थिर रहता है?',
    questionEnglish: 'Do you often get gas/bloating, get acidity/loose motions easily, or have digestion that is slow but steady?',
    options: [
      {
        textHindi: 'अक्सर गैस, पेट फूलना और कब्ज/अनियमित मल',
        textEnglish: 'Gas, bloating, and irregular/hard stool',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'एसिडिटी, सीने में जलन या पतले दस्त जल्दी होना',
        textEnglish: 'Acidity, heartburn, or loose motions easily',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'पाचन धीमा पर स्थिर; खाने के बाद भारीपन लगना',
        textEnglish: 'Slow but steady digestion; heavy feeling after meals',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-06',
    categoryHindi: 'प्यास का स्तर (Thirst Level)',
    categoryEnglish: 'Thirst & Fluid Need',
    sanskritParam: 'Pipasa',
    questionHindi: 'प्यास अनियमित लगती है, बार-बार प्यास लगती है, या बहुत कम प्यास लगती है?',
    questionEnglish: 'Is your thirst irregular, do you feel thirsty often, or do you rarely feel very thirsty?',
    options: [
      {
        textHindi: 'अनियमित प्यास (कभी कम, कभी ज्यादा)',
        textEnglish: 'Irregular and variable thirst',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'बार-बार तेज़ प्यास लगना, ठंडा पानी पसंद होना',
        textEnglish: 'Thirsty often, strong thirst, prefers cold water',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'बहुत कम प्यास लगती है',
        textEnglish: 'Rarely feels very thirsty',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-07',
    categoryHindi: 'मौसम संवेदनशीलता (Weather Sensitivity)',
    categoryEnglish: 'Weather & Climate Sensitivity',
    sanskritParam: 'Ritu Satmya',
    questionHindi: 'ठंडा-सूखा मौसम सबसे ज़्यादा परेशान करता है, गर्म मौसम सबसे ज़्यादा परेशान करता है, या उमस और नमी वाला मौसम सबसे ज़्यादा परेशान करता है?',
    questionEnglish: 'Do you dislike cold/dry weather most, hot weather most, or damp/humid weather most?',
    options: [
      {
        textHindi: 'ठंडा और सूखा मौसम सबसे ज़्यादा परेशान करता है',
        textEnglish: 'Dislike cold and dry weather most',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'गर्म मौसम और तेज़ धूप सबसे ज़्यादा परेशान करती है',
        textEnglish: 'Dislike hot weather and direct sun most',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'उमस, नमी और बरसात का मौसम सबसे ज़्यादा परेशान करता है',
        textEnglish: 'Dislike damp, humid, and wet weather most',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-08',
    categoryHindi: 'निद्रा की गहराई (Sleep Quality)',
    categoryEnglish: 'Sleep Nature & Duration',
    sanskritParam: 'Nidra Swabhava',
    questionHindi: 'नींद हल्की है और जल्दी टूट जाती है, सामान्य रहती है, या गहरी है और जगाना मुश्किल होता है?',
    questionEnglish: 'Is your sleep light and easily broken, moderate, or deep and hard to wake from?',
    options: [
      {
        textHindi: 'हल्की नींद, थोड़ी सी आहट पर जल्दी टूट जाती है',
        textEnglish: 'Light sleep, easily broken or interrupted',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'सामान्य और संतुलित नींद (6–7 घंटे)',
        textEnglish: 'Moderate, sound sleep',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'गहरी, भारी नींद और सुबह जगाना मुश्किल होता है',
        textEnglish: 'Deep, heavy sleep and hard to wake up',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-09',
    categoryHindi: 'स्वप्न का प्रकार (Dream Patterns)',
    categoryEnglish: 'Dream Content & Character',
    sanskritParam: 'Swapna Darshana',
    questionHindi: 'सपनों में अक्सर उड़ना, भागना या हलचल दिखती है, आग या झगड़े जैसे सपने आते हैं, या सपने याद ही नहीं रहते?',
    questionEnglish: 'Do you dream of movement often, of fire/conflict, or rarely remember your dreams?',
    options: [
      {
        textHindi: 'सपनों में उड़ना, भागना या बहुत हलचल दिखना',
        textEnglish: 'Dreams of flying, running, or high movement',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'आग, झगड़े, उजाले या प्रतिस्पर्धा के सपने आना',
        textEnglish: 'Dreams of fire, fighting, light, or confrontation',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'शांत सपने, पानी/झील देखना, या सपने याद ही न रहना',
        textEnglish: 'Calm dreams, water/lakes, or rarely remember dreams',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-10',
    categoryHindi: 'सीखना व याद्दाश्त (Learning & Memory)',
    categoryEnglish: 'Learning & Memory Retention',
    sanskritParam: 'Medha & Smriti',
    questionHindi: 'आप चीज़ें जल्दी सीखते हैं पर जल्दी भूल भी जाते हैं, सामान्य गति से सीखते हैं और याद्दाश्त अच्छी है, या सीखने में समय लगता है पर एक बार सीख लें तो भूलते नहीं?',
    questionEnglish: 'Do you learn quickly but forget quickly, learn steadily with good memory, or take time to learn but rarely forget?',
    options: [
      {
        textHindi: 'जल्दी सीखते हैं पर जल्दी भूल भी जाते हैं',
        textEnglish: 'Learn quickly but forget quickly',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'सामान्य गति से सीखते हैं और याद्दाश्त तेज़ व स्पष्ट है',
        textEnglish: 'Learn steadily with sharp, accurate memory',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'सीखने में समय लगता है पर एक बार सीख लें तो कभी भूलते नहीं',
        textEnglish: 'Take time to learn, but have long-lasting retention',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-11',
    categoryHindi: 'तनाव प्रतिक्रिया (Stress Response)',
    categoryEnglish: 'Stress Reaction & Emotion',
    sanskritParam: 'Manas Prakriti',
    questionHindi: 'तनाव में घबराहट या चिंता होती है, चिड़चिड़ापन या गुस्सा आता है, या शांत होकर अकेले रहने का मन करता है?',
    questionEnglish: 'Do you become anxious, become irritable/angry, or stay calm and withdrawn under stress?',
    options: [
      {
        textHindi: 'तनाव में घबराहट, चिंता या डर लगता है',
        textEnglish: 'Become anxious, fearful, or worried under stress',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'तनाव में चिड़चिड़ापन, अधीरता या गुस्सा आता है',
        textEnglish: 'Become irritable, impatient, or angry under stress',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'तनाव में शांत रहते हैं या चुपचाप अकेले रहने का मन करता है',
        textEnglish: 'Stay calm, slow to react, or withdrawn under stress',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-12',
    categoryHindi: 'बोलने की गति (Speech Pattern)',
    categoryEnglish: 'Voice & Speech Pattern',
    sanskritParam: 'Vak Pravritti',
    questionHindi: 'आपकी बोलने की रफ़्तार तेज़ है, साफ़ और भरोसे से भरी है, या धीमी और शांत है?',
    questionEnglish: 'Do you speak quickly, clearly and confidently, or slowly and calmly?',
    options: [
      {
        textHindi: 'बोलने की रफ़्तार तेज़ और कभी-कभी रुक-रुक कर',
        textEnglish: 'Speak fast, rapid, or talkative',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'साफ़, स्पष्ट, सटीक और आत्मविश्वास से भरी आवाज़',
        textEnglish: 'Clear, articulate, persuasive, and confident',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमी, शांत, गहरी और मधुर आवाज़',
        textEnglish: 'Slow, calm, melodious, and deliberate',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-13',
    categoryHindi: 'चलने की गति (Gait & Movement)',
    categoryEnglish: 'Gait & Walking Speed',
    sanskritParam: 'Gati & Cheshta',
    questionHindi: 'चलने की रफ़्तार तेज़ है, सामान्य और स्थिर है, या धीमी और सोच-समझकर है?',
    questionEnglish: 'Do you walk fast, at a moderate pace, or slowly and deliberately?',
    options: [
      {
        textHindi: 'तेज़ चाल, जल्दी-जल्दी कदम बढ़ाना',
        textEnglish: 'Walk fast with quick, light steps',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'सामान्य और दृढ़ चाल, संतुलित कदम',
        textEnglish: 'Walk at a moderate, steady, purposeful pace',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'धीमी, स्थिर और सोच-समझकर चलने वाली चाल',
        textEnglish: 'Walk slowly, calmly, and gracefully',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-14',
    categoryHindi: 'नेत्रों का स्वभाव (Eye Nature)',
    categoryEnglish: 'Eye Characteristics',
    sanskritParam: 'Netra Lakshana',
    questionHindi: '(पूछने वाला खुद देखकर आँके) आँखें छोटी और चंचल हैं, तेज़ और रोशनी से जल्दी परेशान होने वाली हैं, या बड़ी और शांत हैं?',
    questionEnglish: '(Interviewer to observe) Are the eyes small and active, sharp and light-sensitive, or large and calm?',
    options: [
      {
        textHindi: 'आँखें छोटी, चंचल, सूखी और बार-बार झपकने वाली',
        textEnglish: 'Eyes small, active, dry, and frequently blinking',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'आँखें तेज़, भेदक और तेज़ धूप/रोशनी से जल्दी थकने वाली',
        textEnglish: 'Eyes sharp, penetrating, sensitive to bright light',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'आँखें बड़ी, सफेद, आकर्षक और शांत',
        textEnglish: 'Eyes large, clear, white, calm, and attractive',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
  {
    id: 'PK-15',
    categoryHindi: 'शारीरिक सहनशक्ति (Physical Stamina)',
    categoryEnglish: 'Physical Endurance & Strength',
    sanskritParam: 'Vyayama Shakti',
    questionHindi: 'थोड़ी मेहनत में जल्दी थक जाते हैं, सामान्य ताकत और सहनशक्ति है, या शारीरिक काम में लंबे समय तक ताकत बनी रहती है?',
    questionEnglish: 'Do you tire quickly with exertion, have moderate stamina, or have strong sustained stamina?',
    options: [
      {
        textHindi: 'थोड़ी सी मेहनत में जल्दी थक जाते हैं (कम सहनशक्ति)',
        textEnglish: 'Tire quickly with exertion (variable stamina)',
        dosha: 'vata',
        points: 1,
      },
      {
        textHindi: 'सामान्य ताकत, काम का जुनून पर अधिक गर्मी में थकान',
        textEnglish: 'Moderate stamina, energetic but tires in excess heat',
        dosha: 'pitta',
        points: 1,
      },
      {
        textHindi: 'शारीरिक काम में लंबे समय तक ताकत व सहनशक्ति बनी रहती है',
        textEnglish: 'Strong, sustained stamina and high physical endurance',
        dosha: 'kapha',
        points: 1,
      },
    ],
  },
];
