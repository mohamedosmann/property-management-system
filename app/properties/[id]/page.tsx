import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Move, ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyDetailsPageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
    const { id } = await params;
    const property = await db.property.findUnique({
        where: {
            id
        },
        include: {
            images: true,
            owner: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!property) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />

            <main className="flex-1 py-8 container mx-auto px-4">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Listings
                    </Link>
                </Button>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Images & Key Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                            {property.images && property.images.length > 0 && property.images[0]?.url ? (
                                <Image
                                    src={property.images[0].url}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <span className="text-lg">No image available</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge variant={property.status === "VACANT" ? "secondary" : "default"} className="text-lg px-3 py-1">
                                    {property.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Image Gallery (thumbnails if multiple) */}
                        {property.images && property.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {property.images.slice(1, 5).map((img, index) => (
                                    <div key={img.id} className="aspect-video relative rounded-md overflow-hidden bg-muted">
                                        <Image
                                            src={img.url}
                                            alt={`${property.title} - ${index + 2}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">About this property</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {property.description}
                            </p>
                        </div>

                        {/* Features */}
                        {property.features && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Features</h2>
                                <div className="flex flex-wrap gap-2">
                                    {property.features.split(',').map((feature, i) => (
                                        <Badge key={i} variant="outline" className="px-3 py-1 bg-background">
                                            {feature.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Key Details & Contact Card */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">{property.title}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                                    <span className="text-lg">{property.location}</span>
                                </div>
                                <div className="text-4xl font-bold text-primary mt-4">
                                    ${property.price.toLocaleString()}<span className="text-xl text-muted-foreground font-normal">/mo</span>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Bedrooms</span>
                                            <div className="flex items-center gap-2 font-semibold text-lg">
                                                <Bed className="h-5 w-5" />
                                                {property.bedrooms}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Bathrooms</span>
                                            <div className="flex items-center gap-2 font-semibold text-lg">
                                                <Bath className="h-5 w-5" />
                                                {property.bathrooms}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Square Feet</span>
                                            <div className="flex items-center gap-2 font-semibold text-lg">
                                                <Move className="h-5 w-5" />
                                                {property.squareFeet.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Type</span>
                                            <div className="flex items-center gap-2 font-semibold text-lg">
                                                <span className="capitalize">{property.type.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">Interested?</h3>
                                    <Button className="w-full" size="lg">Schedule a Tour</Button>
                                    <Button variant="outline" className="w-full" size="lg">Contact Agent</Button>

                                    <div className="pt-4 mt-4 border-t flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="bg-muted p-2 rounded-full">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p>Listed by</p>
                                            <p className="font-medium text-foreground">{property.owner?.name || "Management"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                                        <Calendar className="h-3 w-3" />
                                        Listed on {format(new Date(property.createdAt), "PPP")}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-muted py-8 text-center text-sm text-muted-foreground mt-12">
                <div className="container mx-auto">
                    &copy; {new Date().getFullYear()} PropManage System. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
