import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding database with admin user...")

    const adminEmail = "admin@example.com"
    const adminPassword = "admin123"

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (existingAdmin) {
        console.log("✅ Admin user already exists!")
        console.log("📧 Email:", adminEmail)
        return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const admin = await prisma.user.create({
        data: {
            name: "System Administrator",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
        },
    })

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email:", adminEmail)
    console.log("🔑 Password:", adminPassword)
    console.log("👤 User ID:", admin.id)
    console.log("\n🚀 You can now login with these credentials at http://localhost:3000")
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
