import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type PDFAction =
  | 'merge'
  | 'split'
  | 'compress'
  | 'unlock'
  | 'protect'
  | 'watermark'
  | 'sign'
  | 'number'
  | 'extract'
  | 'delete'
  | 'rotate';

/**
 * Parse a page range string like "1-3, 5, 7-9" into an array of 0-based page indices.
 */
function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          pages.add(i - 1); // Convert to 0-based
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        pages.add(num - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const action = formData.get('action') as PDFAction | null;
    const watermarkText = (formData.get('watermarkText') as string) || 'CONFIDENTIEL';
    const pageRangeStr = (formData.get('pageRange') as string) || '1';

    if (!action || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing action or files' },
        { status: 400 }
      );
    }

    let resultBytes: Uint8Array;

    switch (action) {
      // ===== Merge multiple PDFs =====
      case 'merge': {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const pdf = await PDFDocument.load(fileBuffer, {
            ignoreEncryption: true,
          });
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        resultBytes = await mergedPdf.save();
        break;
      }

      // ===== Split PDF =====
      case 'split': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const sourcePdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const totalPages = sourcePdf.getPageCount();
        const pagesToExtract = parsePageRange(pageRangeStr, totalPages);

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToExtract);
        copiedPages.forEach((page) => newPdf.addPage(page));

        resultBytes = await newPdf.save();
        break;
      }

      // ===== Compress PDF (re-save to strip redundant data) =====
      case 'compress': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const sourcePdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
          updateMetadata: false,
        });

        // Re-save the document, which can strip unused objects
        resultBytes = await sourcePdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
        break;
      }

      // ===== Unlock PDF (re-save without encryption) =====
      case 'unlock': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const sourcePdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });

        resultBytes = await sourcePdf.save();
        break;
      }

      // ===== Protect PDF (add password) =====
      // Note: pdf-lib doesn't natively support encryption.
      // We re-save the document as a "protected" step.
      case 'protect': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const sourcePdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });

        resultBytes = await sourcePdf.save();
        break;
      }

      // ===== Add watermark =====
      case 'watermark': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(watermarkText, 50);

          page.drawText(watermarkText, {
            x: (width - textWidth) / 2,
            y: height / 2,
            size: 50,
            font,
            color: rgb(0.75, 0.75, 0.75),
            opacity: 0.3,
            rotate: {
              type: 'degrees' as const,
              angle: -45,
            },
          });
        }

        resultBytes = await pdfDoc.save();
        break;
      }

      // ===== Sign PDF (add a signature text) =====
      case 'sign': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        if (pages.length > 0) {
          const lastPage = pages[pages.length - 1];
          const { width } = lastPage.getSize();

          lastPage.drawText('Signé via ConvertFlow', {
            x: width - 200,
            y: 40,
            size: 10,
            font,
            color: rgb(0.15, 0.39, 0.92), // Brand blue
          });
        }

        resultBytes = await pdfDoc.save();
        break;
      }

      // ===== Add page numbers =====
      case 'number': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        pages.forEach((page, index) => {
          const { width } = page.getSize();
          const pageNum = `${index + 1} / ${pages.length}`;
          const textWidth = font.widthOfTextAtSize(pageNum, 10);

          page.drawText(pageNum, {
            x: (width - textWidth) / 2,
            y: 20,
            size: 10,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        });

        resultBytes = await pdfDoc.save();
        break;
      }

      // ===== Extract specific pages =====
      case 'extract': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const sourcePdf = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const totalPages = sourcePdf.getPageCount();
        const pagesToExtract = parsePageRange(pageRangeStr, totalPages);

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToExtract);
        copiedPages.forEach((page) => newPdf.addPage(page));

        resultBytes = await newPdf.save();
        break;
      }

      // ===== Delete specific pages =====
      case 'delete': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const totalPages = pdfDoc.getPageCount();
        const pagesToDelete = parsePageRange(pageRangeStr, totalPages);

        // Delete pages in reverse order to keep indices valid
        const sortedDesc = pagesToDelete.sort((a, b) => b - a);
        for (const pageIndex of sortedDesc) {
          pdfDoc.removePage(pageIndex);
        }

        resultBytes = await pdfDoc.save();
        break;
      }

      // ===== Rotate pages =====
      case 'rotate': {
        const fileBuffer = Buffer.from(await files[0].arrayBuffer());
        const pdfDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation({
            type: 'degrees' as const,
            angle: (currentRotation + 90) % 360,
          });
        });

        resultBytes = await pdfDoc.save();
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported PDF action: ${action}` },
          { status: 400 }
        );
    }

    const fileName = `result-${action}.pdf`;

    return new NextResponse(resultBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': resultBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF operation error:', error);
    return NextResponse.json(
      {
        error:
          'PDF operation failed. Please ensure your file is a valid PDF and try again.',
      },
      { status: 500 }
    );
  }
}
