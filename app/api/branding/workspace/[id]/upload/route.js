import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/branding/workspace/[id]/upload
 * Upload branding files (text, PDF, DOCX, images) to workspace
 */
export async function POST(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const workspaceId = parseInt(params.id);

    if (Number.isNaN(workspaceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace ID' },
        { status: 400 }
      );
    }

    // Verify workspace belongs to user
    const workspace = await prisma.brandingWorkspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const fileType = file.type;
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Allowed: text, PDF, DOCX, images, spreadsheets',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'branding', workspaceId.toString());
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Determine file type category
    let fileTypeCategory = 'other';
    if (fileType.startsWith('image/')) {
      fileTypeCategory = 'image';
    } else if (fileType === 'application/pdf') {
      fileTypeCategory = 'pdf';
    } else if (fileType.includes('wordprocessingml') || fileType === 'application/msword') {
      fileTypeCategory = 'docx';
    } else if (fileType.includes('spreadsheetml') || fileType === 'application/vnd.ms-excel') {
      fileTypeCategory = 'spreadsheet';
    } else if (fileType === 'text/plain') {
      fileTypeCategory = 'text';
    }

    // Create upload record
    const upload = await prisma.brandingUpload.create({
      data: {
        workspaceId,
        filename: originalName,
        fileType: fileTypeCategory,
        fileSize: file.size,
        url: `/uploads/branding/${workspaceId}/${filename}`,
        parsed: false,
        metadata: JSON.stringify({
          mimeType: fileType,
          uploadedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        upload: {
          id: upload.id,
          filename: upload.filename,
          fileType: upload.fileType,
          fileSize: upload.fileSize,
          url: upload.url,
          parsed: upload.parsed,
        },
        message: 'File uploaded successfully',
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


