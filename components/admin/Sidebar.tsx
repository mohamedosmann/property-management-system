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
    Hammer,
    UserCog,
    CreditCard,
    FileText,
    Newspaper
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        title: "Analytics", // Added to match design (placeholder)
        href: "/admin/analytics",
        icon: Newspaper, // close enough
    },
    {
        title: "Clients", // Originally Clients, keeping it
        href: "/admin/clients",
        icon: Users,
    },
    {
        title: "Invoices",
        href: "/admin/invoices",
        icon: CreditCard,
    },
    {
        title: "Documents",
        href: "/admin/documents",
        icon: FileText,
    },
    {
        title: "Maintenance",
        href: "/admin/maintenance",
        icon: Hammer,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: UserCog,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="flex h-screen w-72 flex-col bg-white border-r border-gray-100/50 shadow-sm fixed left-0 top-0 z-50">
            {/* Header / Logo */}
            <div className="flex h-20 items-center px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                        Dashboard
                    </span>
                </div>
            </div>

            {/* Profile Section (Matched to design - centered with circle) */}
            <div className="flex flex-col items-center justify-center py-6 px-4">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-md transform scale-110" />
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg relative bg-white">
                        <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                        <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                            {session?.user?.name?.charAt(0) || "A"}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <h3 className="mt-4 font-semibold text-lg text-foreground text-center">
                    {session?.user?.name || "Admin User"}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                    Property Manager
                </p>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto px-4 py-4">
                <nav className="space-y-1">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                <span>{item.title}</span>
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white/20 rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-6">
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive group"
                >
                    <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}
