"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const languages = [
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "en", name: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLocale, setCurrentLocale] = useState("de");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Get current locale from cookie
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("locale="));
        if (cookie) {
            setCurrentLocale(cookie.split("=")[1]);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (locale: string) => {
        // Set cookie
        document.cookie = `locale=${locale}; path=/; max-age=31536000`;
        setCurrentLocale(locale);
        setIsOpen(false);
        // Refresh the page to apply new locale
        router.refresh();
    };

    const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{currentLang.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${currentLocale === lang.code
                                    ? "bg-luxury-gold/10 text-luxury-gold"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
