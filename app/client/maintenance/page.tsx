import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ClientMaintenancePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const requests = await db.maintenanceRequest.findMany({
        where: {
            tenantId: session.user.id
        },
        include: {
            property: {
                select: { title: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

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
                    <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
                    <p className="text-muted-foreground">Track the status of your reported issues.</p>
                </div>
                <Button asChild>
                    <Link href="/client/maintenance/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No maintenance requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.property.title}</TableCell>
                                    <TableCell>{request.title}</TableCell>
                                    <TableCell className="capitalize text-muted-foreground">{request.category.toLowerCase()}</TableCell>
                                    <TableCell>
                                        <Badge variant={request.status === "COMPLETED" ? "default" : "secondary"}>
                                            {request.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getPriorityIcon(request.priority)}
                                            <span className="capitalize text-sm">{request.priority.toLowerCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(request.createdAt), "MMM d, yyyy")}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
