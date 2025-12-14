"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export function PublicNavbar() {
    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Building2 className="h-6 w-6" />
                    <span>PropManage</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Properties
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/api/auth/signin">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/contact">Get Started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
