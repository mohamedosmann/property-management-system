import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Upsert Admin - this will update password if user exists
        const admin = await prisma.user.upsert({
            where: { email: "admin@example.com" },
            update: {
                password: hashedPassword, // Reset password on update
            },
            create: {
                email: "admin@example.com",
                name: "Admin User",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        // Upsert Client - this will update password if user exists
        const client = await prisma.user.upsert({
            where: { email: "client@example.com" },
            update: {
                password: hashedPassword, // Reset password on update
            },
            create: {
                email: "client@example.com",
                name: "John Doe Client",
                password: hashedPassword,
                role: "CLIENT",
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: "Users created/updated successfully",
            credentials: {
                admin: { email: "admin@example.com", password: "password123" },
                client: { email: "client@example.com", password: "password123" }
            },
            admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
            client: { id: client.id, email: client.email, name: client.name, role: client.role }
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
