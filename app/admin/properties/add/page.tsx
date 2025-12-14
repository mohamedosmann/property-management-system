import { db } from "@/lib/db";
import { AddPropertyForm } from "@/components/admin/AddPropertyForm";

export default async function AddPropertyPage() {
    // Fetch users with role CLIENT to assign properties
    const clients = await db.user.findMany({
        where: { role: 'CLIENT' },
        select: { id: true, name: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Add New Property</h1>
            </div>
            <div className="max-w-2xl border rounded-lg p-6 bg-card">
                <AddPropertyForm clients={clients} />
            </div>
        </div>
    );
}
