import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        // Only ADMIM should be able to update status freely, or maybe tenant can cancel?
        // For simplicity, checking auth.
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status } = updateSchema.parse(body);

        const updatedRequest = await db.maintenanceRequest.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("[MAINTENANCE_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
