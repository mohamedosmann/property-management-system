import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formatType = req.nextUrl.searchParams.get("format") || "csv";
        const properties = await db.property.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                tenant: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                images: true,
                maintenanceRequests: true,
                invoices: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (formatType === "csv") {
            const csvHeaders = [
                "ID",
                "Title",
                "Type",
                "Location",
                "Price",
                "Status",
                "Bedrooms",
                "Bathrooms",
                "Square Feet",
                "Owner",
                "Owner Email",
                "Tenant",
                "Tenant Email",
                "Maintenance Requests",
                "Total Invoices",
                "Created At"
            ];

            const csvRows = properties.map(prop => [
                prop.id,
                `"${prop.title.replace(/"/g, '""')}"`,
                prop.type,
                `"${prop.location.replace(/"/g, '""')}"`,
                prop.price,
                prop.status,
                prop.bedrooms,
                prop.bathrooms,
                prop.squareFeet,
                `"${prop.owner.name.replace(/"/g, '""')}"`,
                prop.owner.email,
                prop.tenant ? `"${prop.tenant.name.replace(/"/g, '""')}"` : "",
                prop.tenant?.email || "",
                prop.maintenanceRequests.length,
                prop.invoices.length,
                format(new Date(prop.createdAt), "yyyy-MM-dd HH:mm:ss")
            ]);

            const csvContent = [
                csvHeaders.join(","),
                ...csvRows.map(row => row.join(","))
            ].join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="properties-report-${format(new Date(), "yyyy-MM-dd")}.csv"`
                }
            });
        } else if (formatType === "pdf") {
            // For PDF, we'll return JSON and let the client handle it
            // Or use a server-side PDF library
            const pdfData = {
                title: "Properties Report",
                generatedAt: new Date().toISOString(),
                totalProperties: properties.length,
                properties: properties.map(prop => ({
                    id: prop.id,
                    title: prop.title,
                    type: prop.type,
                    location: prop.location,
                    price: prop.price,
                    status: prop.status,
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms,
                    squareFeet: prop.squareFeet,
                    owner: prop.owner.name,
                    ownerEmail: prop.owner.email,
                    tenant: prop.tenant?.name || "N/A",
                    tenantEmail: prop.tenant?.email || "N/A",
                    maintenanceCount: prop.maintenanceRequests.length,
                    invoiceCount: prop.invoices.length,
                    createdAt: format(new Date(prop.createdAt), "yyyy-MM-dd")
                }))
            };

            // Simple text-based PDF generation
            const pdfText = `
PROPERTIES REPORT
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
Total Properties: ${properties.length}

${properties.map((prop, index) => `
${index + 1}. ${prop.title}
   Type: ${prop.type}
   Location: ${prop.location}
   Price: $${prop.price}
   Status: ${prop.status}
   Owner: ${prop.owner.name} (${prop.owner.email})
   ${prop.tenant ? `Tenant: ${prop.tenant.name} (${prop.tenant.email})` : "Tenant: Vacant"}
   Maintenance Requests: ${prop.maintenanceRequests.length}
   Invoices: ${prop.invoices.length}
   Created: ${format(new Date(prop.createdAt), "yyyy-MM-dd")}
`).join("\n")}
            `.trim();

            return new NextResponse(pdfText, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="properties-report-${format(new Date(), "yyyy-MM-dd")}.txt"`
                }
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("[REPORTS_PROPERTIES]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

