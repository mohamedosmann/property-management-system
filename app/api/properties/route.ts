import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const propertySchema = z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    price: z.number(),
    type: z.string(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    squareFeet: z.number(),
    ownerId: z.string(),
    images: z.array(z.string()).optional(),
    features: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = propertySchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", issues: validated.error.issues }, { status: 400 });
        }

        const { title, description, location, price, type, bedrooms, bathrooms, squareFeet, ownerId, images } = validated.data;

        const property = await db.property.create({
            data: {
                title,
                description,
                location,
                price,
                type,
                bedrooms,
                bathrooms,
                squareFeet,
                ownerId,
                features: validated.data.features || "",
                status: "VACANT",
                images: {
                    create: images && Array.isArray(images) ? images.map((url: string) => ({ url })) : []
                }
            }
        });

        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTIES_POST]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
