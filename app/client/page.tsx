import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Wallet,
    Home,
    Hammer,
    FileText,
    CreditCard,
    User,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

async function getClientStats(userId: string) {
    const [balanceResult, nextInvoice, openMaintenanceCount, property] = await Promise.all([
        db.invoice.aggregate({
            where: {
                tenantId: userId,
                status: { in: ["UNPAID", "OVERDUE"] }
            },
            _sum: { amount: true }
        }),
        db.invoice.findFirst({
            where: {
                tenantId: userId,
                status: { in: ["UNPAID", "OVERDUE"] }
            },
            orderBy: { dueDate: 'asc' },
            include: { property: true }
        }),
        db.maintenanceRequest.count({
            where: {
                tenantId: userId,
                status: { not: "COMPLETED" }
            }
        }),
        db.property.findFirst({
            where: { tenantId: userId }
        })
    ]);

    return {
        balance: balanceResult._sum.amount || 0,
        nextInvoice,
        openMaintenance: openMaintenanceCount,
        property
    };
}

export default async function ClientDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) redirect("/auth/login");

    const stats = await getClientStats(session.user.id);

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
                </div>
            </div>

            {/* 1. Key Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Current Balance */}
                <Card className="border-none card-shadow bg-blue-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Current Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${stats.balance.toLocaleString()}</div>
                        {stats.balance > 0 ? (
                            <p className="text-sm text-blue-200 mt-1">Due immediately</p>
                        ) : (
                            <p className="text-sm text-blue-200 mt-1">All paid up! 🎉</p>
                        )}
                        {stats.balance > 0 && (
                            <Button variant="secondary" size="sm" className="mt-4 w-full text-blue-600 hover:bg-white" asChild>
                                <Link href="/client/invoices">Pay Now</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Next Invoice */}
                <Card className="border-none card-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Next Invoice
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.nextInvoice ? (
                            <>
                                <div className="text-2xl font-bold">${stats.nextInvoice.amount}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Due {format(stats.nextInvoice.dueDate, "MMM d, yyyy")}
                                </div>
                                <Badge variant={stats.nextInvoice.status === 'OVERDUE' ? 'destructive' : 'secondary'} className="mt-2">
                                    {stats.nextInvoice.status}
                                </Badge>
                            </>
                        ) : (
                            <div className="text-muted-foreground py-2">No pending invoices.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Maintenance Status */}
                <Card className="border-none card-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Hammer className="h-4 w-4" /> Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.openMaintenance}</div>
                        <div className="text-sm text-muted-foreground mt-1">Open Requests</div>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary" asChild>
                            <Link href="/client/maintenance">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Property Info & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* My Property */}
                <Card className="lg:col-span-2 border-none card-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-primary" /> My Home
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.property ? (
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{stats.property.title}</h3>
                                        <p className="text-muted-foreground">{stats.property.location}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-secondary/50 rounded-lg">
                                            <div className="text-xs text-muted-foreground">Monthly Rent</div>
                                            <div className="font-bold">${stats.property.rentAmount || stats.property.price}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded-lg">
                                            <div className="text-xs text-muted-foreground">Lease Status</div>
                                            <div className="font-bold text-green-600">Active</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Placeholder for property image if available or generic icon */}
                                <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-muted-foreground">
                                    <Home className="h-10 w-10 opacity-20" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                You are not assigned to any property yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-none card-shadow">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start gap-3 rounded-xl h-12" variant="outline" asChild>
                            <Link href="/client/maintenance/new">
                                <Hammer className="h-5 w-5 text-orange-500" />
                                <div className="text-left">
                                    <div className="font-semibold text-sm">Report Issue</div>
                                    <div className="text-[10px] text-muted-foreground">Submit maintenance request</div>
                                </div>
                            </Link>
                        </Button>
                        <Button className="w-full justify-start gap-3 rounded-xl h-12" variant="outline" asChild>
                            <Link href="/client/invoices">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div className="text-left">
                                    <div className="font-semibold text-sm">View Invoices</div>
                                    <div className="text-[10px] text-muted-foreground">Download past statements</div>
                                </div>
                            </Link>
                        </Button>
                        <Button className="w-full justify-start gap-3 rounded-xl h-12" variant="outline" asChild>
                            <Link href="/client/profile">
                                <User className="h-5 w-5 text-green-500" />
                                <div className="text-left">
                                    <div className="font-semibold text-sm">My Profile</div>
                                    <div className="text-[10px] text-muted-foreground">Update contact info</div>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
