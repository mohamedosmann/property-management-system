import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const assignSchema = z.object({
    assignedToId: z.string().min(1, "Assignee ID is required"),
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
        const validatedData = assignSchema.parse(body)

        // Verify the assignee exists
        const assignee = await db.user.findUnique({
            where: { id: validatedData.assignedToId },
        })

        if (!assignee) {
            return NextResponse.json(
                { error: "Assignee not found" },
                { status: 404 }
            )
        }

        // Update maintenance request assignee
        const maintenanceRequest = await db.maintenanceRequest.update({
            where: { id },
            data: {
                assignedToId: validatedData.assignedToId,
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

        console.error("Error assigning technician:", error)
        return NextResponse.json(
            { error: "Failed to assign technician" },
            { status: 500 }
        )
    }
}
