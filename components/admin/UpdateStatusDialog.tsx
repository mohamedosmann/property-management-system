"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"

interface UpdateStatusDialogProps {
    requestId: string
    currentStatus: string
}

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
]

export function UpdateStatusDialog({
    requestId,
    currentStatus,
}: UpdateStatusDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleUpdate = async () => {
        if (selectedStatus === currentStatus) {
            setError("Please select a different status")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/maintenance/${requestId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: selectedStatus }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update status")
            }

            setOpen(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Status
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                    <DialogDescription>
                        Change the status of this maintenance request
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Current Status</Label>
                        <div className="text-sm text-muted-foreground">
                            {currentStatus.replace("_", " ")}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                            {error}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? "Updating..." : "Update Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
