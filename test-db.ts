import { db } from './lib/db'

async function main() {
    console.log('Connecting to DB...')
    try {
        const count = await db.user.count()
        console.log('Successfully connected! User count:', count)
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await db.$disconnect()
    }
}

main()
