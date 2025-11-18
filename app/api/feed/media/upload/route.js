import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'feed-media');
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function inferExtension(file) {
  const extFromName = path.extname(file.name || '');
  if (extFromName) return extFromName;
  if (file.type === 'image/jpeg') return '.jpg';
  if (file.type === 'image/png') return '.png';
  if (file.type === 'image/webp') return '.webp';
  if (file.type === 'image/gif') return '.gif';
  if (file.type === 'video/mp4') return '.mp4';
  if (file.type === 'video/quicktime') return '.mov';
  if (file.type === 'video/webm') return '.webm';
  return '';
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Max 25MB allowed.' },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Upload images or mp4/mov/webm videos.' },
        { status: 400 }
      );
    }

    await ensureUploadDir();
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = inferExtension(file);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/feed-media/${fileName}`;
    const fileType = file.type?.startsWith('video') ? 'video' : 'image';

    return NextResponse.json({
      success: true,
      fileUrl,
      fileType,
      name: file.name,
      size: file.size,
      id: randomUUID(),
    });
  } catch (error) {
    console.error('POST /api/feed/media/upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to upload media' },
      { status: 500 }
    );
  }
}

