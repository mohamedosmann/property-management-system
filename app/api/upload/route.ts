import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // With a real filesystem we'd likely generate a unique name
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // Ensure the directory exists (Node.js 10+ recursive support for mkdir)
    try {
        await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
    } catch (e) { }

    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url });
}
