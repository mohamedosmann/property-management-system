const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("Connected!");

        // Check if users exist
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);

        // Create query to verify write access
        // const user = await prisma.user.create({ ... })

        await prisma.$disconnect();
        console.log("Disconnected.");
    } catch (e) {
        console.error("Error during seed test:", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
