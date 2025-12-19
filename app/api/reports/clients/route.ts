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
        const clients = await db.user.findMany({
            where: {
                role: "CLIENT"
            },
            include: {
                properties: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        status: true,
                        price: true
                    }
                },
                maintenanceRequests: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                invoices: {
                    select: {
                        id: true,
                        amount: true,
                        status: true
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
                "Name",
                "Email",
                "Properties Owned",
                "Properties Rented",
                "Total Properties",
                "Maintenance Requests",
                "Total Invoices",
                "Paid Invoices",
                "Unpaid Invoices",
                "Total Spent",
                "Created At"
            ];

            const csvRows = await Promise.all(clients.map(async (client) => {
                const ownedProperties = client.properties.length;
                const rentedProperties = await db.property.count({
                    where: { tenantId: client.id }
                });
                const totalSpent = client.invoices
                    .filter(inv => inv.status === "PAID")
                    .reduce((sum, inv) => sum + inv.amount, 0);
                const paidInvoices = client.invoices.filter(inv => inv.status === "PAID").length;
                const unpaidInvoices = client.invoices.filter(inv => inv.status !== "PAID").length;

                return [
                    client.id,
                    `"${client.name.replace(/"/g, '""')}"`,
                    client.email,
                    ownedProperties,
                    rentedProperties,
                    ownedProperties + rentedProperties,
                    client.maintenanceRequests.length,
                    client.invoices.length,
                    paidInvoices,
                    unpaidInvoices,
                    totalSpent,
                    format(new Date(client.createdAt), "yyyy-MM-dd HH:mm:ss")
                ];
            }));

            const csvContent = [
                csvHeaders.join(","),
                ...csvRows.map(row => row.join(","))
            ].join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="clients-report-${format(new Date(), "yyyy-MM-dd")}.csv"`
                }
            });
        } else if (formatType === "pdf") {
            const pdfText = `
CLIENTS REPORT
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
Total Clients: ${clients.length}

${clients.map((client, index) => {
                const totalSpent = client.invoices
                    .filter(inv => inv.status === "PAID")
                    .reduce((sum, inv) => sum + inv.amount, 0);
                const paidInvoices = client.invoices.filter(inv => inv.status === "PAID").length;
                const unpaidInvoices = client.invoices.filter(inv => inv.status !== "PAID").length;

                return `
${index + 1}. ${client.name}
   Email: ${client.email}
   Properties Owned: ${client.properties.length}
   Maintenance Requests: ${client.maintenanceRequests.length}
   Total Invoices: ${client.invoices.length}
   Paid: ${paidInvoices} | Unpaid: ${unpaidInvoices}
   Total Spent: $${totalSpent.toLocaleString()}
   Created: ${format(new Date(client.createdAt), "yyyy-MM-dd")}
`;
            }).join("\n")}
            `.trim();

            return new NextResponse(pdfText, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="clients-report-${format(new Date(), "yyyy-MM-dd")}.txt"`
                }
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("[REPORTS_CLIENTS]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

