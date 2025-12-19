import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, TrendingUp, Users, Building2, Wrench, DollarSign } from "lucide-react";
import { ReportsList } from "@/components/admin/ReportsList";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

async function getAnalyticsData() {
    const today = new Date();
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    const startOfLastMonth = startOfMonth(subDays(today, 30));
    const endOfLastMonth = endOfMonth(subDays(today, 30));

    const [
        totalProperties,
        occupiedProperties,
        vacantProperties,
        propertiesByType,
        totalMaintenance,
        maintenanceByStatus,
        maintenanceByPriority,
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,
        unpaidInvoices,
        totalClients,
        activeTenants
    ] = await Promise.all([
        db.property.count(),
        db.property.count({ where: { status: "OCCUPIED" } }),
        db.property.count({ where: { status: "VACANT" } }),
        db.property.groupBy({
            by: ['type'],
            _count: { id: true }
        }),
        db.maintenanceRequest.count(),
        db.maintenanceRequest.groupBy({
            by: ['status'],
            _count: { id: true }
        }),
        db.maintenanceRequest.groupBy({
            by: ['priority'],
            _count: { id: true }
        }),
        db.invoice.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true }
        }),
        db.invoice.aggregate({
            where: {
                status: "PAID",
                paidDate: { gte: startOfThisMonth, lte: endOfThisMonth }
            },
            _sum: { amount: true }
        }),
        db.invoice.aggregate({
            where: {
                status: "PAID",
                paidDate: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            _sum: { amount: true }
        }),
        db.invoice.count({ where: { status: "UNPAID" } }),
        db.user.count({ where: { role: "CLIENT" } }),
        db.property.count({ where: { tenantId: { not: null } } })
    ]);

    return {
        properties: {
            total: totalProperties,
            occupied: occupiedProperties,
            vacant: vacantProperties,
            byType: propertiesByType
        },
        maintenance: {
            total: totalMaintenance,
            byStatus: maintenanceByStatus,
            byPriority: maintenanceByPriority
        },
        financial: {
            totalRevenue: totalRevenue._sum.amount || 0,
            revenueThisMonth: revenueThisMonth._sum.amount || 0,
            revenueLastMonth: revenueLastMonth._sum.amount || 0,
            unpaidInvoices
        },
        clients: {
            total: totalClients,
            active: activeTenants
        }
    };
}

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/login");
    }

    const analytics = await getAnalyticsData();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and download comprehensive reports for your property portfolio
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.properties.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.properties.occupied} occupied, {analytics.properties.vacant} vacant
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics.financial.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ${analytics.financial.revenueThisMonth.toLocaleString()} this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.maintenance.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all properties
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.clients.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.clients.active} active tenants
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Section */}
            <ReportsList analytics={analytics} />
        </div>
    );
}

