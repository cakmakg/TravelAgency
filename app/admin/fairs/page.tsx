"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, ChevronDown, ChevronUp, Calendar as CalendarIcon, RefreshCw } from "lucide-react";

interface FairData {
    _id?: string;
    fairId: number;
    name: string;
    date: string;
    category: string;
    description: string;
    fullDescription?: string;
    venue?: string;
    highlights?: string[];
}

export default function AdminFairsPage() {
    const [fairs, setFairs] = useState<FairData[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFairs();
    }, []);

    const fetchFairs = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/fairs");
            if (!res.ok) throw new Error("Laden fehlgeschlagen");
            const data = await res.json();
            setFairs(data);
            if (data.length > 0) setExpandedId(data[0].fairId);
        } catch (err) {
            setError("Fehler beim Laden der Messen. Ist MongoDB verbunden?");
        } finally {
            setIsLoading(false);
        }
    };

    const updateFair = (fairId: number, field: string, value: string) => {
        setFairs((prev) =>
            prev.map((fair) =>
                fair.fairId === fairId ? { ...fair, [field]: value } : fair
            )
        );
    };

    const handleSave = async (fair: FairData) => {
        setIsSaving(true);
        setSavedMessage("");

        try {
            const res = await fetch("/api/admin/fairs", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fair),
            });

            if (!res.ok) throw new Error("Speichern fehlgeschlagen");

            setSavedMessage(`"${fair.name}" gespeichert!`);
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
                    <h1 className="text-3xl font-serif text-white">Messen bearbeiten</h1>
                    <p className="text-gray-400 mt-2">Bearbeiten Sie Messetermine und Beschreibungen</p>
                </div>
                <div className="flex items-center gap-4">
                    {savedMessage && (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {savedMessage}
                        </span>
                    )}
                    <button
                        onClick={fetchFairs}
                        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Aktualisieren
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {fairs.map((fair) => (
                    <div key={fair.fairId} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedId(expandedId === fair.fairId ? null : fair.fairId)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="w-12 h-12 rounded bg-luxury-gold/10 flex items-center justify-center shrink-0">
                                <CalendarIcon className="w-6 h-6 text-luxury-gold" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-medium text-white">{fair.name}</h3>
                                <p className="text-gray-400 text-sm">{fair.date} • {fair.category}</p>
                            </div>
                            {expandedId === fair.fairId ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {expandedId === fair.fairId && (
                            <div className="p-6 border-t border-white/10 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Messename</label>
                                        <input
                                            type="text"
                                            value={fair.name}
                                            onChange={(e) => updateFair(fair.fairId, "name", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Datum</label>
                                        <input
                                            type="text"
                                            value={fair.date}
                                            onChange={(e) => updateFair(fair.fairId, "date", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Kategorie</label>
                                        <input
                                            type="text"
                                            value={fair.category}
                                            onChange={(e) => updateFair(fair.fairId, "category", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Veranstaltungsort</label>
                                        <input
                                            type="text"
                                            value={fair.venue || ""}
                                            onChange={(e) => updateFair(fair.fairId, "venue", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Kurzbeschreibung</label>
                                    <textarea
                                        value={fair.description}
                                        onChange={(e) => updateFair(fair.fairId, "description", e.target.value)}
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Ausführliche Beschreibung</label>
                                    <textarea
                                        value={fair.fullDescription || ""}
                                        onChange={(e) => updateFair(fair.fairId, "fullDescription", e.target.value)}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleSave(fair)}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-luxury-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-luxury-gold-hover transition-colors disabled:opacity-50"
                                    >
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
