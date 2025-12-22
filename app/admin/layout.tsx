import { AdminSidebar } from "@/components/admin/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            <main className="flex-1 ml-72 p-8 pt-6">
                {children}
            </main>
        </div>
    );
}
