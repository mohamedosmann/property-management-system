"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MaintenanceRequestActionsProps {
    requestId: string;
    currentStatus: string;
}

export function MaintenanceRequestActions({ requestId, currentStatus }: MaintenanceRequestActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/maintenance/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 w-full">
            <div className="flex-1">
                <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Could add delete button here too */}
        </div>
    );
}
