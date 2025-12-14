"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    FolderOpen,
    Hammer,
    UserCog
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Properties",
        href: "/admin/properties",
        icon: Building2,
    },
    {
        title: "Clients",
        href: "/admin/clients",
        icon: Users,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: UserCog,
    },
    {
        title: "Maintenance",
        href: "/admin/maintenance",
        icon: Hammer,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <FolderOpen className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Admin Panel</span>
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
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
