import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Check if NEXTAUTH_SECRET is set
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

        return NextResponse.json({
            authConfigured: hasSecret,
            userCount,
            users,
            message: hasSecret 
                ? "Authentication is configured correctly" 
                : "⚠️ NEXTAUTH_SECRET is missing! Add it to your .env file.",
            instructions: userCount === 0 
                ? "No users found. Visit /api/seed to create default users."
                : "Users exist. You can try logging in.",
        });
    } catch (error) {
        return NextResponse.json({
            error: String(error),
            message: "Error checking authentication setup",
        }, { status: 500 });
    }
}

