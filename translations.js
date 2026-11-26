/* =========================================================
   ASTRO KHEWAN SHARMA JYOTISH KENDRA — js/translations.js
   Hindi / English switching.
   HTML uses data-i18n="key" (text) and data-i18n-placeholder="key".
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'akjk-lang';

  const dict = {
    en: {
      'meta.title': 'Astro Khewan Sharma Jyotish Kendra | Vedic Astrology & Navagraha Guidance',
      'loader.text': 'Entering the universe…',
      'fallback.text': 'Your device cannot display the 3D universe. The full website and planet information are still available below.',
      'brand.sub': 'JYOTISH KENDRA',

      'nav.home': 'Home', 'nav.about': 'About', 'nav.planets': 'Navagraha', 'nav.services': 'Services',
      'nav.why': 'Why Us', 'nav.booking': 'Book', 'nav.contact': 'Contact',

      'hero.eyebrow': 'Vedic Astrology · Jyotish',
      'hero.title1': 'Astro Khewan Sharma',
      'hero.title2': 'Jyotish Kendra',
      'hero.subtitle': 'Step into a luxury cosmic observatory and explore the nine Navagrahas — with traditional Vedic guidance for the questions of your life.',
      'hero.cta1': 'Request Consultation',
      'hero.cta2': 'Explore the Navagrahas',
      'hero.hint': 'Scroll to enter the universe ↓',

      'about.eyebrow': 'About the Astrologer',
      'about.title': 'Astro Khewan Sharma',
      'about.p1': "Astro Khewan Sharma Jyotish Kendra offers guidance rooted in the Vedic astrology tradition (Jyotish), where the positions of the Navagrahas are studied to better understand life's journey.",
      'about.p2': 'Every consultation is approached with respect, patience and a sincere effort to listen. Astrology is offered as guidance and reflection, not as a guarantee of outcomes.',
      'about.pt1': 'Traditional Vedic (Jyotish) approach',
      'about.pt2': 'Consultations in Hindi and English',
      'about.pt3': 'Respectful, personal attention',

      'planets.eyebrow': 'The Nine Navagrahas',
      'planets.title': 'An Interactive Cosmic Observatory',
      'planets.lead': 'Tap or click any planet to fly closer and discover its deity, mantra and Vedic significance.',
      'planets.note': 'Rahu and Ketu are shadow points (lunar nodes) in Vedic astrology, not physical planets. They are shown here symbolically.',

      'panel.kicker': 'Navagraha',
      'panel.deity': 'Associated Deity',
      'panel.mantra': 'Traditional Mantra',
      'panel.copy': 'Copy Mantra',
      'panel.copied': 'Copied!',
      'panel.significance': 'Vedic Significance',
      'panel.day': 'Day',

      'services.eyebrow': 'Services',
      'services.title': 'Astrology Services',
      'services.lead': 'Contact for consultation details. No prices are listed on this website.',
      'services.cta': 'Contact for Consultation',
      'services.kundli.title': 'Kundli Analysis',
      'services.kundli.desc': 'A detailed reading of your birth chart and planetary positions.',
      'services.career.title': 'Career & Finance',
      'services.career.desc': 'Astrological guidance on work, business and financial direction.',
      'services.marriage.title': 'Marriage & Relationships',
      'services.marriage.desc': 'Kundli matching and guidance for relationships and family life.',
      'services.muhurat.title': 'Muhurat Guidance',
      'services.muhurat.desc': 'Auspicious timing for important events and new beginnings.',
      'services.gemstone.title': 'Gemstone Guidance',
      'services.gemstone.desc': 'Traditional guidance on gemstones linked to the Navagrahas.',
      'services.vastu.title': 'Vastu Consultation',
      'services.vastu.desc': 'Guidance on harmony and direction for homes and workplaces.',
      'services.remedies.title': 'Mantra & Remedies',
      'services.remedies.desc': 'Traditional mantra and remedy guidance for planetary balance.',

      'why.eyebrow': 'Why Choose Us',
      'why.title': 'Guidance with Respect and Clarity',
      'why.1.title': 'Traditional Approach', 'why.1.desc': 'Guidance based on classical Vedic astrology principles.',
      'why.2.title': 'Hindi & English', 'why.2.desc': 'Comfortable communication in the language you prefer.',
      'why.3.title': 'Personal Attention', 'why.3.desc': 'Each question is heard with patience and care.',
      'why.4.title': 'Easy WhatsApp Booking', 'why.4.desc': 'Send a consultation request in a few taps.',

      'booking.eyebrow': 'Appointment',
      'booking.title': 'Request a Consultation',
      'booking.lead': 'Fill in the details below. Your request opens in WhatsApp for you to send.',
      'booking.name': 'Full Name', 'booking.name.ph': 'Your full name',
      'booking.phone': 'Phone Number', 'booking.phone.ph': '10-digit mobile number',
      'booking.service': 'Service', 'booking.service.ph': 'Select a service',
      'booking.date': 'Preferred Date',
      'booking.time': 'Preferred Time',
      'booking.message': 'Message (optional)', 'booking.message.ph': 'Briefly describe your question',
      'booking.note': 'This is a booking request, not a confirmed appointment. The appointment is confirmed only after a reply from Astro Khewan Sharma Jyotish Kendra.',
      'booking.submit': 'Send Request on WhatsApp',
      'booking.err.name': 'Please enter your full name (at least 2 letters).',
      'booking.err.phone': 'Enter a valid 10-digit Indian mobile number.',
      'booking.err.service': 'Please select a service.',
      'booking.err.date': 'Please choose a date.',
      'booking.err.datePast': 'The date cannot be in the past.',
      'booking.err.time': 'Please choose a time.',
      'booking.err.timePast': "For today's date, please choose a later time.",
      'booking.err.message': 'Message is too long (maximum 500 characters).',
      'booking.status.fix': 'Please correct the highlighted fields.',
      'booking.status.opening': 'Opening WhatsApp… Please press Send there to submit your request.',
      'booking.status.blocked': 'Your browser blocked the pop-up. Tap here to open WhatsApp.',

      'wa.title': 'BOOKING REQUEST — Astro Khewan Sharma Jyotish Kendra',
      'wa.hello': 'Namaste! I would like to request a consultation.',
      'wa.name': 'Name', 'wa.phone': 'Phone', 'wa.service': 'Service',
      'wa.date': 'Preferred Date', 'wa.time': 'Preferred Time', 'wa.message': 'Message',
      'wa.note': 'This is a booking request, not a confirmed appointment. Kindly confirm availability.',
      'wa.thanks': 'Thank you.',

      'contact.eyebrow': 'Contact', 'contact.title': 'Get in Touch',
      'contact.call': 'Call', 'contact.email': 'Email',

      'footer.tag': 'Vedic astrology guidance, with respect and clarity.',
      'footer.disclaimer': 'Astrology is offered for guidance and reflection and does not guarantee outcomes. It is not a substitute for medical, legal or financial advice.',
      'footer.rights': 'All rights reserved.'
    },

    hi: {
      'meta.title': 'एस्ट्रो खेवन शर्मा ज्योतिष केंद्र | वैदिक ज्योतिष एवं नवग्रह मार्गदर्शन',
      'loader.text': 'ब्रह्मांड में प्रवेश हो रहा है…',
      'fallback.text': 'आपका डिवाइस 3D ब्रह्मांड नहीं दिखा सकता। पूरी वेबसाइट और ग्रहों की जानकारी नीचे उपलब्ध है।',
      'brand.sub': 'ज्योतिष केंद्र',

      'nav.home': 'मुख्य पृष्ठ', 'nav.about': 'परिचय', 'nav.planets': 'नवग्रह', 'nav.services': 'सेवाएँ',
      'nav.why': 'हमें क्यों चुनें', 'nav.booking': 'बुकिंग', 'nav.contact': 'संपर्क',

      'hero.eyebrow': 'वैदिक ज्योतिष · ज्योतिष शास्त्र',
      'hero.title1': 'एस्ट्रो खेवन शर्मा',
      'hero.title2': 'ज्योतिष केंद्र',
      'hero.subtitle': 'एक भव्य ब्रह्मांडीय वेधशाला में प्रवेश करें और नौ नवग्रहों को जानें — आपके जीवन के प्रश्नों के लिए पारंपरिक वैदिक मार्गदर्शन के साथ।',
      'hero.cta1': 'परामर्श का अनुरोध करें',
      'hero.cta2': 'नवग्रह देखें',
      'hero.hint': 'ब्रह्मांड में प्रवेश करने के लिए स्क्रॉल करें ↓',

      'about.eyebrow': 'ज्योतिषी का परिचय',
      'about.title': 'एस्ट्रो खेवन शर्मा',
      'about.p1': 'एस्ट्रो खेवन शर्मा ज्योतिष केंद्र वैदिक ज्योतिष (ज्योतिष शास्त्र) की परंपरा पर आधारित मार्गदर्शन देता है, जहाँ जीवन की यात्रा को बेहतर समझने के लिए नवग्रहों की स्थिति का अध्ययन किया जाता है।',
      'about.p2': 'हर परामर्श सम्मान, धैर्य और ध्यानपूर्वक सुनने के भाव से किया जाता है। ज्योतिष को मार्गदर्शन और चिंतन के रूप में प्रस्तुत किया जाता है, परिणामों की गारंटी के रूप में नहीं।',
      'about.pt1': 'पारंपरिक वैदिक (ज्योतिष) पद्धति',
      'about.pt2': 'हिंदी और अंग्रेज़ी में परामर्श',
      'about.pt3': 'सम्मानपूर्ण, व्यक्तिगत ध्यान',

      'planets.eyebrow': 'नौ नवग्रह',
      'planets.title': 'एक इंटरैक्टिव ब्रह्मांडीय वेधशाला',
      'planets.lead': 'किसी भी ग्रह पर टैप या क्लिक करें और उसके देवता, मंत्र तथा वैदिक महत्व को जानें।',
      'planets.note': 'वैदिक ज्योतिष में राहु और केतु छाया बिंदु (चंद्र पात) हैं, भौतिक ग्रह नहीं। यहाँ इन्हें प्रतीकात्मक रूप में दिखाया गया है।',

      'panel.kicker': 'नवग्रह',
      'panel.deity': 'संबद्ध देवता',
      'panel.mantra': 'पारंपरिक मंत्र',
      'panel.copy': 'मंत्र कॉपी करें',
      'panel.copied': 'कॉपी हो गया!',
      'panel.significance': 'वैदिक महत्व',
      'panel.day': 'वार',

      'services.eyebrow': 'सेवाएँ',
      'services.title': 'ज्योतिष सेवाएँ',
      'services.lead': 'परामर्श की जानकारी के लिए संपर्क करें। इस वेबसाइट पर कोई मूल्य नहीं दिया गया है।',
      'services.cta': 'परामर्श के लिए संपर्क करें',
      'services.kundli.title': 'कुंडली विश्लेषण',
      'services.kundli.desc': 'आपकी जन्म कुंडली और ग्रह स्थितियों का विस्तृत विवेचन।',
      'services.career.title': 'करियर एवं वित्त',
      'services.career.desc': 'नौकरी, व्यापार और आर्थिक दिशा पर ज्योतिषीय मार्गदर्शन।',
      'services.marriage.title': 'विवाह एवं संबंध',
      'services.marriage.desc': 'कुंडली मिलान तथा संबंधों और पारिवारिक जीवन के लिए मार्गदर्शन।',
      'services.muhurat.title': 'मुहूर्त मार्गदर्शन',
      'services.muhurat.desc': 'महत्वपूर्ण कार्यों और नई शुरुआत के लिए शुभ समय।',
      'services.gemstone.title': 'रत्न परामर्श',
      'services.gemstone.desc': 'नवग्रहों से जुड़े रत्नों पर पारंपरिक मार्गदर्शन।',
      'services.vastu.title': 'वास्तु परामर्श',
      'services.vastu.desc': 'घर और कार्यस्थल में सामंजस्य और दिशा संबंधी मार्गदर्शन।',
      'services.remedies.title': 'मंत्र एवं उपाय',
      'services.remedies.desc': 'ग्रह संतुलन के लिए पारंपरिक मंत्र और उपायों का मार्गदर्शन।',

      'why.eyebrow': 'हमें क्यों चुनें',
      'why.title': 'सम्मान और स्पष्टता के साथ मार्गदर्शन',
      'why.1.title': 'पारंपरिक पद्धति', 'why.1.desc': 'शास्त्रीय वैदिक ज्योतिष के सिद्धांतों पर आधारित मार्गदर्शन।',
      'why.2.title': 'हिंदी और अंग्रेज़ी', 'why.2.desc': 'आपकी पसंद की भाषा में सहज संवाद।',
      'why.3.title': 'व्यक्तिगत ध्यान', 'why.3.desc': 'हर प्रश्न को धैर्य और देखभाल से सुना जाता है।',
      'why.4.title': 'आसान व्हाट्सऐप बुकिंग', 'why.4.desc': 'कुछ ही टैप में परामर्श का अनुरोध भेजें।',

      'booking.eyebrow': 'अपॉइंटमेंट',
      'booking.title': 'परामर्श का अनुरोध करें',
      'booking.lead': 'नीचे विवरण भरें। आपका अनुरोध भेजने के लिए व्हाट्सऐप में खुलेगा।',
      'booking.name': 'पूरा नाम', 'booking.name.ph': 'आपका पूरा नाम',
      'booking.phone': 'फ़ोन नंबर', 'booking.phone.ph': '10 अंकों का मोबाइल नंबर',
      'booking.service': 'सेवा', 'booking.service.ph': 'सेवा चुनें',
      'booking.date': 'पसंदीदा तारीख',
      'booking.time': 'पसंदीदा समय',
      'booking.message': 'संदेश (वैकल्पिक)', 'booking.message.ph': 'अपना प्रश्न संक्षेप में लिखें',
      'booking.note': 'यह केवल बुकिंग अनुरोध है, पुष्टि की गई अपॉइंटमेंट नहीं। अपॉइंटमेंट की पुष्टि एस्ट्रो खेवन शर्मा ज्योतिष केंद्र के उत्तर के बाद ही मानी जाएगी।',
      'booking.submit': 'व्हाट्सऐप पर अनुरोध भेजें',
      'booking.err.name': 'कृपया अपना पूरा नाम लिखें (कम से कम 2 अक्षर)।',
      'booking.err.phone': 'कृपया सही 10 अंकों का भारतीय मोबाइल नंबर लिखें।',
      'booking.err.service': 'कृपया एक सेवा चुनें।',
      'booking.err.date': 'कृपया तारीख चुनें।',
      'booking.err.datePast': 'तारीख बीती हुई नहीं हो सकती।',
      'booking.err.time': 'कृपया समय चुनें।',
      'booking.err.timePast': 'आज की तारीख के लिए कृपया बाद का समय चुनें।',
      'booking.err.message': 'संदेश बहुत लंबा है (अधिकतम 500 अक्षर)।',
      'booking.status.fix': 'कृपया चिह्नित फ़ील्ड सुधारें।',
      'booking.status.opening': 'व्हाट्सऐप खुल रहा है… कृपया अनुरोध भेजने के लिए वहाँ Send दबाएँ।',
      'booking.status.blocked': 'आपके ब्राउज़र ने पॉप-अप रोक दिया। व्हाट्सऐप खोलने के लिए यहाँ टैप करें।',

      'wa.title': 'बुकिंग अनुरोध — एस्ट्रो खेवन शर्मा ज्योतिष केंद्र',
      'wa.hello': 'नमस्ते! मैं परामर्श का अनुरोध करना चाहता/चाहती हूँ।',
      'wa.name': 'नाम', 'wa.phone': 'फ़ोन', 'wa.service': 'सेवा',
      'wa.date': 'पसंदीदा तारीख', 'wa.time': 'पसंदीदा समय', 'wa.message': 'संदेश',
      'wa.note': 'यह केवल बुकिंग अनुरोध है, पुष्टि की गई अपॉइंटमेंट नहीं। कृपया उपलब्धता की पुष्टि करें।',
      'wa.thanks': 'धन्यवाद।',

      'contact.eyebrow': 'संपर्क', 'contact.title': 'हमसे जुड़ें',
      'contact.call': 'कॉल', 'contact.email': 'ईमेल',

      'footer.tag': 'सम्मान और स्पष्टता के साथ वैदिक ज्योतिष मार्गदर्शन।',
      'footer.disclaimer': 'ज्योतिष केवल मार्गदर्शन और चिंतन के लिए है और परिणामों की गारंटी नहीं देता। यह चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं है।',
      'footer.rights': 'सर्वाधिकार सुरक्षित।'
    }
  };

  const listeners = [];

  const I18N = {
    lang: 'en',
    dict: dict,

    t: function (key, vars) {
      let s = (dict[I18N.lang] && dict[I18N.lang][key]);
      if (s === undefined) s = dict.en[key];
      if (s === undefined) return key;
      if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    },

    apply: function () {
      document.documentElement.lang = I18N.lang;
      document.documentElement.setAttribute('data-lang', I18N.lang);

      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const val = I18N.t(el.getAttribute('data-i18n'));
        if (val !== el.getAttribute('data-i18n')) el.textContent = val;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = I18N.t(key);
        if (val !== key) el.setAttribute('placeholder', val);
      });
      document.title = I18N.t('meta.title');

      document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
        const on = b.getAttribute('data-lang-btn') === I18N.lang;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    },

    set: function (lang) {
      if (!dict[lang] || lang === I18N.lang) return;
      I18N.lang = lang;
      try { sessionStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      I18N.apply();
      listeners.slice().forEach(function (fn) {
        try { fn(lang); } catch (err) { console.error('[I18N listener]', err); }
      });
    },

    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },

    init: function () {
      let saved = null;
      try { saved = sessionStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (saved && dict[saved]) I18N.lang = saved;
      document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
        b.addEventListener('click', function () { I18N.set(b.getAttribute('data-lang-btn')); });
      });
      I18N.apply();
    }
  };

  window.I18N = I18N;
})();