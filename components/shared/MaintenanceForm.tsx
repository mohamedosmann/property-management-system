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
import { ImageUpload } from "@/components/admin/ImageUpload";

const formSchema = z.object({
    title: z.string().min(5, "Title is too short"),
    description: z.string().min(10, "Description must be detailed"),
    propertyId: z.string().min(1, "Please select a property"),
    priority: z.string().optional(),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
});

interface MaintenanceFormProps {
    properties: { id: string; title: string }[];
    isAdmin?: boolean;
}

export function MaintenanceForm({ properties, isAdmin = false }: MaintenanceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            propertyId: "",
            priority: "MEDIUM",
            category: "GENERAL",
            images: [],
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to submit request");
            }

            router.push(isAdmin ? "/admin/maintenance" : "/client/maintenance");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Leaking faucet..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Property</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select property" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {properties.map(prop => (
                                            <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GENERAL">General</SelectItem>
                                        <SelectItem value="PLUMBING">Plumbing</SelectItem>
                                        <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                                        <SelectItem value="HVAC">HVAC</SelectItem>
                                        <SelectItem value="APPLIANCE">Appliance</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detailed Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Please describe the issue in detail..."
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photos (Proof of damage/issue)</FormLabel>
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

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} size="lg">
                        {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
