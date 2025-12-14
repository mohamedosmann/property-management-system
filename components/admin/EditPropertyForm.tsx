"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Property } from "@prisma/client";

import { ImageUpload } from "@/components/admin/ImageUpload";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    type: z.string().min(1, "Type is required"),
    bedrooms: z.coerce.number().int().min(0),
    bathrooms: z.coerce.number().int().min(0),
    squareFeet: z.coerce.number().min(0),
    ownerId: z.string().min(1, "Owner is required"),
    status: z.string().optional(),
    images: z.array(z.string()),
    features: z.string().optional(),
});

interface EditPropertyFormProps {
    property: Property & { images: { url: string }[] };
    clients: { id: string; name: string }[];
}

export function EditPropertyForm({ property, clients }: EditPropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/properties/${property.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete property");
            }

            router.push("/admin/properties");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any, // Cast to any to avoid strict type mismatch with RHF
        defaultValues: {
            title: property.title,
            description: property.description,
            location: property.location,
            price: property.price,
            type: property.type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFeet: property.squareFeet,
            ownerId: property.ownerId,
            status: property.status,
            features: property.features || "",
            images: property.images ? property.images.map((img: { url: string }) => img.url) : [],
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const res = await fetch(`/api/properties/${property.id}`, {
                method: 'PATCH',
                body: JSON.stringify(values),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                router.push('/admin/properties');
                router.refresh();
            } else {
                console.error("Failed to update property");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Luxury Apartment" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Downtown, NY" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price / Rent</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Apartment">Apartment</SelectItem>
                                        <SelectItem value="House">House</SelectItem>
                                        <SelectItem value="Commercial">Commercial</SelectItem>
                                        <SelectItem value="Land">Land</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="VACANT">Vacant</SelectItem>
                                        <SelectItem value="OCCUPIED">Occupied</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bedrooms</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bathrooms</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="squareFeet"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Square Feet</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Property description..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Features (comma separated)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Pool, Gym, WiFi, Parking..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign Owner (Client)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clients.length === 0 ? (
                                        <SelectItem value="none" disabled>No clients found</SelectItem>
                                    ) : (
                                        clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Property Images</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || []}
                                    onChange={(urls) => field.onChange(urls)}
                                    onRemove={(url) => field.onChange(field.value?.filter((current: string) => current !== url))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between items-center mt-6">
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                        Delete Property
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
