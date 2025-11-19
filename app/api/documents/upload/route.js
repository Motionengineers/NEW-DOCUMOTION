import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DocumentUploadSchema } from '@/lib/schemas/document-schema';
import { validateBody } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import sanitizeHtml from 'sanitize-html';
import { inferDocumentMetadata } from '@/lib/documents/metadata';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'runtime');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
function basicFileScan(buffer, mimeType) {
  if (mimeType === 'application/pdf') {
    const header = buffer.slice(0, 4).toString('utf8');
    if (!header.startsWith('%PDF')) {
      throw new ApiError(400, 'Invalid PDF file signature');
    }
  }
  const chunk = buffer.slice(0, 512).toString('utf8').toLowerCase();
  if (chunk.includes('<script') || chunk.includes('javascript:')) {
    throw new ApiError(400, 'File appears to contain embedded scripts and was rejected');
  }
}


async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function requireAuth(token) {
  if (!token?.sub) {
    return null;
  }
  return Number(token.sub);
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      throw new ApiError(400, 'No file provided');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, 'Invalid file type. Allowed: PDF, JPEG, PNG');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    basicFileScan(buffer, file.type);
    await ensureUploadDir();

    const sanitizedName = sanitizeHtml(file.name.replace(/\s+/g, '-'));
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/runtime/${fileName}`;
    const documentType = formData.get('type') || 'Other';
    const startupId = formData.get('startupId') ? Number(formData.get('startupId')) : null;
    const notes = formData.get('notes') ? sanitizeHtml(formData.get('notes')) : null;

    // Validate with schema
    const documentData = {
      name: sanitizeHtml(file.name),
      fileUrl: publicUrl,
      type: documentType,
      notes,
      startupId: startupId || 0, // Will be validated by schema
    };

    await validateBody(DocumentUploadSchema, documentData);

    // Get user's startup if startupId not provided
    let finalStartupId = startupId;
    if (!finalStartupId) {
      const startup = await prisma.startup.findFirst({
        where: { userId },
        select: { id: true },
      });
      if (!startup) {
        throw new ApiError(404, 'Startup not found. Please create a startup profile first.');
      }
      finalStartupId = startup.id;
    }

    const metadata = inferDocumentMetadata({
      name: documentData.name,
      type: documentData.type,
      mimeType: file.type,
    });

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        startupId: finalStartupId,
        name: documentData.name,
        fileUrl: documentData.fileUrl,
        type: documentData.type,
        notes: documentData.notes || null,
        metadata,
      },
    });

    logger.info({
      event: 'document_uploaded',
      userId,
      documentId: document.id,
      startupId: finalStartupId,
      fileSize: file.size,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: document.id,
          fileUrl: publicUrl,
          name: document.name,
          type: document.type,
          metadata: document.metadata,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error({
      event: 'document_upload_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
