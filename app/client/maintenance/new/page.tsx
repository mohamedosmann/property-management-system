import { db } from "@/lib/db";
import { MaintenanceForm } from "@/components/shared/MaintenanceForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewClientMaintenancePage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    // Client can only select THEIR assigned properties
    // However, the user is a tenant/client. Assuming 'owner' relation is what we use for now.
    // If tenant logic is separated later, this query needs adjustment.
    // For now, fetch properties where this user is the owner (assigned client).
    const properties = await db.property.findMany({
        where: {
            ownerId: session.user.id
        },
        select: {
            id: true,
            title: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/client/maintenance">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">New Maintenance Request</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <MaintenanceForm properties={properties} isAdmin={false} />
                </CardContent>
            </Card>
        </div>
    );
}
