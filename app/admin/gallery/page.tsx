"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, Trash2, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";

interface ImageData {
    _id?: string;
    imageId: number;
    src: string;
    alt: string;
}

export default function AdminGalleryPage() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState("");
    const [error, setError] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newImageAlt, setNewImageAlt] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/gallery");
            if (!res.ok) throw new Error("Laden fehlgeschlagen");
            const data = await res.json();
            setImages(data);
        } catch (err) {
            setError("Fehler beim Laden der Galerie. Ist MongoDB verbunden?");
        } finally {
            setIsLoading(false);
        }
    };

    const updateImage = (imageId: number, field: string, value: string) => {
        setImages((prev) =>
            prev.map((img) =>
                img.imageId === imageId ? { ...img, [field]: value } : img
            )
        );
    };

    const deleteImage = (imageId: number) => {
        setImages((prev) => prev.filter((img) => img.imageId !== imageId));
    };

    const addImage = () => {
        if (!newImageUrl.trim()) return;

        const newId = images.length > 0 ? Math.max(...images.map((i) => i.imageId)) + 1 : 1;
        setImages((prev) => [
            ...prev,
            { imageId: newId, src: newImageUrl, alt: newImageAlt || "Neues Bild" },
        ]);
        setNewImageUrl("");
        setNewImageAlt("");
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSavedMessage("");

        try {
            const res = await fetch("/api/admin/gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(images),
            });

            if (!res.ok) throw new Error("Speichern fehlgeschlagen");

            setSavedMessage("Galerie gespeichert!");
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
                    <h1 className="text-3xl font-serif text-white">Galerie bearbeiten</h1>
                    <p className="text-gray-400 mt-2">Verwalten Sie die Bilder in der Galerie</p>
                </div>
                <div className="flex items-center gap-4">
                    {savedMessage && (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            {savedMessage}
                        </span>
                    )}
                    <button
                        onClick={fetchImages}
                        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-luxury-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-luxury-gold-hover transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Alle Speichern
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Add New Image */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-white mb-4">Neues Bild hinzufügen</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Bild-URL eingeben..."
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newImageAlt}
                        onChange={(e) => setNewImageAlt(e.target.value)}
                        placeholder="Alt-Text (Beschreibung)..."
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                    />
                    <button
                        onClick={addImage}
                        className="flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded px-4 py-3 hover:bg-green-500/30 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Hinzufügen
                    </button>
                </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                    <div
                        key={image.imageId}
                        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group"
                    >
                        <div className="relative h-48">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={() => deleteImage(image.imageId)}
                                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <input
                                type="text"
                                value={image.src}
                                onChange={(e) => updateImage(image.imageId, "src", e.target.value)}
                                placeholder="Bild-URL"
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-luxury-gold focus:outline-none"
                            />
                            <input
                                type="text"
                                value={image.alt}
                                onChange={(e) => updateImage(image.imageId, "alt", e.target.value)}
                                placeholder="Alt-Text"
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-luxury-gold focus:outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
