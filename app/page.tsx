import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/auth/login");
  }

  // If authenticated, redirect to dashboard based on role
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/client");
  }
}
