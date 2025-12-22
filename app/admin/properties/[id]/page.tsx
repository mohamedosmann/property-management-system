import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, FileText, Hammer, CreditCard, User, Image as ImageIcon, LayoutGrid, MapPin, Bed, Bath, Move, DollarSign, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const property = await db.property.findUnique({
        where: { id },
        include: {
            owner: true,
            tenant: true,
            images: true,
            maintenanceRequests: {
                orderBy: { createdAt: 'desc' }
            },
            invoices: {
                orderBy: { dueDate: 'desc' }
            }
        }
    });

    if (!property) {
        notFound();
    }

    const mainImage = property.images.length > 0 ? property.images[0].url : null;

    return (
        <div className="space-y-6">

            {/* Top Navigation / Breadcrumb Placeholder if needed */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-muted-foreground">Property Details</h2>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/properties/${property.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Property
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT SIDEBAR - IMAGE & INFO */}
                <aside className="lg:col-span-4 space-y-6">

                    {/* Main Property Card */}
                    <Card className="border-none card-shadow overflow-hidden">
                        {/* Image Header */}
                        <div className="relative w-full h-64 bg-slate-100">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge variant={property.status === 'OCCUPIED' ? 'default' : 'secondary'} className="shadow-lg">
                                    {property.status}
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-6 space-y-6">

                            {/* Title & Location */}
                            <div>
                                <h1 className="text-2xl font-bold text-foreground leading-tight">{property.title}</h1>
                                <div className="flex items-start mt-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                                    <span className="text-sm">{property.location}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Monthly Rent
                                    </div>
                                    <div className="text-lg font-bold text-primary">${property.rentAmount || property.price}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Billing Day
                                    </div>
                                    <div className="text-lg font-bold">
                                        {property.billingDay ? `${property.billingDay}th` : 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Bed className="h-3 w-3" /> Bedrooms
                                    </div>
                                    <div className="font-semibold">{property.bedrooms}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Bath className="h-3 w-3" /> Bathrooms
                                    </div>
                                    <div className="font-semibold">{property.bathrooms}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Move className="h-3 w-3" /> Sq Ft
                                    </div>
                                    <div className="font-semibold">{property.squareFeet}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Type</div>
                                    <div className="font-semibold truncate">{property.type}</div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Tenant Info Card */}
                    <Card className="border-none card-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" /> Current Tenant
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {property.tenant ? (
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {property.tenant.name?.charAt(0) || "T"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-medium truncate">{property.tenant.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{property.tenant.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground py-2">
                                    No tenant assigned.
                                    <Button variant="link" className="p-0 h-auto ml-1 font-normal text-primary">Assign now</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </aside>

                {/* RIGHT MAIN CONTENT - TABS */}
                <main className="lg:col-span-8">
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="invoices">History & Invoices</TabsTrigger>
                            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card className="border-none card-shadow">
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {property.description}
                                    </p>

                                    <Separator />

                                    <div>
                                        <h4 className="font-semibold mb-2">Features & Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {property.features?.split(',').map((feat, i) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 font-normal">
                                                    {feat.trim()}
                                                </Badge>
                                            )) || <span className="text-muted-foreground text-sm">No specific features listed.</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* INVOICES TAB */}
                        <TabsContent value="invoices">
                            <Card className="border-none card-shadow">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Invoice History</CardTitle>
                                    <Button variant="outline" size="sm">Create Invoice</Button>
                                </CardHeader>
                                <CardContent>
                                    {property.invoices.length > 0 ? (
                                        <div className="space-y-1">
                                            {property.invoices.map(inv => (
                                                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                            <DollarSign className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">Invoice #{inv.id.slice(-6)}</div>
                                                            <div className="text-xs text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-sm">${inv.amount}</div>
                                                        <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'OVERDUE' ? 'destructive' : 'outline'} className="text-[10px] h-5">
                                                            {inv.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-center py-8 text-muted-foreground">No invoices found.</div>}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* MAINTENANCE TAB */}
                        <TabsContent value="maintenance">
                            <Card className="border-none card-shadow">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Maintenance Requests</CardTitle>
                                    <Button variant="outline" size="sm">Log Request</Button>
                                </CardHeader>
                                <CardContent>
                                    {property.maintenanceRequests.length > 0 ? (
                                        <div className="space-y-1">
                                            {property.maintenanceRequests.map(req => (
                                                <div key={req.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                                            <Hammer className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{req.title}</div>
                                                            <div className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{req.priority}</Badge>
                                                        <Badge>{req.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <div className="text-center py-8 text-muted-foreground">No maintenance requests found.</div>}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* DOCUMENTS TAB */}
                        <TabsContent value="documents">
                            <Card className="border-none card-shadow">
                                <CardHeader>
                                    <CardTitle>Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50/50">
                                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-muted-foreground">No documents uploaded.</p>
                                        <Button variant="link">Upload Document</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* GALLERY TAB */}
                        <TabsContent value="gallery">
                            <Card className="border-none card-shadow">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {property.images.length > 0 ? property.images.map((img) => (
                                            <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity">
                                                <img src={img.url} alt="Property" className="object-cover w-full h-full" />
                                            </div>
                                        )) : <p className="text-muted-foreground col-span-full text-center py-8">No additional images.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </main>

            </div>
        </div>
    );
}
