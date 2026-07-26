import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const SUPPORTED_IMAGE_FORMATS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
  'gif',
  'tiff',
  'bmp',
]);

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  tiff: 'image/tiff',
  bmp: 'image/bmp',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const format = (formData.get('format') as string)?.toLowerCase() || 'png';
    const qualityStr = formData.get('quality') as string | null;
    const widthStr = formData.get('width') as string | null;
    const heightStr = formData.get('height') as string | null;
    const action = formData.get('action') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Only process image files
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are supported for this endpoint' },
        { status: 400 }
      );
    }

    // Normalize format
    const targetFormat = format === 'jpeg' ? 'jpg' : format;

    if (!SUPPORTED_IMAGE_FORMATS.has(targetFormat)) {
      return NextResponse.json(
        { error: `Unsupported target format: ${targetFormat}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const quality = qualityStr ? parseInt(qualityStr, 10) : 80;
    const width = widthStr ? parseInt(widthStr, 10) : undefined;
    const height = heightStr ? parseInt(heightStr, 10) : undefined;

    // Build sharp pipeline
    let pipeline = sharp(buffer);

    // Resize if dimensions provided (for resize action)
    if (action === 'resize' && width && height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    } else if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Rotate for rotate action
    if (action === 'rotate') {
      pipeline = pipeline.rotate(90);
    }

    // Apply output format with quality settings
    const clampQuality = Math.max(1, Math.min(100, quality));

    switch (targetFormat) {
      case 'png':
        pipeline = pipeline.png({
          quality: clampQuality,
          compressionLevel: Math.floor(((100 - clampQuality) / 100) * 9),
        });
        break;
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: clampQuality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: clampQuality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality: clampQuality });
        break;
      case 'gif':
        pipeline = pipeline.gif();
        break;
      case 'tiff':
        pipeline = pipeline.tiff({ quality: clampQuality });
        break;
      case 'bmp':
        // Sharp doesn't output BMP directly; convert to PNG as fallback
        pipeline = pipeline.png();
        break;
      default:
        pipeline = pipeline.png();
    }

    const outputBuffer = await pipeline.toBuffer();

    const contentType =
      CONTENT_TYPES[targetFormat] || CONTENT_TYPES['png'];

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const extension = targetFormat === 'jpg' ? 'jpg' : targetFormat;

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${baseName}.${extension}"`,
        'Content-Length': outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed. Please check your file and try again.' },
      { status: 500 }
    );
  }
}
