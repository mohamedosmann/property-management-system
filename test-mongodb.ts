import { PrismaClient } from '@prisma/client'

const testConnection = async () => {
    console.log('Testing MongoDB connection...')
    console.log('Connection string:', process.env.DATABASE_URL?.substring(0, 50) + '...')

    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    })

    try {
        // Test connection by running a simple query
        await prisma.$connect()
        console.log('✅ Successfully connected to MongoDB!')

        // Test a simple operation
        const userCount = await prisma.user.count()
        console.log(`✅ Database query successful! User count: ${userCount}`)

        await prisma.$disconnect()
        console.log('✅ Connection closed successfully')
    } catch (error) {
        console.error('❌ Connection failed:', error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

testConnection()
