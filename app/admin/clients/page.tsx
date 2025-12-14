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
import { Plus, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
    const clients = await db.user.findMany({
        where: {
            role: "CLIENT"
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            // Count assigned properties
            properties: {
                select: { id: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Manage client accounts and property assignments.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/clients/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Assigned Properties</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {client.name?.[0] || "C"}
                                            </div>
                                            {client.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>
                                        {client.properties.length > 0 ? (
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                {client.properties.length} Properties
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(client.createdAt), "PP")}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/clients/${client.id}/edit`}>
                                                    <UserCog className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {/* Delete button would ideally be a client component or form action */}
                                        </div>
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
