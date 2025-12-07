import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.add": "Add",
    "nav.following": "Following",
    "nav.profile": "Profile",
    
    // Home
    "home.title": "VidSum",
    "home.subtitle": "Video Summaries",
    
    // Summary
    "summary.keyPoints": "Key Points",
    "summary.watchOnYoutube": "Watch on YouTube",
    "summary.share": "Share",
    "summary.save": "Save",
    "summary.saved": "Saved",
    "summary.follow": "Follow",
    "summary.following": "Following",
    "summary.readTime": "min read",
    "summary.listenTime": "min listen",
    
    // Add
    "add.title": "Generate Summary",
    "add.placeholder": "Paste YouTube URL here...",
    "add.notes": "Additional notes (optional)",
    "add.generate": "Generate Summary",
    "add.generating": "Generating...",
    "add.edit": "Edit Summary",
    "add.upload": "Upload Summary",
    "add.intro": "Introduction",
    "add.points": "Key Points",
    
    // Settings
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.darkMode": "Dark Mode",
    "settings.notifications": "Notifications",
    "settings.pushNotifications": "Push Notifications",
    "settings.general": "General",
    "settings.language": "Language",
    "settings.privacy": "Privacy",
    "settings.support": "Support",
    "settings.helpCenter": "Help Center",
    "settings.about": "About",
    "settings.logout": "Log Out",
    "settings.selectLanguage": "Select Language",
    "settings.languageChanged": "Language Changed",
    
    // Profile
    "profile.title": "Profile",
    "profile.library": "My Library",
    "profile.saved": "Saved",
    "profile.history": "History",
    
    // Explore
    "explore.title": "Explore",
    "explore.trending": "Trending",
    "explore.collections": "Collections",
    "explore.categories": "Categories",
    
    // Common
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
  },
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.explore": "खोजें",
    "nav.add": "जोड़ें",
    "nav.following": "फॉलोइंग",
    "nav.profile": "प्रोफाइल",
    
    // Home
    "home.title": "विडसम",
    "home.subtitle": "वीडियो सारांश",
    
    // Summary
    "summary.keyPoints": "मुख्य बिंदु",
    "summary.watchOnYoutube": "YouTube पर देखें",
    "summary.share": "शेयर करें",
    "summary.save": "सेव करें",
    "summary.saved": "सेव किया",
    "summary.follow": "फॉलो करें",
    "summary.following": "फॉलो कर रहे हैं",
    "summary.readTime": "मिनट पढ़ने में",
    "summary.listenTime": "मिनट सुनने में",
    
    // Add
    "add.title": "सारांश बनाएं",
    "add.placeholder": "YouTube URL यहाँ पेस्ट करें...",
    "add.notes": "अतिरिक्त नोट्स (वैकल्पिक)",
    "add.generate": "सारांश बनाएं",
    "add.generating": "बना रहे हैं...",
    "add.edit": "सारांश संपादित करें",
    "add.upload": "सारांश अपलोड करें",
    "add.intro": "परिचय",
    "add.points": "मुख्य बिंदु",
    
    // Settings
    "settings.title": "सेटिंग्स",
    "settings.appearance": "दिखावट",
    "settings.darkMode": "डार्क मोड",
    "settings.notifications": "सूचनाएं",
    "settings.pushNotifications": "पुश सूचनाएं",
    "settings.general": "सामान्य",
    "settings.language": "भाषा",
    "settings.privacy": "गोपनीयता",
    "settings.support": "सहायता",
    "settings.helpCenter": "सहायता केंद्र",
    "settings.about": "जानकारी",
    "settings.logout": "लॉग आउट",
    "settings.selectLanguage": "भाषा चुनें",
    "settings.languageChanged": "भाषा बदल गई",
    
    // Profile
    "profile.title": "प्रोफाइल",
    "profile.library": "मेरी लाइब्रेरी",
    "profile.saved": "सेव किया",
    "profile.history": "इतिहास",
    
    // Explore
    "explore.title": "खोजें",
    "explore.trending": "ट्रेंडिंग",
    "explore.collections": "संग्रह",
    "explore.categories": "श्रेणियाँ",
    
    // Common
    "common.cancel": "रद्द करें",
    "common.confirm": "पुष्टि करें",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "hi" ? "hi" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Sync with localStorage on mount
    const saved = localStorage.getItem("language");
    if (saved && (saved === "en" || saved === "hi")) {
      setLanguageState(saved as Language);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
