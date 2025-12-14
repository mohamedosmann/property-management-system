import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
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

        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json(
                { error: "You cannot delete your own account" },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Delete user and all related data in a transaction
        await db.$transaction(async (tx) => {
            // Delete all properties owned by this user
            // (Properties have onDelete: Cascade for images and maintenance requests)
            await tx.property.deleteMany({
                where: { ownerId: id },
            })

            // Unassign any maintenance requests assigned to this user
            await tx.maintenanceRequest.updateMany({
                where: { assignedToId: id },
                data: { assignedToId: null },
            })

            // Delete maintenance requests created by this user
            // (This also cascades to delete related images)
            await tx.maintenanceRequest.deleteMany({
                where: { tenantId: id },
            })

            // Finally, delete the user
            await tx.user.delete({
                where: { id },
            })
        })

        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json(
            { error: "Failed to delete user. Please try again." },
            { status: 500 }
        )
    }
}
