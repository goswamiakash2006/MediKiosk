const clinicalQuestions = {
  chestPain: {
    en: [
      "When did the chest pain start?",
      "Where exactly is the pain located?",
      "How would you describe the pain?",
      "On a scale of 1 to 10, how severe is the pain?",
      "Does the pain spread to your arm, shoulder, jaw, back, or neck?",
      "Does anything make the pain better or worse?",
      "Do you have difficulty breathing?",
      "Do you have sweating, dizziness, nausea, or vomiting?",
      "Have you experienced this type of chest pain before?"
    ],

    hi: [
      "सीने में दर्द कब शुरू हुआ?",
      "दर्द ठीक कहाँ हो रहा है?",
      "दर्द कैसा महसूस होता है?",
      "1 से 10 के पैमाने पर दर्द कितना तेज है?",
      "क्या दर्द हाथ, कंधे, जबड़े, पीठ या गर्दन तक फैलता है?",
      "क्या किसी चीज़ से दर्द कम या ज्यादा होता है?",
      "क्या आपको सांस लेने में कठिनाई हो रही है?",
      "क्या आपको पसीना, चक्कर, मतली या उल्टी हो रही है?",
      "क्या आपको पहले भी ऐसा सीने में दर्द हुआ है?"
    ],

    bn: [
      "বুকে ব্যথা কখন শুরু হয়েছে?",
      "ঠিক কোথায় ব্যথা হচ্ছে?",
      "ব্যথাটা কেমন অনুভূত হচ্ছে?",
      "১ থেকে ১০-এর মধ্যে ব্যথার তীব্রতা কত?",
      "ব্যথা কি হাত, কাঁধ, চোয়াল, পিঠ বা ঘাড়ে ছড়িয়ে পড়ে?",
      "কোনো কিছু করলে কি ব্যথা কমে বা বেড়ে যায়?",
      "আপনার কি শ্বাস নিতে অসুবিধা হচ্ছে?",
      "আপনার কি ঘাম, মাথা ঘোরা, বমি বমি ভাব বা বমি হচ্ছে?",
      "আগেও কি আপনার এমন বুকের ব্যথা হয়েছিল?"
    ]
  },

  headache: {
    en: [
      "When did the headache start?",
      "Where is the headache located?",
      "How severe is the headache on a scale of 1 to 10?",
      "What does the headache feel like?",
      "Does anything make the headache better or worse?",
      "Do you have nausea or vomiting?",
      "Do you have blurred or unusual vision?",
      "Do you have weakness, numbness, difficulty speaking, or difficulty walking?",
      "Have you experienced this type of headache before?"
    ],

    hi: [
      "सिरदर्द कब शुरू हुआ?",
      "सिर में ठीक कहाँ दर्द हो रहा है?",
      "1 से 10 के पैमाने पर सिरदर्द कितना तेज है?",
      "सिरदर्द कैसा महसूस होता है?",
      "क्या किसी चीज़ से सिरदर्द कम या ज्यादा होता है?",
      "क्या आपको मतली या उल्टी हो रही है?",
      "क्या आपकी दृष्टि धुंधली या असामान्य हो गई है?",
      "क्या आपको कमजोरी, सुन्नपन, बोलने या चलने में कठिनाई हो रही है?",
      "क्या आपको पहले भी ऐसा सिरदर्द हुआ है?"
    ],

    bn: [
      "মাথাব্যথা কখন শুরু হয়েছে?",
      "মাথার ঠিক কোথায় ব্যথা হচ্ছে?",
      "১ থেকে ১০-এর মধ্যে মাথাব্যথা কতটা তীব্র?",
      "মাথাব্যথা কেমন অনুভূত হয়?",
      "কোনো কিছু করলে কি মাথাব্যথা কমে বা বেড়ে যায়?",
      "আপনার কি বমি বমি ভাব বা বমি হচ্ছে?",
      "আপনার দৃষ্টি কি ঝাপসা বা অস্বাভাবিক হয়েছে?",
      "আপনার কি দুর্বলতা, অসাড়তা, কথা বলা বা হাঁটতে অসুবিধা হচ্ছে?",
      "আগেও কি আপনার এমন মাথাব্যথা হয়েছিল?"
    ]
  },

  fever: {
    en: [
      "When did the fever start?",
      "What was the highest temperature you measured?",
      "Is the fever continuous or does it come and go?",
      "Do you have chills or sweating?",
      "Do you have cough, sore throat, or difficulty breathing?",
      "Do you have vomiting or diarrhea?",
      "Do you have any pain or other symptoms?",
      "Have you taken any medicine for the fever?"
    ],

    hi: [
      "बुखार कब शुरू हुआ?",
      "आपने सबसे अधिक कितना तापमान मापा?",
      "क्या बुखार लगातार रहता है या आता-जाता है?",
      "क्या आपको ठंड लगना या पसीना आना होता है?",
      "क्या आपको खांसी, गले में खराश या सांस लेने में कठिनाई है?",
      "क्या आपको उल्टी या दस्त हो रहे हैं?",
      "क्या आपको कोई दर्द या अन्य लक्षण हैं?",
      "क्या आपने बुखार के लिए कोई दवा ली है?"
    ],

    bn: [
      "জ্বর কখন শুরু হয়েছে?",
      "আপনার মাপা সর্বোচ্চ তাপমাত্রা কত ছিল?",
      "জ্বর কি সবসময় থাকে নাকি মাঝে মাঝে আসে?",
      "আপনার কি কাঁপুনি বা ঘাম হয়?",
      "আপনার কি কাশি, গলা ব্যথা বা শ্বাসকষ্ট আছে?",
      "আপনার কি বমি বা ডায়রিয়া হচ্ছে?",
      "আপনার কি কোনো ব্যথা বা অন্য উপসর্গ আছে?",
      "জ্বরের জন্য কি কোনো ওষুধ খেয়েছেন?"
    ]
  },

  nausea: {
  en: [
    "When did the nausea start?",
    "How severe is the nausea on a scale of 1 to 10?",
    "How often are you experiencing nausea?",
    "Have you vomited?",
    "Do you have abdominal pain?",
    "Do you have fever, dizziness, or headache?",
    "Does eating or drinking make the nausea better or worse?",
    "Have you taken any medicine for the nausea?"
  ],

  hi: [
    "मतली कब शुरू हुई?",
    "1 से 10 के पैमाने पर मतली कितनी गंभीर है?",
    "आपको कितनी बार मतली महसूस हो रही है?",
    "क्या आपको उल्टी हुई है?",
    "क्या आपके पेट में दर्द है?",
    "क्या आपको बुखार, चक्कर या सिरदर्द है?",
    "क्या खाने या पीने से मतली कम या ज्यादा होती है?",
    "क्या आपने मतली के लिए कोई दवा ली है?"
  ],

  bn: [
    "বমি বমি ভাব কখন শুরু হয়েছে?",
    "১ থেকে ১০-এর মধ্যে বমি বমি ভাব কতটা তীব্র?",
    "আপনার কতবার বমি বমি ভাব হচ্ছে?",
    "আপনার কি বমি হয়েছে?",
    "আপনার কি পেটে ব্যথা হচ্ছে?",
    "আপনার কি জ্বর, মাথা ঘোরা বা মাথাব্যথা আছে?",
    "খাওয়া বা পান করলে কি বমি বমি ভাব কমে বা বেড়ে যায়?",
    "বমি বমি ভাবের জন্য কি কোনো ওষুধ খেয়েছেন?"
  ]
},

fever: {
  en: [
    "When did the fever start?",
    "What was the highest temperature you measured?",
    "Is the fever continuous or does it come and go?",
    "Do you have chills or sweating?",
    "Do you have cough, sore throat, or difficulty breathing?",
    "Do you have nausea, vomiting, or diarrhea?",
    "Are you experiencing any other symptoms?",
    "Have you taken any medicine for the fever?"
  ],

  hi: [
    "बुखार कब शुरू हुआ?",
    "आपने सबसे अधिक कितना तापमान मापा?",
    "क्या बुखार लगातार रहता है या आता-जाता है?",
    "क्या आपको ठंड लगना या पसीना आना होता है?",
    "क्या आपको खांसी, गले में खराश या सांस लेने में कठिनाई है?",
    "क्या आपको मतली, उल्टी या दस्त हो रहे हैं?",
    "क्या आपको कोई अन्य लक्षण हैं?",
    "क्या आपने बुखार के लिए कोई दवा ली है?"
  ],

  bn: [
    "জ্বর কখন শুরু হয়েছে?",
    "আপনার মাপা সর্বোচ্চ তাপমাত্রা কত ছিল?",
    "জ্বর কি সবসময় থাকে নাকি মাঝে মাঝে আসে?",
    "আপনার কি কাঁপুনি বা ঘাম হয়?",
    "আপনার কি কাশি, গলা ব্যথা বা শ্বাসকষ্ট আছে?",
    "আপনার কি বমি বমি ভাব, বমি বা ডায়রিয়া হচ্ছে?",
    "আপনার কি অন্য কোনো উপসর্গ আছে?",
    "জ্বরের জন্য কি কোনো ওষুধ খেয়েছেন?"
  ]
},

  general: {
    en: [
      "When did the problem start?",
      "How would you describe your main symptom?",
      "Where is the problem located?",
      "How severe is it on a scale of 1 to 10?",
      "What makes it better or worse?",
      "Are you experiencing any other symptoms?",
      "Have you had this problem before?",
      "Have you taken any medicine for it?"
    ],

    hi: [
      "समस्या कब शुरू हुई?",
      "आपके मुख्य लक्षण को आप कैसे बताएंगे?",
      "समस्या ठीक कहाँ है?",
      "1 से 10 के पैमाने पर यह कितनी गंभीर है?",
      "किस चीज़ से यह बेहतर या खराब होता है?",
      "क्या आपको कोई अन्य लक्षण भी हैं?",
      "क्या आपको पहले भी यह समस्या हुई है?",
      "क्या आपने इसके लिए कोई दवा ली है?"
    ],

    bn: [
      "সমস্যাটি কখন শুরু হয়েছে?",
      "আপনার প্রধান উপসর্গটি কেমন?",
      "সমস্যাটি ঠিক কোথায়?",
      "১ থেকে ১০-এর মধ্যে এটি কতটা তীব্র?",
      "কোনো কিছু করলে কি এটি ভালো বা খারাপ হয়?",
      "আপনার কি অন্য কোনো উপসর্গ আছে?",
      "আগেও কি আপনার এই সমস্যা হয়েছিল?",
      "এর জন্য কি কোনো ওষুধ খেয়েছেন?"
    ]
  }
};

export default clinicalQuestions;