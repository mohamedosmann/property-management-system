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

interface AssignPropertyDialogProps {
    propertyId: string
    propertyTitle: string
    currentOwnerId: string
    currentOwnerName: string
    clients: { id: string; name: string }[]
}

export function AssignPropertyDialog({
    propertyId,
    propertyTitle,
    currentOwnerId,
    currentOwnerName,
    clients,
}: AssignPropertyDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState<string>(currentOwnerId)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAssign = async () => {
        if (selectedClientId === currentOwnerId) {
            setError("Please select a different client")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/properties/${propertyId}/assign`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ownerId: selectedClientId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to assign property")
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
                <Button variant="ghost" size="icon">
                    <UserCog className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reassign Property</DialogTitle>
                    <DialogDescription>
                        Change the owner of "{propertyTitle}"
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Current Owner</Label>
                        <div className="text-sm text-muted-foreground">{currentOwnerName}</div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client">New Owner</Label>
                        <Select
                            value={selectedClientId}
                            onValueChange={setSelectedClientId}
                        >
                            <SelectTrigger id="client">
                                <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
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
                        {loading ? "Assigning..." : "Reassign Property"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
