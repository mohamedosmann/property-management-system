import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const today = new Date();
        const dayOfMonth = today.getDate();

        // 1. Find all occupied properties where billing day is today
        // Note: In production this should handle varying days (e.g. 31st) robustly
        const propertiesDue = await db.property.findMany({
            where: {
                status: "OCCUPIED",
                billingDay: dayOfMonth,
                tenantId: { not: null }
            },
            include: {
                tenant: true
            }
        });

        let generatedCount = 0;
        const errors = [];

        for (const property of propertiesDue) {
            if (!property.tenantId || !property.rentAmount) continue;

            // Check if invoice already exists for this month to prevent duplicates
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const existingInvoice = await db.invoice.findFirst({
                where: {
                    propertyId: property.id,
                    tenantId: property.tenantId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            if (existingInvoice) continue;

            // Create Invoice
            try {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

                await db.invoice.create({
                    data: {
                        amount: property.rentAmount,
                        status: "UNPAID",
                        dueDate: dueDate,
                        propertyId: property.id,
                        tenantId: property.tenantId!,
                    }
                });
                generatedCount++;
            } catch (err) {
                console.error(`Failed to generate invoice for property ${property.id}:`, err);
                errors.push({ propertyId: property.id, error: String(err) });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${generatedCount} invoices.`,
            processed: propertiesDue.length,
            errors
        });

    } catch (error) {
        console.error("Billing Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
