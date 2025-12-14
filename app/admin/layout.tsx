import { AdminSidebar } from "@/components/admin/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header can go here if needed */}
                <main className="flex-1 overflow-hidden p-6">
                    <ScrollArea className="h-full">
                        {children}
                    </ScrollArea>
                </main>
            </div>
        </div>
    );
}
