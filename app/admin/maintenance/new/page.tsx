import { db } from "@/lib/db";
import { MaintenanceForm } from "@/components/shared/MaintenanceForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewAdminMaintenancePage() {
    // Admin can select ANY property
    const properties = await db.property.findMany({
        select: {
            id: true,
            title: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/maintenance">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create Maintenance Request</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <MaintenanceForm properties={properties} isAdmin={true} />
                </CardContent>
            </Card>
        </div>
    );
}
