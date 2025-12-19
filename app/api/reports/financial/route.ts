import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formatType = req.nextUrl.searchParams.get("format") || "csv";
        const today = new Date();
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);

        const [invoices, revenueStats] = await Promise.all([
            db.invoice.findMany({
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
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            db.invoice.aggregate({
                _sum: { amount: true },
                _count: { id: true }
            })
        ]);

        const paidInvoices = invoices.filter(inv => inv.status === "PAID");
        const unpaidInvoices = invoices.filter(inv => inv.status === "UNPAID");
        const overdueInvoices = invoices.filter(inv => inv.status === "OVERDUE");
        const thisMonthInvoices = invoices.filter(inv => 
            inv.createdAt >= startOfThisMonth && inv.createdAt <= endOfThisMonth
        );

        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const thisMonthRevenue = thisMonthInvoices
            .filter(inv => inv.status === "PAID")
            .reduce((sum, inv) => sum + inv.amount, 0);
        const outstandingAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0) +
            overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        if (formatType === "csv") {
            const csvHeaders = [
                "ID",
                "Property",
                "Property Location",
                "Tenant",
                "Tenant Email",
                "Amount",
                "Status",
                "Due Date",
                "Paid Date",
                "Created At"
            ];

            const csvRows = invoices.map(inv => [
                inv.id,
                `"${inv.property.title.replace(/"/g, '""')}"`,
                `"${inv.property.location.replace(/"/g, '""')}"`,
                `"${inv.tenant.name.replace(/"/g, '""')}"`,
                inv.tenant.email,
                inv.amount,
                inv.status,
                format(new Date(inv.dueDate), "yyyy-MM-dd"),
                inv.paidDate ? format(new Date(inv.paidDate), "yyyy-MM-dd") : "",
                format(new Date(inv.createdAt), "yyyy-MM-dd HH:mm:ss")
            ]);

            const summaryRows = [
                [],
                ["SUMMARY"],
                ["Total Revenue", totalRevenue],
                ["This Month Revenue", thisMonthRevenue],
                ["Outstanding Amount", outstandingAmount],
                ["Total Invoices", invoices.length],
                ["Paid Invoices", paidInvoices.length],
                ["Unpaid Invoices", unpaidInvoices.length],
                ["Overdue Invoices", overdueInvoices.length],
                [],
                ["DETAILED INVOICES"],
                csvHeaders
            ];

            const csvContent = [
                ...summaryRows.map(row => row.join(",")),
                ...csvRows.map(row => row.join(","))
            ].join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="financial-report-${format(new Date(), "yyyy-MM-dd")}.csv"`
                }
            });
        } else if (formatType === "pdf") {
            const pdfText = `
FINANCIAL REPORT
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}

SUMMARY
Total Revenue: $${totalRevenue.toLocaleString()}
This Month Revenue: $${thisMonthRevenue.toLocaleString()}
Outstanding Amount: $${outstandingAmount.toLocaleString()}
Total Invoices: ${invoices.length}
Paid: ${paidInvoices.length} | Unpaid: ${unpaidInvoices.length} | Overdue: ${overdueInvoices.length}

DETAILED INVOICES
${invoices.map((inv, index) => `
${index + 1}. Invoice ${inv.id.substring(0, 8)}
   Property: ${inv.property.title} - ${inv.property.location}
   Tenant: ${inv.tenant.name} (${inv.tenant.email})
   Amount: $${inv.amount}
   Status: ${inv.status}
   Due Date: ${format(new Date(inv.dueDate), "yyyy-MM-dd")}
   ${inv.paidDate ? `Paid Date: ${format(new Date(inv.paidDate), "yyyy-MM-dd")}` : ""}
   Created: ${format(new Date(inv.createdAt), "yyyy-MM-dd")}
`).join("\n")}
            `.trim();

            return new NextResponse(pdfText, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="financial-report-${format(new Date(), "yyyy-MM-dd")}.txt"`
                }
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("[REPORTS_FINANCIAL]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

