import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AssignPropertyDialog } from "@/components/admin/AssignPropertyDialog";

export default async function AdminPropertiesPage() {
    const properties = await db.property.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            owner: true,
            images: true
        }
    });

    // Fetch all users (clients and admins) for reassignment
    const clients = await db.user.findMany({
        select: {
            id: true,
            name: true,
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Properties</h1>
                <Link href="/admin/properties/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Property
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No properties found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            properties.map((property) => (
                                <TableRow key={property.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/properties/${property.id}`} className="hover:underline">
                                            {property.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{property.type}</TableCell>
                                    <TableCell>{property.location}</TableCell>
                                    <TableCell>${property.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={property.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                                            {property.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{property.owner.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <AssignPropertyDialog
                                                propertyId={property.id}
                                                propertyTitle={property.title}
                                                currentOwnerId={property.owner.id}
                                                currentOwnerName={property.owner.name}
                                                clients={clients}
                                            />
                                            <Link href={`/admin/properties/${property.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
