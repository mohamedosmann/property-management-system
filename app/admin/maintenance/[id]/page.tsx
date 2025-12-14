import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UpdateStatusDialog } from "@/components/admin/UpdateStatusDialog"
import { AssignTechnicianDialog } from "@/components/admin/AssignTechnicianDialog"
import { ArrowLeft, Building2, User, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

export default async function MaintenanceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/login")
    }

    const { id } = await params

    const request = await db.maintenanceRequest.findUnique({
        where: { id },
        include: {
            property: {
                include: {
                    images: true,
                },
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            images: true,
        },
    })

    if (!request) {
        notFound()
    }

    // Fetch all users for assignment dropdown
    const users = await db.user.findMany({
        where: {
            role: "ADMIN",
        },
        select: {
            id: true,
            name: true,
        },
    })

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "default"
            case "IN_PROGRESS":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "text-red-600 bg-red-50 border-red-200"
            case "MEDIUM":
                return "text-yellow-600 bg-yellow-50 border-yellow-200"
            default:
                return "text-green-600 bg-green-50 border-green-200"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/maintenance">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Maintenance Request</h1>
                    <p className="text-muted-foreground">
                        #{request.id.slice(-6).toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar - Property and Client Info */}
                <div className="md:col-span-1 space-y-6">
                    {/* Property Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Property Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {request.property.images && request.property.images.length > 0 && request.property.images[0]?.url ? (
                                <div className="aspect-video relative rounded-lg overflow-hidden">
                                    <Image
                                        src={request.property.images[0].url}
                                        alt={request.property.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                    <Building2 className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">
                                    {request.property.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{request.property.location}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                                    <div>
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium">{request.property.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Price</p>
                                        <p className="font-medium">
                                            ${request.property.price.toLocaleString()}/mo
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{request.tenant.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.tenant.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Submitted {format(new Date(request.createdAt), "MMMM d, yyyy")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned To Card */}
                    {request.assignedTo && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Assigned To</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                                        <User className="h-5 w-5 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{request.assignedTo.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {request.assignedTo.email}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content - Request Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Request Info Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl">{request.title}</CardTitle>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant={getStatusVariant(request.status)}>
                                            {request.status.replace("_", " ")}
                                        </Badge>
                                        <Badge
                                            className={`${getPriorityColor(request.priority)} border`}
                                            variant="outline"
                                        >
                                            {request.priority} Priority
                                        </Badge>
                                        <Badge variant="secondary">{request.category}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {request.description}
                                </p>
                            </div>

                            {request.images.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Attached Images</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {request.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="aspect-video relative rounded-lg overflow-hidden"
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt="Maintenance issue"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-4">Actions</h3>
                                <div className="flex gap-3 flex-wrap">
                                    <UpdateStatusDialog
                                        requestId={request.id}
                                        currentStatus={request.status}
                                    />
                                    <AssignTechnicianDialog
                                        requestId={request.id}
                                        currentAssigneeId={request.assignedToId}
                                        currentAssigneeName={request.assignedTo?.name}
                                        users={users}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
