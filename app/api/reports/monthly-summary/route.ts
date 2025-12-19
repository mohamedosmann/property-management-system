import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);
        const startOfLastMonth = startOfMonth(subMonths(today, 1));
        const endOfLastMonth = endOfMonth(subMonths(today, 1));

        const [
            properties,
            newPropertiesThisMonth,
            maintenanceRequests,
            newMaintenanceThisMonth,
            invoices,
            paidInvoicesThisMonth,
            clients,
            newClientsThisMonth
        ] = await Promise.all([
            db.property.count(),
            db.property.count({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
                }
            }),
            db.maintenanceRequest.count(),
            db.maintenanceRequest.count({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
                }
            }),
            db.invoice.findMany({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
                },
                include: {
                    property: true,
                    tenant: true
                }
            }),
            db.invoice.aggregate({
                where: {
                    status: "PAID",
                    paidDate: { gte: startOfThisMonth, lte: endOfThisMonth }
                },
                _sum: { amount: true }
            }),
            db.user.count({ where: { role: "CLIENT" } }),
            db.user.count({
                where: {
                    role: "CLIENT",
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
                }
            })
        ]);

        const totalRevenue = paidInvoicesThisMonth._sum.amount || 0;
        const unpaidInvoices = invoices.filter(inv => inv.status === "UNPAID").length;
        const overdueInvoices = invoices.filter(inv => inv.status === "OVERDUE").length;
        const completedMaintenance = await db.maintenanceRequest.count({
            where: {
                status: "COMPLETED",
                updatedAt: { gte: startOfThisMonth, lte: endOfThisMonth }
            }
        });

        const pdfText = `
MONTHLY SUMMARY REPORT
${format(today, "MMMM yyyy")}
Generated: ${format(today, "yyyy-MM-dd HH:mm:ss")}

═══════════════════════════════════════════════════════════

OVERVIEW
═══════════════════════════════════════════════════════════
Total Properties: ${properties}
New Properties This Month: ${newPropertiesThisMonth}
Total Clients: ${clients}
New Clients This Month: ${newClientsThisMonth}

FINANCIAL SUMMARY
═══════════════════════════════════════════════════════════
Total Revenue This Month: $${totalRevenue.toLocaleString()}
Total Invoices Generated: ${invoices.length}
Unpaid Invoices: ${unpaidInvoices}
Overdue Invoices: ${overdueInvoices}

MAINTENANCE SUMMARY
═══════════════════════════════════════════════════════════
Total Maintenance Requests: ${maintenanceRequests}
New Requests This Month: ${newMaintenanceThisMonth}
Completed This Month: ${completedMaintenance}

PROPERTIES BREAKDOWN
═══════════════════════════════════════════════════════════
${await (async () => {
            const byStatus = await db.property.groupBy({
                by: ['status'],
                _count: { id: true }
            });
            return byStatus.map(s => `  ${s.status}: ${s._count.id}`).join("\n");
        })()}

${await (async () => {
            const byType = await db.property.groupBy({
                by: ['type'],
                _count: { id: true }
            });
            return "\nProperties by Type:\n" + byType.map(t => `  ${t.type}: ${t._count.id}`).join("\n");
        })()}

MAINTENANCE BREAKDOWN
═══════════════════════════════════════════════════════════
${await (async () => {
            const byStatus = await db.maintenanceRequest.groupBy({
                by: ['status'],
                _count: { id: true }
            });
            return byStatus.map(s => `  ${s.status}: ${s._count.id}`).join("\n");
        })()}

${await (async () => {
            const byPriority = await db.maintenanceRequest.groupBy({
                by: ['priority'],
                _count: { id: true }
            });
            return "\nBy Priority:\n" + byPriority.map(p => `  ${p.priority}: ${p._count.id}`).join("\n");
        })()}

RECENT ACTIVITY
═══════════════════════════════════════════════════════════
Recent Invoices (This Month):
${invoices.slice(0, 10).map((inv, i) => 
    `${i + 1}. ${inv.property.title} - $${inv.amount} (${inv.status}) - ${inv.tenant.name}`
).join("\n")}

═══════════════════════════════════════════════════════════
End of Report
        `.trim();

        return new NextResponse(pdfText, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename="monthly-summary-${format(today, "yyyy-MM")}.txt"`
            }
        });
    } catch (error) {
        console.error("[REPORTS_MONTHLY_SUMMARY]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

