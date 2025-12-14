import { db } from "@/lib/db";
import { EditPropertyForm } from "@/components/admin/EditPropertyForm";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const property = await db.property.findUnique({
        where: { id },
        include: {
            images: true,
        },
    });

    if (!property) {
        notFound();
    }

    const clients = await db.user.findMany({
        where: { role: 'CLIENT' },
        select: { id: true, name: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Edit Property</h1>
            </div>
            <div className="max-w-2xl border rounded-lg p-6 bg-card">
                <EditPropertyForm property={property} clients={clients} />
            </div>
        </div>
    );
}
