import { getSession } from "@/lib/auth";
import { packages, fairs } from "@/lib/data";
import { Package, Calendar, Users, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
    const session = await getSession();

    const stats = [
        {
            name: "Pakete",
            value: packages.length.toString(),
            icon: Package,
            href: "/admin/packages",
            color: "text-blue-400 bg-blue-500/10"
        },
        {
            name: "Messen",
            value: fairs.length.toString(),
            icon: Calendar,
            href: "/admin/fairs",
            color: "text-green-400 bg-green-500/10"
        },
        {
            name: "Anfragen",
            value: "24",
            icon: Users,
            change: "+12%",
            color: "text-purple-400 bg-purple-500/10"
        },
        {
            name: "Seitenaufrufe",
            value: "1.2k",
            icon: TrendingUp,
            change: "+8%",
            color: "text-orange-400 bg-orange-500/10"
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Willkommen zurück, <span className="text-luxury-gold">{session?.username || "Admin"}</span>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {stat.change && (
                                    <span className="text-green-400 text-sm font-medium">
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stat.value}
                            </div>
                            <div className="text-gray-400 text-sm">{stat.name}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-serif text-white mb-4">Schnellaktionen</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/packages"
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                        <div className="p-3 rounded-lg bg-luxury-gold/10 text-luxury-gold">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-medium group-hover:text-luxury-gold transition-colors">
                                Pakete bearbeiten
                            </div>
                            <div className="text-gray-500 text-sm">Titel, Preise, Bilder</div>
                        </div>
                    </a>

                    <a
                        href="/admin/fairs"
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                        <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-medium group-hover:text-luxury-gold transition-colors">
                                Messen bearbeiten
                            </div>
                            <div className="text-gray-500 text-sm">Termine, Beschreibungen</div>
                        </div>
                    </a>

                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-medium group-hover:text-luxury-gold transition-colors">
                                Website ansehen
                            </div>
                            <div className="text-gray-500 text-sm">Live-Vorschau</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
