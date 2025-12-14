import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const statusSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const validatedData = statusSchema.parse(body)

        // Update maintenance request status
        const maintenanceRequest = await db.maintenanceRequest.update({
            where: { id },
            data: {
                status: validatedData.status,
            },
            include: {
                property: true,
                tenant: true,
                assignedTo: true,
            },
        })

        return NextResponse.json({ maintenanceRequest })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", issues: error.issues },
                { status: 400 }
            )
        }

        console.error("Error updating status:", error)
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        )
    }
}
