import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientName, clientEmail, clientPassword, propertyId, rentAmount, billingDay } = body;

        if (!clientName || !clientEmail || !clientPassword || !propertyId || !rentAmount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Create User
        const hashedPassword = await bcrypt.hash(clientPassword, 10);
        const user = await db.user.create({
            data: {
                name: clientName,
                email: clientEmail,
                password: hashedPassword,
                role: "CLIENT",
            },
        });

        // 2. Update Property with Tenant info
        const property = await db.property.update({
            where: { id: propertyId },
            data: {
                status: "OCCUPIED",
                tenantId: user.id,
                rentAmount: parseFloat(rentAmount),
                billingDay: parseInt(billingDay),
            },
        });

        // 3. Generate First Invoice
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days for first payment

        const invoice = await db.invoice.create({
            data: {
                amount: parseFloat(rentAmount),
                status: "UNPAID",
                dueDate: dueDate,
                propertyId: property.id,
                tenantId: user.id,
            },
        });

        return NextResponse.json({ success: true, user, property, invoice });
    } catch (error) {
        console.error("Error onboarding client:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
