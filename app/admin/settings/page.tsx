"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, RefreshCw, Building, Mail, Phone, MapPin, Globe, Facebook, Instagram, Linkedin, FileText } from "lucide-react";

interface Settings {
    _id?: string;
    companyName: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
}

const defaultSettings: Settings = {
    companyName: "RussoLux Tours",
    tagline: "Exklusive Geschäfts- und Kulturreisen nach Russland",
    email: "contact@russoluxtours.com",
    phone: "+49 123 456 789",
    address: "Musterstraße 123",
    city: "Berlin",
    country: "Deutschland",
    facebook: "",
    instagram: "",
    linkedin: "",
    heroTitle: "Geschäfts- & Kulturreisen",
    heroSubtitle: "für anspruchsvolle Professionals",
    heroDescription: "Verbinden Sie Ihre geschäftlichen Ziele auf Moskauer Messen mit unvergesslichen, luxuriösen Kulturerlebnissen."
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Laden fehlgeschlagen");
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            setError("Fehler beim Laden. Ist MongoDB verbunden?");
            setSettings(defaultSettings);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (field: keyof Settings, value: string) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSavedMessage("");

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error("Speichern fehlgeschlagen");

            setSavedMessage("Einstellungen gespeichert!");
            setTimeout(() => setSavedMessage(""), 3000);
        } catch (err) {
            setError("Fehler beim Speichern");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-luxury-gold" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-white">Website-Einstellungen</h1>
                    <p className="text-gray-400 mt-2">Kontaktdaten, Firmeninfo und Social Media Links</p>
                </div>
                <div className="flex items-center gap-4">
                    {savedMessage && (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {savedMessage}
                        </span>
                    )}
                    <button
                        onClick={fetchSettings}
                        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-luxury-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-luxury-gold-hover transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Speichern
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Company Info */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Building className="w-5 h-5 text-luxury-gold" />
                        <h2 className="text-xl font-medium text-white">Firmeninformationen</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Firmenname</label>
                            <input
                                type="text"
                                value={settings.companyName}
                                onChange={(e) => updateSetting("companyName", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Slogan</label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) => updateSetting("tagline", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Mail className="w-5 h-5 text-luxury-gold" />
                        <h2 className="text-xl font-medium text-white">Kontaktdaten</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />E-Mail
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => updateSetting("email", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />Telefon
                            </label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={(e) => updateSetting("phone", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />Adresse
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => updateSetting("address", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Stadt</label>
                                <input
                                    type="text"
                                    value={settings.city}
                                    onChange={(e) => updateSetting("city", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Land</label>
                                <input
                                    type="text"
                                    value={settings.country}
                                    onChange={(e) => updateSetting("country", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-5 h-5 text-luxury-gold" />
                        <h2 className="text-xl font-medium text-white">Social Media</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <Facebook className="w-4 h-4 inline mr-2" />Facebook
                            </label>
                            <input
                                type="url"
                                value={settings.facebook}
                                onChange={(e) => updateSetting("facebook", e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <Instagram className="w-4 h-4 inline mr-2" />Instagram
                            </label>
                            <input
                                type="url"
                                value={settings.instagram}
                                onChange={(e) => updateSetting("instagram", e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <Linkedin className="w-4 h-4 inline mr-2" />LinkedIn
                            </label>
                            <input
                                type="url"
                                value={settings.linkedin}
                                onChange={(e) => updateSetting("linkedin", e.target.value)}
                                placeholder="https://linkedin.com/company/..."
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-luxury-gold" />
                        <h2 className="text-xl font-medium text-white">Hero-Bereich (Startseite)</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Haupttitel</label>
                                <input
                                    type="text"
                                    value={settings.heroTitle}
                                    onChange={(e) => updateSetting("heroTitle", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Untertitel</label>
                                <input
                                    type="text"
                                    value={settings.heroSubtitle}
                                    onChange={(e) => updateSetting("heroSubtitle", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Beschreibung</label>
                            <textarea
                                value={settings.heroDescription}
                                onChange={(e) => updateSetting("heroDescription", e.target.value)}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
