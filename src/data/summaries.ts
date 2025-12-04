export interface SummaryData {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  readTime: number;
  listenTime: number;
  category: string;
  subscribers: string;
  youtubeUrl: string;
  content: {
    intro: string;
    points: {
      title: string;
      items: string[];
    }[];
  };
}

export const summariesData: SummaryData[] = [
  {
    id: "1",
    title: "The Future of AI and Machine Learning in 2024",
    channel: "Tech Insights",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    readTime: 5,
    listenTime: 7,
    category: "Technology",
    subscribers: "1.2M",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: {
      intro: "आर्टिफिशियल इंटेलिजेंस (AI) और मशीन लर्निंग 2024 में तकनीक के सबसे महत्वपूर्ण क्षेत्र बन गए हैं।",
      points: [
        {
          title: "जेनरेटिव AI का विकास",
          items: [
            "ChatGPT और DALL-E ने कंटेंट क्रिएशन में क्रांति लाई",
            "टेक्स्ट, इमेज और वीडियो जेनरेशन आसान हो गया",
            "व्यवसायों में ऑटोमेशन बढ़ रहा है"
          ]
        },
        {
          title: "एथिकल AI और रेगुलेशन",
          items: [
            "AI में नैतिकता और पारदर्शिता महत्वपूर्ण",
            "सरकारें AI रेगुलेशन पर काम कर रही हैं",
            "डेटा प्राइवेसी प्राथमिकता है"
          ]
        },
        {
          title: "रोजगार पर प्रभाव",
          items: [
            "नई नौकरियां और अवसर बन रहे हैं",
            "AI स्किल्स की मांग बढ़ रही है",
            "मानव-AI सहयोग भविष्य का मॉडल"
          ]
        }
      ]
    }
  },
  {
    id: "2",
    title: "Investment Strategies for Beginners: Complete Guide",
    channel: "Money Masters",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
    readTime: 6,
    listenTime: 8,
    category: "Finance",
    subscribers: "890K",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: {
      intro: "निवेश शुरू करना कठिन लग सकता है, लेकिन सही जानकारी से यह आसान हो जाता है।",
      points: [
        {
          title: "निवेश की मूल बातें",
          items: [
            "अपने वित्तीय लक्ष्य निर्धारित करें",
            "इमरजेंसी फंड पहले बनाएं",
            "जोखिम सहनशीलता समझें"
          ]
        },
        {
          title: "निवेश के विकल्प",
          items: [
            "म्यूचुअल फंड - शुरुआती के लिए बेहतर",
            "स्टॉक्स - अधिक रिटर्न, अधिक जोखिम",
            "FD और बॉन्ड - सुरक्षित विकल्प"
          ]
        },
        {
          title: "SIP का महत्व",
          items: [
            "नियमित निवेश की आदत बनाएं",
            "रुपी कॉस्ट एवरेजिंग का फायदा",
            "छोटी राशि से शुरू करें"
          ]
        }
      ]
    }
  },
  {
    id: "3",
    title: "10 Daily Habits for Better Mental Health",
    channel: "Wellness Today",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop",
    readTime: 4,
    listenTime: 6,
    category: "Health",
    subscribers: "2.1M",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: {
      intro: "मानसिक स्वास्थ्य को बेहतर बनाने के लिए छोटी-छोटी आदतें बड़ा बदलाव ला सकती हैं।",
      points: [
        {
          title: "सुबह की दिनचर्या",
          items: [
            "जल्दी उठें और ध्यान करें",
            "व्यायाम को प्राथमिकता दें",
            "स्वस्थ नाश्ता करें"
          ]
        },
        {
          title: "दिन में करें",
          items: [
            "स्क्रीन टाइम कम करें",
            "प्रकृति में समय बिताएं",
            "ग्रेटिट्यूड जर्नल लिखें"
          ]
        },
        {
          title: "रात की आदतें",
          items: [
            "नियमित सोने का समय",
            "फोन दूर रखें",
            "7-8 घंटे की नींद लें"
          ]
        }
      ]
    }
  },
  {
    id: "4",
    title: "Quantum Computing Explained Simply",
    channel: "Science Simplified",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop",
    readTime: 7,
    listenTime: 9,
    category: "Science",
    subscribers: "567K",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: {
      intro: "क्वांटम कंप्यूटिंग भविष्य की तकनीक है जो समस्याओं को नए तरीके से हल करती है।",
      points: [
        {
          title: "क्वांटम बिट्स (Qubits)",
          items: [
            "0 और 1 दोनों एक साथ हो सकते हैं",
            "सुपरपोजिशन की अवधारणा",
            "पारंपरिक बिट्स से अलग"
          ]
        },
        {
          title: "एंटैंगलमेंट",
          items: [
            "दो क्यूबिट्स का जुड़ाव",
            "एक बदलने से दूसरा भी बदलता है",
            "तेज़ कम्युनिकेशन संभव"
          ]
        },
        {
          title: "उपयोग के क्षेत्र",
          items: [
            "दवा खोज में क्रांति",
            "क्रिप्टोग्राफी में बदलाव",
            "मौसम की सटीक भविष्यवाणी"
          ]
        }
      ]
    }
  }
];

export const getSummaryById = (id: string): SummaryData | undefined => {
  return summariesData.find(s => s.id === id);
};
