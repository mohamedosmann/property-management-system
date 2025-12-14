import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Wrench, User, MapPin } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default async function ClientDashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    // Get user's assigned properties
    const properties = await db.property.findMany({
        where: {
            ownerId: session.user.id,
        },
        include: {
            images: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    // Get user's maintenance requests
    const maintenanceRequests = await db.maintenanceRequest.findMany({
        where: {
            tenantId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {session.user.name}!
                </h1>
                <p className="text-muted-foreground">
                    Here's an overview of your account
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{properties.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Properties assigned to you
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceRequests.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Total requests submitted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">
                            {session.user.role}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Maintenance Requests */}
            {maintenanceRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Maintenance Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {maintenanceRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{request.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Status: {request.status}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Assigned Properties */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Your Properties</h2>
                {properties.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-muted-foreground">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No properties assigned to you yet.</p>
                                <p className="text-sm">Contact your administrator to assign properties.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {properties.map((property) => (
                            <Card key={property.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className="aspect-video relative bg-muted">
                                    {property.images && property.images.length > 0 && property.images[0]?.url ? (
                                        <Image
                                            src={property.images[0].url}
                                            alt={property.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Building2 className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant={property.status === "VACANT" ? "secondary" : "default"}>
                                            {property.status}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="line-clamp-1">{property.location}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="font-medium">{property.type}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Price</span>
                                            <span className="font-medium">${property.price.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Details</span>
                                            <span className="font-medium">
                                                {property.bedrooms} bed • {property.bathrooms} bath
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
