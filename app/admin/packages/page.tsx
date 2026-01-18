"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, ChevronDown, ChevronUp, RefreshCw, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface ItineraryItem {
    day: string;
    title: string;
    desc: string;
}

interface PackageData {
    _id?: string;
    packageId: number;
    title: string;
    duration: string;
    price: string;
    image: string;
    features: string[];
    description?: string;
    inclusions?: string[];
    itinerary?: ItineraryItem[];
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/packages");
            if (!res.ok) throw new Error("Laden fehlgeschlagen");
            const data = await res.json();
            setPackages(data);
            if (data.length > 0) setExpandedId(data[0].packageId);
        } catch {
            setError("Fehler beim Laden der Pakete. Ist MongoDB verbunden?");
        } finally {
            setIsLoading(false);
        }
    };

    const updatePackage = (packageId: number, field: string, value: string | string[] | ItineraryItem[]) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId ? { ...pkg, [field]: value } : pkg
            )
        );
    };

    const updateFeature = (packageId: number, featureIndex: number, value: string) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? {
                        ...pkg,
                        features: pkg.features.map((f, i) => (i === featureIndex ? value : f)),
                    }
                    : pkg
            )
        );
    };

    const updateInclusion = (packageId: number, index: number, value: string) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? {
                        ...pkg,
                        inclusions: (pkg.inclusions || []).map((inc, i) => (i === index ? value : inc)),
                    }
                    : pkg
            )
        );
    };

    const addInclusion = (packageId: number) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? { ...pkg, inclusions: [...(pkg.inclusions || []), ""] }
                    : pkg
            )
        );
    };

    const removeInclusion = (packageId: number, index: number) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? { ...pkg, inclusions: (pkg.inclusions || []).filter((_, i) => i !== index) }
                    : pkg
            )
        );
    };

    const updateItinerary = (packageId: number, index: number, field: keyof ItineraryItem, value: string) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? {
                        ...pkg,
                        itinerary: (pkg.itinerary || []).map((item, i) =>
                            i === index ? { ...item, [field]: value } : item
                        ),
                    }
                    : pkg
            )
        );
    };

    const addItineraryDay = (packageId: number) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? {
                        ...pkg,
                        itinerary: [...(pkg.itinerary || []), { day: `Tag ${(pkg.itinerary?.length || 0) + 1}`, title: "", desc: "" }],
                    }
                    : pkg
            )
        );
    };

    const removeItineraryDay = (packageId: number, index: number) => {
        setPackages((prev) =>
            prev.map((pkg) =>
                pkg.packageId === packageId
                    ? { ...pkg, itinerary: (pkg.itinerary || []).filter((_, i) => i !== index) }
                    : pkg
            )
        );
    };

    const handleSave = async (pkg: PackageData) => {
        setIsSaving(true);
        setSavedMessage("");
        try {
            const res = await fetch("/api/admin/packages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pkg),
            });
            if (!res.ok) throw new Error("Speichern fehlgeschlagen");
            setSavedMessage(`"${pkg.title}" gespeichert!`);
            setTimeout(() => setSavedMessage(""), 3000);
        } catch {
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
                    <h1 className="text-3xl font-serif text-white">Pakete bearbeiten</h1>
                    <p className="text-gray-400 mt-2">Alle Felder inkl. Inklusivleistungen und Reiseverlauf</p>
                </div>
                <div className="flex items-center gap-4">
                    {savedMessage && (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {savedMessage}
                        </span>
                    )}
                    <button onClick={fetchPackages} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>}

            <div className="space-y-4">
                {packages.map((pkg) => (
                    <div key={pkg.packageId} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedId(expandedId === pkg.packageId ? null : pkg.packageId)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                                <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-medium text-white">{pkg.title}</h3>
                                <p className="text-gray-400 text-sm">{pkg.duration} • {pkg.price}</p>
                            </div>
                            {expandedId === pkg.packageId ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {expandedId === pkg.packageId && (
                            <div className="p-6 border-t border-white/10 space-y-8">
                                {/* Basic Info */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Titel</label>
                                        <input type="text" value={pkg.title} onChange={(e) => updatePackage(pkg.packageId, "title", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Dauer</label>
                                        <input type="text" value={pkg.duration} onChange={(e) => updatePackage(pkg.packageId, "duration", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Preis</label>
                                        <input type="text" value={pkg.price} onChange={(e) => updatePackage(pkg.packageId, "price", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Bild-URL</label>
                                        <input type="text" value={pkg.image} onChange={(e) => updatePackage(pkg.packageId, "image", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Beschreibung (Überblick)</label>
                                    <textarea value={pkg.description || ""} onChange={(e) => updatePackage(pkg.packageId, "description", e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none" />
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Features (Kurze Highlights)</label>
                                    <div className="space-y-2">
                                        {pkg.features.map((feature, idx) => (
                                            <input key={idx} type="text" value={feature} onChange={(e) => updateFeature(pkg.packageId, idx, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-luxury-gold focus:outline-none text-sm" />
                                        ))}
                                    </div>
                                </div>

                                {/* Inclusions */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-400">Inklusivleistungen</label>
                                        <button onClick={() => addInclusion(pkg.packageId)} className="flex items-center gap-1 text-luxury-gold text-sm hover:underline">
                                            <Plus className="w-4 h-4" /> Hinzufügen
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(pkg.inclusions || []).map((inc, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input type="text" value={inc} onChange={(e) => updateInclusion(pkg.packageId, idx, e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-luxury-gold focus:outline-none text-sm" placeholder="z.B. Business Class Flug" />
                                                <button onClick={() => removeInclusion(pkg.packageId, idx)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {(!pkg.inclusions || pkg.inclusions.length === 0) && <p className="text-gray-500 text-sm">Keine Inklusivleistungen. Klicken Sie auf Hinzufügen.</p>}
                                    </div>
                                </div>

                                {/* Itinerary */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-400">Reiseverlauf (Itinerary)</label>
                                        <button onClick={() => addItineraryDay(pkg.packageId)} className="flex items-center gap-1 text-luxury-gold text-sm hover:underline">
                                            <Plus className="w-4 h-4" /> Tag hinzufügen
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {(pkg.itinerary || []).map((day, idx) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <input type="text" value={day.day} onChange={(e) => updateItinerary(pkg.packageId, idx, "day", e.target.value)} className="bg-transparent border-b border-luxury-gold/30 text-luxury-gold font-medium focus:outline-none w-24" placeholder="Tag 1" />
                                                    <button onClick={() => removeItineraryDay(pkg.packageId, idx)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                                <input type="text" value={day.title} onChange={(e) => updateItinerary(pkg.packageId, idx, "title", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-luxury-gold focus:outline-none text-sm mb-2" placeholder="Titel (z.B. Ankunft & VIP-Empfang)" />
                                                <textarea value={day.desc} onChange={(e) => updateItinerary(pkg.packageId, idx, "desc", e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-luxury-gold focus:outline-none text-sm" placeholder="Beschreibung..." />
                                            </div>
                                        ))}
                                        {(!pkg.itinerary || pkg.itinerary.length === 0) && <p className="text-gray-500 text-sm">Kein Reiseverlauf. Klicken Sie auf Tag hinzufügen.</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/10">
                                    <button onClick={() => handleSave(pkg)} disabled={isSaving} className="flex items-center gap-2 bg-luxury-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-luxury-gold-hover transition-colors disabled:opacity-50">
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isSaving ? "Speichern..." : "Speichern"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
