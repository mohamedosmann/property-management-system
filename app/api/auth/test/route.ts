import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Check if NEXTAUTH_SECRET is set (but don't expose the actual value)
        const hasSecret = !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET;
        
        // Check if users exist
        const userCount = await db.user.count();
        const users = await db.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
            take: 5,
        });

        // Check database connection
        let dbConnected = false;
        try {
            await db.$connect();
            dbConnected = true;
            await db.$disconnect();
        } catch (e) {
            dbConnected = false;
        }

        return NextResponse.json({
            authConfigured: hasSecret,
            dbConnected,
            userCount,
            users: users.map(u => ({
                email: u.email,
                name: u.name,
                role: u.role,
            })),
            message: hasSecret 
                ? "Authentication is configured correctly" 
                : "⚠️ NEXTAUTH_SECRET is missing! Add it to your .env file.",
            instructions: userCount === 0 
                ? "No users found. Visit /api/seed to create default users."
                : "Users exist. You can try logging in.",
            note: "Default credentials after seeding: admin@example.com / password123",
        });
    } catch (error) {
        return NextResponse.json({
            error: String(error),
            message: "Error checking authentication setup",
        }, { status: 500 });
    }
}

