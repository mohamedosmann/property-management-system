import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
    try {
        await redis.set('test_key', 'Hello Upstash!')
        const value = await redis.get('test_key')
        return NextResponse.json({ success: true, value })
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
