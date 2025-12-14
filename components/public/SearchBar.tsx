"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by location or description..."
                    className="pl-9 bg-background/95 border-primary/20 focus-visible:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <Button type="submit">Search</Button>
        </form>
    );
}
