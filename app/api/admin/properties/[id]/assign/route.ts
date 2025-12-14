import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const assignSchema = z.object({
    ownerId: z.string().min(1, "Owner ID is required"),
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

        // Verify the new owner exists and is a valid user
        const newOwner = await db.user.findUnique({
            where: { id: validatedData.ownerId },
        })

        if (!newOwner) {
            return NextResponse.json(
                { error: "Owner not found" },
                { status: 404 }
            )
        }

        // Update property owner
        const property = await db.property.update({
            where: { id },
            data: {
                ownerId: validatedData.ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json({ property })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", issues: error.issues },
                { status: 400 }
            )
        }

        console.error("Error assigning property:", error)
        return NextResponse.json(
            { error: "Failed to assign property" },
            { status: 500 }
        )
    }
}
