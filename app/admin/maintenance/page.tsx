import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function AdminMaintenancePage() {
    const requests = await db.maintenanceRequest.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            property: true,
            tenant: true,
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                },
            },
        }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "COMPLETED": return "default";
            case "IN_PROGRESS": return "secondary";
            default: return "outline";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "HIGH": return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "MEDIUM": return <Clock className="h-4 w-4 text-yellow-500" />;
            default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
                    <p className="text-muted-foreground">Manage maintenance requests and work orders.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/maintenance/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Request
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No maintenance requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-mono text-xs">
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            {request.id.slice(-6).toUpperCase()}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-medium line-clamp-1 max-w-[150px]">
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            {request.property.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            {request.tenant.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{request.title}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{request.category.toLowerCase()}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            <Badge variant={getStatusVariant(request.status)}>
                                                {request.status.replace('_', ' ')}
                                            </Badge>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            <div className="flex items-center gap-2">
                                                {getPriorityIcon(request.priority)}
                                                <span className="capitalize text-sm">{request.priority.toLowerCase()}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            {request.assignedTo ? (
                                                <span className="text-sm">{request.assignedTo.name}</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Unassigned</span>
                                            )}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/maintenance/${request.id}`} className="block">
                                            {format(new Date(request.createdAt), "MMM d, yyyy")}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
