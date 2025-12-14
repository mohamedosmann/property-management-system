import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "CLIENT"]),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = userSchema.parse(body);

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        // Don't return password
        const { password: _, ...result } = user;

        return NextResponse.json(result);
    } catch (error) {
        console.error("[USERS_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
