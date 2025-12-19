"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, DollarSign, Building2, Wrench, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReportsListProps {
    analytics: {
        properties: any;
        maintenance: any;
        financial: any;
        clients: any;
    };
}

const reportTypes = [
    {
        id: "properties",
        title: "Properties Report",
        description: "Complete list of all properties with details, status, and occupancy",
        icon: Building2,
        formats: ["CSV", "PDF"],
        endpoint: "/api/reports/properties"
    },
    {
        id: "maintenance",
        title: "Maintenance Report",
        description: "All maintenance requests with status, priority, and assignment details",
        icon: Wrench,
        formats: ["CSV", "PDF"],
        endpoint: "/api/reports/maintenance"
    },
    {
        id: "financial",
        title: "Financial Report",
        description: "Revenue, invoices, payments, and outstanding balances",
        icon: DollarSign,
        formats: ["CSV", "PDF"],
        endpoint: "/api/reports/financial"
    },
    {
        id: "clients",
        title: "Clients Report",
        description: "All clients with their properties, contact information, and status",
        icon: Users,
        formats: ["CSV", "PDF"],
        endpoint: "/api/reports/clients"
    },
    {
        id: "monthly-summary",
        title: "Monthly Summary",
        description: "Comprehensive monthly overview of all metrics and activities",
        icon: Calendar,
        formats: ["PDF"],
        endpoint: "/api/reports/monthly-summary"
    }
];

export function ReportsList({ analytics }: ReportsListProps) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (reportId: string, format: string) => {
        const report = reportTypes.find(r => r.id === reportId);
        if (!report) return;

        setDownloading(`${reportId}-${format}`);
        
        try {
            const response = await fetch(`${report.endpoint}?format=${format.toLowerCase()}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to generate report");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${report.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Available Reports</h2>
                <p className="text-muted-foreground">
                    Select a report type and download in your preferred format
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {reportTypes.map((report) => {
                    const Icon = report.icon;
                    return (
                        <Card key={report.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{report.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {report.formats.map((format) => (
                                        <Button
                                            key={format}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload(report.id, format)}
                                            disabled={downloading === `${report.id}-${format}`}
                                            className="gap-2"
                                        >
                                            {downloading === `${report.id}-${format}` ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="h-4 w-4" />
                                                    Download {format}
                                                </>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

