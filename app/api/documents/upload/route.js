import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { appendJson } from '@/lib/fileStore';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'runtime');
const STORE_FILE = 'uploadedDocuments.json';

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await ensureUploadDir();

    const sanitizedName = file.name.replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/runtime/${fileName}`;
    const record = {
      id: randomUUID(),
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: formData.get('type') || file.type,
      startupId: formData.get('startupId'),
      createdAt: new Date().toISOString(),
    };

    await appendJson(STORE_FILE, record, []);
    return NextResponse.json({ success: true, fileUrl: publicUrl });
  } catch (error) {
    console.error('POST /api/documents/upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to upload document' },
      { status: 500 }
    );
  }
}
