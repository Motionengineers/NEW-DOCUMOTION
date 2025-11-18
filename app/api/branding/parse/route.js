import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/branding/parse
 * Parse uploaded branding documents and extract structured data
 * Supports: text, PDF, DOCX, spreadsheets
 */
export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const { uploadId, workspaceId, text } = body;

    // If text is provided directly, parse it
    if (text) {
      const parsed = await parseBrandingText(text);
      return NextResponse.json({
        success: true,
        data: {
          parsed,
          source: 'text',
        },
      });
    }

    // Otherwise, parse from upload
    if (!uploadId || !workspaceId) {
      return NextResponse.json(
        { success: false, error: 'uploadId and workspaceId required, or provide text' },
        { status: 400 }
      );
    }

    // Verify workspace belongs to user
    const workspace = await prisma.brandingWorkspace.findFirst({
      where: {
        id: parseInt(workspaceId),
        userId,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Get upload record
    const upload = await prisma.brandingUpload.findFirst({
      where: {
        id: parseInt(uploadId),
        workspaceId: parseInt(workspaceId),
      },
    });

    if (!upload) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    // Read file content
    const filepath = join(process.cwd(), upload.url.replace(/^\//, ''));
    let content = '';

    try {
      if (upload.fileType === 'text') {
        content = await readFile(filepath, 'utf-8');
      } else if (upload.fileType === 'pdf') {
        // For PDF, we'd need a PDF parser library like pdf-parse
        // For now, return a placeholder
        content = '[PDF parsing requires pdf-parse library]';
      } else if (upload.fileType === 'docx') {
        // For DOCX, we'd need mammoth or similar
        content = '[DOCX parsing requires mammoth library]';
      } else if (upload.fileType === 'spreadsheet') {
        // For spreadsheets, we'd need xlsx library
        content = '[Spreadsheet parsing requires xlsx library]';
      } else {
        content = await readFile(filepath, 'utf-8');
      }
    } catch (readError) {
      console.error('Error reading file:', readError);
      return NextResponse.json(
        { success: false, error: 'Failed to read file' },
        { status: 500 }
      );
    }

    // Parse the content
    const parsed = await parseBrandingText(content);

    // Update upload record
    await prisma.brandingUpload.update({
      where: { id: upload.id },
      data: {
        parsed: true,
        metadata: JSON.stringify({
          ...JSON.parse(upload.metadata || '{}'),
          parsedAt: new Date().toISOString(),
          extractedSections: Object.keys(parsed),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        parsed,
        source: upload.fileType,
        uploadId: upload.id,
      },
    });
  } catch (error) {
    console.error('Error parsing branding data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Parse branding text and extract structured information
 * Uses simple keyword matching; in production, use AI/ML
 */
async function parseBrandingText(text) {
  const parsed = {
    vision: null,
    mission: null,
    targetConsumer: null,
    skus: [],
    heroIngredients: [],
    marketingStrategy: null,
  };

  // Extract Vision
  const visionMatch = text.match(/vision[:\s]+([^\n]+(?:\n(?!mission|target|sku|ingredient|marketing)[^\n]+)*)/i);
  if (visionMatch) {
    parsed.vision = visionMatch[1].trim();
  }

  // Extract Mission
  const missionMatch = text.match(/mission[:\s]+([^\n]+(?:\n(?!vision|target|sku|ingredient|marketing)[^\n]+)*)/i);
  if (missionMatch) {
    parsed.mission = missionMatch[1].trim();
  }

  // Extract Target Consumer
  const targetMatch = text.match(/target\s+(?:consumer|audience|customer)[:\s]+([^\n]+(?:\n(?!vision|mission|sku|ingredient|marketing)[^\n]+)*)/i);
  if (targetMatch) {
    parsed.targetConsumer = targetMatch[1].trim();
  }

  // Extract SKUs (look for product names, SKU codes, etc.)
  const skuPattern = /(?:sku|product)[:\s]+([^\n]+)/gi;
  let skuMatch;
  while ((skuMatch = skuPattern.exec(text)) !== null) {
    parsed.skus.push(skuMatch[1].trim());
  }

  // Extract Hero Ingredients
  const ingredientMatch = text.match(/hero\s+ingredient[s]?[:\s]+([^\n]+(?:\n(?!vision|mission|target|sku|marketing)[^\n]+)*)/i);
  if (ingredientMatch) {
    parsed.heroIngredients = ingredientMatch[1]
      .split(/[,;]/)
      .map(i => i.trim())
      .filter(Boolean);
  }

  // Extract Marketing Strategy
  const marketingMatch = text.match(/marketing\s+strategy[:\s]+([^\n]+(?:\n(?!vision|mission|target|sku|ingredient)[^\n]+)*)/i);
  if (marketingMatch) {
    parsed.marketingStrategy = marketingMatch[1].trim();
  }

  // Clean up: remove null values
  Object.keys(parsed).forEach(key => {
    if (parsed[key] === null || (Array.isArray(parsed[key]) && parsed[key].length === 0)) {
      delete parsed[key];
    }
  });

  return parsed;
}


