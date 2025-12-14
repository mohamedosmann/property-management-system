import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    try {
        const property = await db.property.findUnique({
            where: { id: params.id },
            include: { 
                owner: true,
                images: true
            }
        });
        if (!property) return NextResponse.json({ error: "Not Found" }, { status: 404 });
        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        // Validate body using Zod if needed, skipping for brevity but recommended
        const property = await db.property.update({
            where: { id: params.id },
            data: {
                ...body,
                ...(body.images ? {
                    images: {
                        deleteMany: {},
                        create: body.images.map((url: string) => ({ url }))
                    }
                } : {})
            },
            include: {
                images: true,
                owner: true
            }
        });
        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTY_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const property = await db.property.delete({
            where: { id: params.id },
        });
        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTY_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
