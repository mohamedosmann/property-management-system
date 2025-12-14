"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Building2, Wrench, User, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const navigation = [
    { name: "Dashboard", href: "/client", icon: Home },
    { name: "Properties", href: "/client/properties", icon: Building2 },
    { name: "Maintenance", href: "/client/maintenance", icon: Wrench },
    { name: "Profile", href: "/client/profile", icon: User },
]

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/auth/login" })
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow border-r bg-card">
                    <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
                        <h1 className="text-xl font-bold">PropManage</h1>
                    </div>
                    <ScrollArea className="flex-1 px-3 py-4">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }
                    `}
                                    >
                                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    <Separator />
                    <div className="p-4">
                        <div className="mb-3 text-sm">
                            <div className="font-medium">{session?.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{session?.user?.email}</div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
