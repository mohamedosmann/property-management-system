import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, DollarSign } from "lucide-react";
import Image from "next/image";

export default async function ClientPropertiesPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const properties = await db.property.findMany({
        where: {
            ownerId: session.user.id
        },
        include: {
            images: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
            </div>

            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10">
                    <p className="text-lg font-medium">No properties found</p>
                    <p className="text-muted-foreground">You don't have any properties assigned to your account yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                        <Card key={property.id} className="overflow-hidden">
                            <div className="aspect-video relative bg-muted">
                                {property.images && property.images.length > 0 && property.images[0]?.url ? (
                                    <Image
                                        src={property.images[0].url}
                                        alt={property.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <Home className="h-10 w-10" />
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
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="line-clamp-1">{property.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${property.price.toLocaleString()}/mo</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
