function Consent({ language, onAgree, onBack }) {
  const content = {
    en: {
      title: "Before We Begin",
      intro:
        "MediKiosk will collect information about your health to help the physician understand your condition.",
      points: [
        "Your answers will be recorded as part of your consultation.",
        "You may provide information using text or voice.",
        "Your medical documents may be scanned and processed.",
        "The information will be shown to the physician for review.",
        "MediKiosk does not provide a diagnosis or treatment."
      ],
      consent:
        "By continuing, you confirm that you understand and agree to provide this information for your consultation.",
      agree: "I Understand & Continue",
      back: "Back"
    },

    hi: {
      title: "शुरू करने से पहले",
      intro:
        "MediKiosk आपके स्वास्थ्य से जुड़ी जानकारी एकत्र करेगा ताकि चिकित्सक आपकी स्थिति को बेहतर समझ सकें।",
      points: [
        "आपके उत्तर आपकी चिकित्सा परामर्श जानकारी के रूप में रिकॉर्ड किए जाएंगे।",
        "आप टेक्स्ट या आवाज़ के माध्यम से जानकारी दे सकते हैं।",
        "आपके चिकित्सा दस्तावेज़ स्कैन और संसाधित किए जा सकते हैं।",
        "जानकारी चिकित्सक को समीक्षा के लिए दिखाई जाएगी।",
        "MediKiosk निदान या उपचार प्रदान नहीं करता है।"
      ],
      consent:
        "जारी रखकर, आप पुष्टि करते हैं कि आपने समझ लिया है और परामर्श के लिए यह जानकारी देने के लिए सहमत हैं।",
      agree: "मैं समझता/समझती हूँ और जारी रखें",
      back: "वापस"
    },

    bn: {
      title: "শুরু করার আগে",
      intro:
        "MediKiosk আপনার স্বাস্থ্য সম্পর্কিত তথ্য সংগ্রহ করবে যাতে চিকিৎসক আপনার অবস্থা আরও ভালোভাবে বুঝতে পারেন।",
      points: [
        "আপনার উত্তর আপনার পরামর্শের অংশ হিসেবে সংরক্ষণ করা হবে।",
        "আপনি টেক্সট বা ভয়েসের মাধ্যমে তথ্য দিতে পারেন।",
        "আপনার চিকিৎসা সংক্রান্ত নথি স্ক্যান ও প্রক্রিয়া করা হতে পারে।",
        "তথ্য চিকিৎসকের পর্যালোচনার জন্য দেখানো হবে।",
        "MediKiosk রোগ নির্ণয় বা চিকিৎসা প্রদান করে না।"
      ],
      consent:
        "চালিয়ে যাওয়ার মাধ্যমে, আপনি নিশ্চিত করছেন যে আপনি বিষয়টি বুঝেছেন এবং পরামর্শের জন্য এই তথ্য দিতে সম্মত।",
      agree: "আমি বুঝেছি এবং চালিয়ে যান",
      back: "ফিরে যান"
    }
  };

  const c = content[language] || content.en;

  return (
    <div className="app">
      <div className="consent-card">

        <div className="brand-icon">
          🔐
        </div>

        <h1>{c.title}</h1>

        <p className="consent-intro">
          {c.intro}
        </p>

        <div className="consent-list">
          {c.points.map((point, index) => (
            <div className="consent-item" key={index}>
              <span className="consent-check">✓</span>
              <span>{point}</span>
            </div>
          ))}
        </div>

        <div className="consent-notice">
          <span>ℹ️</span>
          <p>{c.consent}</p>
        </div>

        <div className="consent-buttons">

          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← {c.back}
          </button>

          <button onClick={onAgree}>
            {c.agree} →
          </button>

        </div>

      </div>
    </div>
  );
}

export default Consent;