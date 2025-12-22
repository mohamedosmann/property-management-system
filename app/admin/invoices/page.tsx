import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function AdminInvoicesPage() {
    const invoices = await db.invoice.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            property: true,
            tenant: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Invoices</h1>
            </div>

            <Card className="border-none card-shadow">
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs">{inv.id.slice(-6)}</TableCell>
                                        <TableCell>{inv.property.title}</TableCell>
                                        <TableCell>{inv.tenant.name}</TableCell>
                                        <TableCell>${inv.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'OVERDUE' ? 'destructive' : 'outline'}>
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(inv.dueDate, "MMM d, yyyy")}</TableCell>
                                        <TableCell>{format(inv.createdAt, "MMM d, yyyy")}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
