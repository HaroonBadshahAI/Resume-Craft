// Ensure Promise.try (ES2025 used internally by pdfjs-dist v6) is available in all JS/Node runtimes
if (typeof (Promise as unknown as { try?: unknown }).try !== 'function') {
  (
    Promise as unknown as {
      try: <T>(
        fn: (...args: unknown[]) => T | PromiseLike<T>,
        ...args: unknown[]
      ) => Promise<T>;
    }
  ).try = function <T>(
    fn: (...args: unknown[]) => T | PromiseLike<T>,
    ...args: unknown[]
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(fn(...args));
      } catch (err) {
        reject(err);
      }
    });
  };
}

export interface ExtractedDocumentResult {
  success: boolean;
  fileType: 'pdf' | 'docx';
  fileName: string;
  lines: string[];
  rawText: string;
  pageCount: number;
  hasComplexLayout: boolean;
  hasTables: boolean;
  extractedLinks: string[];
  extractedPhotoDataUrl?: string;
  photoNotice: string;
  errorCode?:
    | 'UNSUPPORTED_FORMAT'
    | 'FILE_TOO_LARGE'
    | 'EMPTY_FILE'
    | 'PASSWORD_PROTECTED'
    | 'CORRUPTED_FILE'
    | 'SCANNED_IMAGE_ONLY'
    | 'EXTRACTION_FAILED';
  errorMessage?: string;
}

export const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface PositionedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const BULLET_CHAR_REGEX = /^[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\uF0B7\uF0A7\u25A0*▪▫●◦‣⁃]\s*/;

/**
 * Normalizes whitespace and standardizes common PDF/Word bullet characters.
 */
export function normalizeExtractedLine(rawLine: string): string {
  const cleaned = rawLine
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\t+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!cleaned) return '';

  if (BULLET_CHAR_REGEX.test(cleaned)) {
    return `• ${cleaned.replace(BULLET_CHAR_REGEX, '').trim()}`;
  }
  return cleaned;
}

/**
 * Groups positioned text items into horizontal lines sorted top-to-bottom, left-to-right.
 */
function reconstructLinesFromItems(items: PositionedTextItem[]): string[] {
  if (items.length === 0) return [];

  // Sort primarily by descending Y (top to bottom in PDF coordinate space), then ascending X
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3.5) return yDiff;
    return a.x - b.x;
  });

  const lineGroups: PositionedTextItem[][] = [];
  for (const item of sorted) {
    const lastGroup = lineGroups[lineGroups.length - 1];
    if (!lastGroup) {
      lineGroups.push([item]);
      continue;
    }
    const avgY =
      lastGroup.reduce((sum, entry) => sum + entry.y, 0) / lastGroup.length;
    const tolerance = Math.max(4, (item.height || 10) * 0.45);
    if (Math.abs(item.y - avgY) <= tolerance) {
      lastGroup.push(item);
    } else {
      lineGroups.push([item]);
    }
  }

  const lines: string[] = [];
  for (const group of lineGroups) {
    group.sort((a, b) => a.x - b.x);
    let lineText = '';
    let prevEnd = -Infinity;

    for (const part of group) {
      const text = part.str;
      if (!text) continue;

      if (prevEnd !== -Infinity) {
        const gap = part.x - prevEnd;
        if (gap > 25) {
          // Large horizontal tab gap within a single column (e.g. Job Title ...... Jan 2022 - Present)
          lineText += '   ';
        } else if (gap > 2 && !lineText.endsWith(' ') && !text.startsWith(' ')) {
          lineText += ' ';
        }
      }
      lineText += text;
      prevEnd = part.x + Math.max(part.width, text.length * 4);
    }

    const normalized = normalizeExtractedLine(lineText);
    if (normalized) {
      lines.push(normalized);
    }
  }

  return lines;
}

/**
 * Detects whether a page's positioned text items represent a two-column resume layout,
 * and if so, separates full-width top header items from left-column and right-column items
 * so columns are never interleaved horizontally.
 */
function extractPageLinesAvoidingColumnMix(
  items: PositionedTextItem[],
  pageWidth: number
): { lines: string[]; isMultiColumn: boolean } {
  const nonEmpty = items.filter((item) => item.str.trim().length > 0);
  if (nonEmpty.length === 0) {
    return { lines: [], isMultiColumn: false };
  }

  // Test candidate vertical gutter positions between 28% and 68% of page width
  const minGutterX = pageWidth * 0.28;
  const maxGutterX = pageWidth * 0.68;
  const step = Math.max(8, pageWidth * 0.02);

  let bestGutterX: number | null = null;
  let bestScore = 0;

  for (let gx = minGutterX; gx <= maxGutterX; gx += step) {
    let leftCount = 0;
    let rightCount = 0;
    let crossingCount = 0;

    for (const item of nonEmpty) {
      const itemStart = item.x;
      const itemEnd = item.x + Math.max(item.width, item.str.length * 4.2);

      if (itemStart < gx - 8 && itemEnd > gx + 12) {
        crossingCount++;
      } else if (itemEnd <= gx + 12) {
        leftCount++;
      } else if (itemStart >= gx - 8) {
        rightCount++;
      }
    }

    // A genuine two-column page has substantial items on both sides and very few crossing items
    if (
      leftCount >= 8 &&
      rightCount >= 8 &&
      crossingCount <= Math.max(4, nonEmpty.length * 0.08)
    ) {
      const balanceScore = Math.min(leftCount, rightCount) - crossingCount * 3;
      if (balanceScore > bestScore) {
        bestScore = balanceScore;
        bestGutterX = gx;
      }
    }
  }

  if (bestGutterX === null) {
    return {
      lines: reconstructLinesFromItems(nonEmpty),
      isMultiColumn: false,
    };
  }

  // Find the highest Y where left and right columns coexist; items above that crossing the gutter are top header banner
  const gutterX = bestGutterX;
  const headerItems: PositionedTextItem[] = [];
  const leftItems: PositionedTextItem[] = [];
  const rightItems: PositionedTextItem[] = [];

  for (const item of nonEmpty) {
    const itemStart = item.x;
    const itemEnd = item.x + Math.max(item.width, item.str.length * 4.2);

    if (itemStart < gutterX - 8 && itemEnd > gutterX + 12) {
      headerItems.push(item);
    } else if (itemEnd <= gutterX + 12) {
      leftItems.push(item);
    } else {
      rightItems.push(item);
    }
  }

  const headerLines = reconstructLinesFromItems(headerItems);
  const leftLines = reconstructLinesFromItems(leftItems);
  const rightLines = reconstructLinesFromItems(rightItems);

  return {
    lines: [...headerLines, ...leftLines, ...rightLines],
    isMultiColumn: true,
  };
}

let workerInitialized = false;

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (typeof window !== 'undefined' && !workerInitialized) {
    try {
      const workerUrl = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      workerInitialized = true;
    } catch {
      // Fallback if URL construction fails in non-standard environment
    }
  }
  return pdfjs;
}

/**
 * Extracts structured text lines, links, and layout metadata from a PDF file buffer.
 */
export async function extractTextFromPdfBuffer(
  buffer: ArrayBuffer,
  fileName = 'resume.pdf'
): Promise<ExtractedDocumentResult> {
  if (!buffer || buffer.byteLength === 0) {
    return {
      success: false,
      fileType: 'pdf',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'EMPTY_FILE',
      errorMessage: 'The uploaded PDF file is empty (0 bytes). Please choose a valid PDF resume.',
    };
  }

  if (buffer.byteLength > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      success: false,
      fileType: 'pdf',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: 'File size exceeds the 10 MB limit. Please upload a PDF smaller than 10 MB.',
    };
  }

  try {
    const pdfjs = await loadPdfJs();
    const uint8 = new Uint8Array(buffer.slice(0));

    // Quick header sanity check for %PDF-
    const headerAscii = String.fromCharCode(...uint8.slice(0, 5));
    if (!headerAscii.startsWith('%PDF')) {
      return {
        success: false,
        fileType: 'pdf',
        fileName,
        lines: [],
        rawText: '',
        pageCount: 0,
        hasComplexLayout: false,
        hasTables: false,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'CORRUPTED_FILE',
        errorMessage:
          'This file does not appear to be a valid PDF document. Please upload a valid .pdf or .docx resume.',
      };
    }

    const loadingTask = pdfjs.getDocument({
      data: uint8,
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      await loadingTask.destroy().catch(() => {});
      return {
        success: false,
        fileType: 'pdf',
        fileName,
        lines: [],
        rawText: '',
        pageCount: 0,
        hasComplexLayout: false,
        hasTables: false,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'EMPTY_FILE',
        errorMessage: 'The PDF contains no pages.',
      };
    }

    const allLines: string[] = [];
    const extractedLinks = new Set<string>();
    let hasComplexLayout = false;

    try {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();

        const positionedItems: PositionedTextItem[] = [];
        for (const rawItem of textContent.items) {
          if ('str' in rawItem && typeof rawItem.str === 'string') {
            const transform = rawItem.transform || [1, 0, 0, 1, 0, 0];
            positionedItems.push({
              str: rawItem.str,
              x: Number(transform[4]) || 0,
              y: Number(transform[5]) || 0,
              width: Number(rawItem.width) || 0,
              height:
                Number(rawItem.height) || Math.abs(Number(transform[3])) || 10,
            });
          }
        }

        const { lines: pageLines, isMultiColumn } =
          extractPageLinesAvoidingColumnMix(
            positionedItems,
            viewport.width || 612
          );
        if (isMultiColumn) {
          hasComplexLayout = true;
        }

        allLines.push(...pageLines);

        // Extract hyperlink annotations from the PDF page if present
        try {
          const annotations = await page.getAnnotations();
          for (const annot of annotations) {
            if (annot && typeof annot.url === 'string' && annot.url.trim()) {
              extractedLinks.add(annot.url.trim());
            }
          }
        } catch {
          // Ignore annotation read issues
        }
        page.cleanup();
      }
    } finally {
      await loadingTask.destroy().catch(() => {});
    }

    const rawText = allLines.join('\n').trim();
    const alphaNumericCount = rawText.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').length;

    if (alphaNumericCount < 20) {
      return {
        success: false,
        fileType: 'pdf',
        fileName,
        lines: [],
        rawText: '',
        pageCount: numPages,
        hasComplexLayout,
        hasTables: false,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'SCANNED_IMAGE_ONLY',
        errorMessage:
          'Text extraction is unavailable because this PDF appears to be a scanned or image-only document without selectable text. Please upload a text-based PDF or Word (.docx) resume.',
      };
    }

    return {
      success: true,
      fileType: 'pdf',
      fileName,
      lines: allLines,
      rawText,
      pageCount: numPages,
      hasComplexLayout,
      hasTables: false,
      extractedLinks: Array.from(extractedLinks),
      photoNotice: 'Profile photo not imported. You can upload one manually.',
    };
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : '';
    const errMsg = err instanceof Error ? err.message : String(err);

    if (
      errName === 'PasswordException' ||
      /password|encrypted/i.test(errMsg)
    ) {
      return {
        success: false,
        fileType: 'pdf',
        fileName,
        lines: [],
        rawText: '',
        pageCount: 0,
        hasComplexLayout: false,
        hasTables: false,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'PASSWORD_PROTECTED',
        errorMessage:
          'This PDF is password-protected or encrypted. Please upload an unlocked PDF or DOCX file.',
      };
    }

    if (
      errName === 'InvalidPDFException' ||
      /invalid pdf|corrupted|damaged/i.test(errMsg)
    ) {
      return {
        success: false,
        fileType: 'pdf',
        fileName,
        lines: [],
        rawText: '',
        pageCount: 0,
        hasComplexLayout: false,
        hasTables: false,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'CORRUPTED_FILE',
        errorMessage:
          'The PDF file appears to be corrupted or unreadable. Please export a fresh copy and try again.',
      };
    }

    return {
      success: false,
      fileType: 'pdf',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'EXTRACTION_FAILED',
      errorMessage:
        'Could not read text from this PDF file. Please try uploading a standard text-based PDF or Word (.docx) document.',
    };
  }
}
