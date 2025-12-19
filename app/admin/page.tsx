import { db } from "@/lib/db";
import { format, subDays, addDays, isAfter, isBefore } from "date-fns";
import {
    LayoutDashboard,
    Building2,
    Users,
    Wallet,
    Hammer,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
        totalProperties,
        occupiedProperties,
        totalClients,
        activeTenants,
        thisMonthRevenue,
        unpaidInvoices,
        overdueInvoices,
        openMaintenance,
        urgentMaintenance,
        expectedRent,
        recentInvoices,
        recentMaintenance
    ] = await Promise.all([
        db.property.count(),
        db.property.count({ where: { status: "OCCUPIED" } }),
        db.user.count({ where: { role: "CLIENT" } }),
        db.property.count({ where: { tenantId: { not: null } } }),
        db.invoice.aggregate({
            where: {
                status: "PAID",
                paidDate: { gte: startOfMonth, lte: endOfMonth }
            },
            _sum: { amount: true }
        }),
        db.invoice.count({ where: { status: "UNPAID" } }),
        db.invoice.count({ where: { status: "OVERDUE" } }),
        db.maintenanceRequest.count({ where: { status: { not: "COMPLETED" } } }),
        db.maintenanceRequest.count({ where: { status: { not: "COMPLETED" }, priority: "HIGH" } }),
        db.invoice.aggregate({
            where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
            _sum: { amount: true }
        }),
        db.invoice.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { property: true }
        }),
        db.maintenanceRequest.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { property: true, tenant: true }
        })
    ]);

    const vacantProperties = totalProperties - occupiedProperties;
    const totalPaid = thisMonthRevenue._sum.amount || 0;
    const totalOutstanding = (expectedRent._sum.amount || 0) - totalPaid;

    return {
        properties: { total: totalProperties, occupied: occupiedProperties, vacant: vacantProperties },
        clients: { total: totalClients, active: activeTenants },
        finance: {
            revenue: totalPaid,
            unpaid: unpaidInvoices,
            overdue: overdueInvoices,
            expected: expectedRent._sum.amount || 0,
            outstanding: totalOutstanding
        },
        maintenance: { open: openMaintenance, urgent: urgentMaintenance },
        recentInvoices,
        recentMaintenance
    };
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8 pb-8">
            {/* 1. Header & Quick Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your property portfolio.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="gap-2 shadow-lg shadow-primary/20 rounded-full">
                        <Link href="/admin/properties/new">
                            <Plus className="h-4 w-4" /> Add Property
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="gap-2 rounded-full">
                        <Link href="/admin/clients/onboarding">
                            <Plus className="h-4 w-4" /> Add Client
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 2. Key Stats Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Properties */}
                <Card className="border-none card-shadow hover-card-shadow transition-all cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.properties.total}</div>
                        <div className="flex items-center text-xs mt-1 space-x-2">
                            <span className="text-green-600 font-medium">{stats.properties.occupied} Occupied</span>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-orange-500 font-medium">{stats.properties.vacant} Vacant</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Clients */}
                <Card className="border-none card-shadow hover-card-shadow transition-all cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.clients.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.clients.active} Active Tenants
                        </p>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="border-none card-shadow hover-card-shadow transition-all cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (Mo)</CardTitle>
                        <Wallet className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.finance.revenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs mt-1 gap-1">
                            {stats.finance.outstanding > 0 ? (
                                <span className="text-red-500 flex items-center">
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                    ${stats.finance.outstanding.toLocaleString()} Pending
                                </span>
                            ) : (
                                <span className="text-green-500 flex items-center">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    All Paid
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance */}
                <Card className="border-none card-shadow hover-card-shadow transition-all cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
                        <Hammer className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.maintenance.open}</div>
                        <div className="flex items-center text-xs mt-1">
                            {stats.maintenance.urgent > 0 && (
                                <span className="text-red-500 font-bold flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {stats.maintenance.urgent} Urgent
                                </span>
                            )}
                            {!stats.maintenance.urgent && <span className="text-muted-foreground">No urgent issues</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Financial Overview & Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Billing Summary */}
                <Card className="lg:col-span-2 border-none card-shadow">
                    <CardHeader>
                        <CardTitle>Billing Summary (This Month)</CardTitle>
                        <CardDescription>Overview of rent collection status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-8 items-center justify-around py-4">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">Expected</div>
                                <div className="text-3xl font-bold">${stats.finance.expected.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">Collected</div>
                                <div className="text-3xl font-bold text-green-600">${stats.finance.revenue.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">Outstanding</div>
                                <div className="text-3xl font-bold text-red-500">${stats.finance.outstanding.toLocaleString()}</div>
                            </div>
                        </div>
                        {/* Simple Progress Bar */}
                        <div className="mt-6 h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-green-500"
                                style={{ width: `${(stats.finance.revenue / (stats.finance.expected || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts / Action Required */}
                <Card className="border-none card-shadow border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.finance.overdue > 0 && (
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-sm font-medium text-red-700">{stats.finance.overdue} Overdue Invoices</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-100" asChild>
                                    <Link href="/admin/invoices?status=OVERDUE">View</Link>
                                </Button>
                            </div>
                        )}
                        {stats.maintenance.urgent > 0 && (
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <span className="text-sm font-medium text-orange-700">{stats.maintenance.urgent} Urgent Requests</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-100" asChild>
                                    <Link href="/admin/maintenance?priority=HIGH">View</Link>
                                </Button>
                            </div>
                        )}
                        {stats.properties.vacant > 0 && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-700">{stats.properties.vacant} Vacant Properties</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-100" asChild>
                                    <Link href="/admin/properties?status=VACANT">Fill</Link>
                                </Button>
                            </div>
                        )}
                        {stats.finance.overdue === 0 && stats.maintenance.urgent === 0 && stats.properties.vacant === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                All good! No urgent actions.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 4. Recent Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Invoices */}
                <Card className="border-none card-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Invoices</CardTitle>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/admin/invoices">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentInvoices.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium text-sm">{inv.property.title}</div>
                                        <div className="text-xs text-muted-foreground">{format(inv.createdAt, "MMM d")}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">${inv.amount}</div>
                                        <Badge variant={inv.status === 'PAID' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0 h-4">
                                            {inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Maintenance */}
                <Card className="border-none card-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Requests</CardTitle>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/admin/maintenance">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentMaintenance.map(req => (
                                <div key={req.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{req.tenant?.name?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{req.title}</div>
                                            <div className="text-xs text-muted-foreground">{req.property.title}</div>
                                        </div>
                                    </div>
                                    <Badge variant={req.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-[10px]">
                                        {req.priority}
                                    </Badge>
                                </div>
                            ))}
                            {stats.recentMaintenance.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent requests.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
