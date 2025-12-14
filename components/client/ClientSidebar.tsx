"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Home,
    Wrench,
    Settings,
    LogOut,
    UserCircle
} from "lucide-react";

const sidebarItems = [
    {
        title: "Overview",
        href: "/client",
        icon: LayoutDashboard,
    },
    {
        title: "My Properties",
        href: "/client/properties",
        icon: Home,
    },
    {
        title: "Maintenance",
        href: "/client/maintenance",
        icon: Wrench,
    },
    {
        title: "Settings",
        href: "/client/settings",
        icon: Settings,
    },
];

export function ClientSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <UserCircle className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Client Portal</span>
            </div>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid gap-1 px-4">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
