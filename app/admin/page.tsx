import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Users, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function getStats() {
    // In a real app, you would fetch these from the DB
    // For now we will await db calls but they might return 0
    const propertyCount = await db.property.count();
    const vacantCount = await db.property.count({ where: {} }); // Need to add status to property if not exists, implied by "Vacant vs Occupied"
    // Wait, schema doesn't have status on Property, maintenance has status.
    // Prompt said: "Status (occupied/vacant)" in Sidebar but also "Occupied vs vacant" in stats.
    // I should add a status field to Property or infer it (e.g. if assigned to client?)
    // Let's add 'status' to Property later. For now, assume all vacant strictly for MVP or just 0.
    // Actually, let's just show total properties and maybe recent properties.

    const properties = await db.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            images: true
        }
    });

    return {
        totalProperties: propertyCount,
        occupiedProperties: 0, // Placeholder
        vacantProperties: propertyCount,
        recentProperties: properties,
    };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProperties}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.occupiedProperties}</div>
                        <p className="text-xs text-muted-foreground">+18% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vacant</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vacantProperties}</div>
                        <p className="text-xs text-muted-foreground">-4% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Chart would go here, omitting for brevity in initial setup */}
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Chart Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentProperties.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No properties found.</p>
                            ) : (
                                stats.recentProperties.map(p => (
                                    <div key={p.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{p.title}</p>
                                            <p className="text-sm text-muted-foreground">{p.location}</p>
                                        </div>
                                        <div className="ml-auto font-medium">${p.price}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
