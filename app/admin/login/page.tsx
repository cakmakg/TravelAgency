"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, AlertCircle, Loader2, Mail } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Anmeldung fehlgeschlagen");
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-serif text-white">
                            <span className="text-luxury-gold">RUSSO</span>LUX
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">Admin Panel</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                E-Mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 pl-11 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    placeholder="admin@russoluxtours.de"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Passwort
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 pl-11 text-white focus:border-luxury-gold focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-luxury-gold text-black font-medium py-3 rounded hover:bg-luxury-gold-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Wird angemeldet...
                                </>
                            ) : (
                                "Anmelden"
                            )}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-gray-500 hover:text-luxury-gold transition-colors"
                        >
                            ← Zurück zur Website
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
