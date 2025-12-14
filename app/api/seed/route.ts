import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Upsert Admin
        const admin = await prisma.user.upsert({
            where: { email: "admin@example.com" },
            update: {},
            create: {
                email: "admin@example.com",
                name: "Admin User",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        // Upsert Client
        const client = await prisma.user.upsert({
            where: { email: "client@example.com" },
            update: {},
            create: {
                email: "client@example.com",
                name: "John Doe Client",
                password: hashedPassword,
                role: "CLIENT",
            },
        });

        return NextResponse.json({ success: true, admin, client });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 200 });
    }
}
