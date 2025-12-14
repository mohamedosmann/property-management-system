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
import { UserCog } from "lucide-react"

interface AssignTechnicianDialogProps {
    requestId: string
    currentAssigneeId: string | null
    currentAssigneeName?: string
    users: { id: string; name: string }[]
}

export function AssignTechnicianDialog({
    requestId,
    currentAssigneeId,
    currentAssigneeName,
    users,
}: AssignTechnicianDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>(currentAssigneeId || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAssign = async () => {
        if (!selectedUserId) {
            setError("Please select a user")
            return
        }

        if (selectedUserId === currentAssigneeId) {
            setError("Please select a different user")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/maintenance/${requestId}/assign`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assignedToId: selectedUserId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to assign user")
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
                    <UserCog className="mr-2 h-4 w-4" />
                    {currentAssigneeId ? "Reassign" : "Assign Technician"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Technician</DialogTitle>
                    <DialogDescription>
                        Assign this maintenance request to a technician
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {currentAssigneeName && (
                        <div className="grid gap-2">
                            <Label>Currently Assigned To</Label>
                            <div className="text-sm text-muted-foreground">
                                {currentAssigneeName}
                            </div>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="assignee">Assign To</Label>
                        <Select
                            value={selectedUserId}
                            onValueChange={setSelectedUserId}
                        >
                            <SelectTrigger id="assignee">
                                <SelectValue placeholder="Select a technician" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
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
                    <Button onClick={handleAssign} disabled={loading}>
                        {loading ? "Assigning..." : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
