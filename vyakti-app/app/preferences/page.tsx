"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

type Merchant = "Blinkit" | "Zepto" | "Swiggy" | "No preference";
type Language = "English" | "Hindi" | "Marathi";

export default function PreferencesPage() {
  const router = useRouter();
  
  const [usualItems, setUsualItems] = useState("");
  const [merchant, setMerchant] = useState<Merchant>("No preference");
  const [language, setLanguage] = useState<Language>("English");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedPrefs = localStorage.getItem("vyakti_preferences");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.usualItems) setUsualItems(parsed.usualItems);
        if (parsed.merchant) setMerchant(parsed.merchant);
        if (parsed.language) setLanguage(parsed.language);
      } catch (e) {
        console.error("Failed to parse preferences", e);
      }
    }
  }, []);

  const handleSave = () => {
    const prefs = { usualItems, merchant, language };
    localStorage.setItem("vyakti_preferences", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/");
    }, 1500);
  };

  const merchants: Merchant[] = ["Blinkit", "Zepto", "Swiggy", "No preference"];
  const languages: Language[] = ["English", "Hindi", "Marathi"];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-12 relative pb-20">
      
      {/* Header */}
      <div className="w-full max-w-[420px] mx-auto flex items-center mb-10">
        <button 
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[20px] font-medium text-[#1A1A1A] ml-2">
          Your Preferences
        </h1>
      </div>

      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-10">
        
        {/* Section: Usual Items */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-[16px] font-medium text-[#1A1A1A]">Your usual items</h2>
            <p className="text-[13px] text-[#888780] mt-1">We'll prioritise these brands when you order.</p>
          </div>
          <textarea
            value={usualItems}
            onChange={(e) => setUsualItems(e.target.value)}
            placeholder="e.g. Amul milk 1L, Britannia brown bread..."
            className="w-full h-[100px] border border-[#e5e5e5] rounded-[10px] p-[12px] text-[15px] outline-none focus:border-[#1D9E75] transition-colors resize-none placeholder:text-[#888780]"
          />
        </section>

        {/* Section: Preferred Merchant */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-[16px] font-medium text-[#1A1A1A]">Preferred merchant</h2>
            <p className="text-[13px] text-[#888780] mt-1">If available, we will route your orders here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {merchants.map((m) => (
              <button
                key={m}
                onClick={() => setMerchant(m)}
                className={`px-4 py-2 rounded-[10px] border text-[14px] font-medium transition-colors ${
                  merchant === m 
                    ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56]' 
                    : 'border-[#e5e5e5] bg-white text-[#444441] hover:border-[#1D9E75]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Section: Language */}
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-[16px] font-medium text-[#1A1A1A]">Language</h2>
            <p className="text-[13px] text-[#888780] mt-1">How should Vyakti speak to you?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-4 py-2 rounded-[10px] border text-[14px] font-medium transition-colors ${
                  language === l 
                    ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56]' 
                    : 'border-[#e5e5e5] bg-white text-[#444441] hover:border-[#1D9E75]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            className={`w-full text-white rounded-[10px] py-[12px] text-[15px] font-medium transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-black' : 'bg-[#1D9E75] hover:bg-[#178a66]'
            }`}
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved successfully
              </>
            ) : (
              "Save preferences"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
