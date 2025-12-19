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
        const requests = await db.maintenanceRequest.findMany({
            include: {
                property: {
                    select: {
                        title: true,
                        location: true
                    }
                },
                tenant: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                assignedTo: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (formatType === "csv") {
            const csvHeaders = [
                "ID",
                "Title",
                "Description",
                "Status",
                "Priority",
                "Category",
                "Property",
                "Property Location",
                "Tenant",
                "Tenant Email",
                "Assigned To",
                "Created At",
                "Updated At"
            ];

            const csvRows = requests.map(req => [
                req.id,
                `"${req.title.replace(/"/g, '""')}"`,
                `"${req.description.replace(/"/g, '""')}"`,
                req.status,
                req.priority,
                req.category,
                `"${req.property.title.replace(/"/g, '""')}"`,
                `"${req.property.location.replace(/"/g, '""')}"`,
                `"${req.tenant.name.replace(/"/g, '""')}"`,
                req.tenant.email,
                req.assignedTo ? `"${req.assignedTo.name.replace(/"/g, '""')}"` : "Unassigned",
                format(new Date(req.createdAt), "yyyy-MM-dd HH:mm:ss"),
                format(new Date(req.updatedAt), "yyyy-MM-dd HH:mm:ss")
            ]);

            const csvContent = [
                csvHeaders.join(","),
                ...csvRows.map(row => row.join(","))
            ].join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="maintenance-report-${format(new Date(), "yyyy-MM-dd")}.csv"`
                }
            });
        } else if (formatType === "pdf") {
            const pdfText = `
MAINTENANCE REQUESTS REPORT
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
Total Requests: ${requests.length}

${requests.map((req, index) => `
${index + 1}. ${req.title}
   Status: ${req.status}
   Priority: ${req.priority}
   Category: ${req.category}
   Property: ${req.property.title} - ${req.property.location}
   Tenant: ${req.tenant.name} (${req.tenant.email})
   ${req.assignedTo ? `Assigned To: ${req.assignedTo.name}` : "Status: Unassigned"}
   Description: ${req.description}
   Created: ${format(new Date(req.createdAt), "yyyy-MM-dd")}
   Updated: ${format(new Date(req.updatedAt), "yyyy-MM-dd")}
`).join("\n")}
            `.trim();

            return new NextResponse(pdfText, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="maintenance-report-${format(new Date(), "yyyy-MM-dd")}.txt"`
                }
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("[REPORTS_MAINTENANCE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

