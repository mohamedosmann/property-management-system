"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronRight, User, Home, CreditCard, FileText } from "lucide-react";
// import { toast } from "@/components/ui/use-toast";

type Step = "client" | "property" | "billing" | "review";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("client");
    const [isLoading, setIsLoading] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPassword: "password123", // Default for demo
        propertyId: "",
        rentAmount: "",
        billingDay: "1",
    });

    // Mock Data (Replace with API calls later)
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        // Fetch available properties
        async function fetchProperties() {
            try {
                const res = await fetch('/api/properties?status=VACANT');
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);
                } else {
                    // Fallback for demo if API fails/empty
                    setProperties([
                        { id: "prop_1", title: "Sunset Apartments 101", price: 1200 },
                        { id: "prop_2", title: "Downtown Loft 4B", price: 2500 },
                    ]);
                }
            } catch (e) {
                console.error("Failed to fetch properties", e);
                setProperties([
                    { id: "prop_1", title: "Sunset Apartments 101", price: 1200 },
                    { id: "prop_2", title: "Downtown Loft 4B", price: 2500 },
                ]);
            }
        }
        fetchProperties();
    }, []);

    const handleNext = () => {
        if (step === "client") setStep("property");
        else if (step === "property") setStep("billing");
        else if (step === "billing") setStep("review");
    };

    const handleBack = () => {
        if (step === "property") setStep("client");
        else if (step === "billing") setStep("property");
        else if (step === "review") setStep("billing");
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/clients/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to onboard client");

            alert("Client Onboarding Complete!");
            router.push("/admin/clients");
        } catch (error) {
            console.error(error);
            alert("Error onboarding client");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Onboarding</h1>
                    <p className="text-muted-foreground">Add a new client and assign them a property.</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8 flex justify-between">
                {["client", "property", "billing", "review"].map((s, i) => (
                    <div key={s} className={`flex flex-col items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step === s ? "border-primary bg-primary/10" : "border-muted"}`}>
                            {i === 0 && <User className="h-5 w-5" />}
                            {i === 1 && <Home className="h-5 w-5" />}
                            {i === 2 && <CreditCard className="h-5 w-5" />}
                            {i === 3 && <FileText className="h-5 w-5" />}
                        </div>
                        <span className="text-sm font-medium capitalize">{s}</span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="capitalize">{step} Details</CardTitle>
                    <CardDescription>Enter the information below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "client" && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Client Name</Label>
                                <Input
                                    id="name"
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.clientEmail}
                                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    value={formData.clientPassword}
                                    onChange={(e) => setFormData({ ...formData, clientPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === "property" && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="property">Select Property</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, propertyId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a vacant property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title} - ${p.price}/mo
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === "billing" && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rent">Monthly Rent</Label>
                                <Input
                                    id="rent"
                                    type="number"
                                    value={formData.rentAmount}
                                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                                    placeholder="2000"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="billingDay">Billing Day (1-28)</Label>
                                <Input
                                    id="billingDay"
                                    type="number"
                                    min="1"
                                    max="28"
                                    value={formData.billingDay}
                                    onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === "review" && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Client Summary</h3>
                                <p className="text-sm text-muted-foreground">Name: {formData.clientName}</p>
                                <p className="text-sm text-muted-foreground">Email: {formData.clientEmail}</p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Lease Details</h3>
                                <p className="text-sm text-muted-foreground">Property ID: {formData.propertyId}</p>
                                <p className="text-sm text-muted-foreground">Monthly Rent: ${formData.rentAmount}</p>
                                <p className="text-sm text-muted-foreground">Billing Day: {formData.billingDay}</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-yellow-800">
                                <CheckCircle2 className="h-5 w-5" />
                                <p className="text-sm">First invoice will be generated automatically upon completion.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step !== "client" ? (
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step === "review" ? (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && "Processing..."}
                            {!isLoading && "Complete Onboarding"}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
