import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents');
const MAX_SIZE_BYTES = 250 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'video/quicktime',
]);

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function inferExtension(file) {
  const extFromName = path.extname(file.name || '');
  if (extFromName) return extFromName;
  if (file.type === 'application/pdf') return '.pdf';
  if (file.type === 'image/jpeg') return '.jpg';
  if (file.type === 'image/png') return '.png';
  if (file.type === 'video/mp4') return '.mp4';
  if (file.type === 'video/quicktime') return '.mov';
  return '';
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      throw new ApiError(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const startupId = formData.get('startupId');
    const docType = (formData.get('type') || 'document').toString();
    const name = (formData.get('name') || '').toString();

    if (!file || typeof file === 'string') {
      throw new ApiError(400, 'No file provided');
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new ApiError(400, 'File is too large');
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      throw new ApiError(400, 'Unsupported file type');
    }

    await ensureUploadDir();
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = inferExtension(file);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/documents/${fileName}`;

    let documentRecord = null;
    if (startupId) {
      const parsedStartupId = Number(startupId);
      if (Number.isFinite(parsedStartupId)) {
        documentRecord = await prisma.document.create({
          data: {
            startupId: parsedStartupId,
            name: name || file.name || 'Uploaded document',
            fileUrl,
            type: docType,
            status: 'uploaded',
          },
        });
      }
    }

    logger.info({
      event: 'document_uploaded',
      userId: Number(token.sub),
      startupId: startupId ? Number(startupId) : null,
      fileUrl,
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      url: fileUrl,
      documentId: documentRecord?.id ?? null,
      classification: {
        document_type: docType,
        confidence: 1,
      },
    });
  } catch (error) {
    logger.error({
      event: 'document_upload_error',
      error: error.message,
    });

    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { success: false, error: 'Unable to upload document' },
      { status: 500 }
    );
  }
}
