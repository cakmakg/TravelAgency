"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Calendar,
    Image as ImageIcon,
    LogOut,
    ChevronRight,
    Home,
    Settings
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pakete", href: "/admin/packages", icon: Package },
    { name: "Messen", href: "/admin/fairs", icon: Calendar },
    { name: "Galerie", href: "/admin/gallery", icon: ImageIcon },
    { name: "Einstellungen", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Don't show sidebar on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/admin/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="text-xl font-serif text-white">
                        <span className="text-luxury-gold">RUSSO</span>LUX
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <Home className="w-5 h-5" />
                        <span>Website ansehen</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>{isLoggingOut ? "Abmelden..." : "Abmelden"}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
