// app/api/maintenance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for PATCH request
const updateSchema = z.object({
    id: z.string(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assignedToId: z.string().nullable().optional(),
});

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{}> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = updateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", issues: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { id, ...updateData } = parsed.data;
        const updated = await db.maintenanceRequest.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[MAINTENANCE_PATCH]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
