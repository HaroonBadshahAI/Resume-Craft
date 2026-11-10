import {
  ExtractedDocumentResult,
  MAX_IMPORT_FILE_SIZE_BYTES,
  normalizeExtractedLine,
  extractTextFromPdfBuffer,
} from './pdf-extractor';

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&bull;/gi, '•')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Parses Mammoth's semantic HTML output into clean structured lines,
 * preserving bullet lists, headings, table cells, and hyperlinks.
 * Works identically in browser and Node.js (for unit tests).
 */
export function parseMammothHtmlToLines(html: string): {
  lines: string[];
  extractedLinks: string[];
  hasTables: boolean;
  candidatePhotoDataUrl?: string;
} {
  const extractedLinks = new Set<string>();
  const hasTables = /<table[\s>]/i.test(html);

  // Extract href links
  const hrefRegex = /<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>/gi;
  let hrefMatch: RegExpExecArray | null;
  while ((hrefMatch = hrefRegex.exec(html)) !== null) {
    const href = decodeHtmlEntities(hrefMatch[1].trim());
    if (href && !href.startsWith('#')) {
      extractedLinks.add(href);
    }
  }

  // Check for embedded images: only consider if there is exactly 1 image of portrait-viable size
  const imgRegex = /<img\b[^>]*?\bsrc=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    images.push(imgMatch[1]);
  }

  let candidatePhotoDataUrl: string | undefined;
  if (images.length === 1) {
    const dataUrl = images[0];
    // Approximate byte length from base64 length: must be > 1.5KB (not a tiny bullet/icon) and < 500KB
    const base64Part = dataUrl.split(',')[1] || '';
    const approxBytes = Math.floor((base64Part.length * 3) / 4);
    if (approxBytes >= 1500 && approxBytes <= 500 * 1024) {
      candidatePhotoDataUrl = dataUrl;
    }
  }

  // Convert structural HTML tags into line breaks and bullet markers before stripping tags
  let processed = html
    // Remove img, script, style tags
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Convert list items to explicit bullet lines
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '\n')
    // Convert table cells within a row to pipe-separated segments, and rows to newlines
    .replace(/<\/t[dh]>\s*<t[dh]\b[^>]*>/gi, ' | ')
    .replace(/<\/tr>/gi, '\n')
    // Convert block elements and line breaks to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol|table|blockquote|section)>/gi, '\n')
    .replace(/<(p|div|h[1-6]|tr)\b[^>]*>/gi, '\n');

  // Strip remaining HTML tags
  processed = processed.replace(/<[^>]+>/g, '');
  processed = decodeHtmlEntities(processed);

  const rawLines = processed.split(/\r?\n/);
  const lines: string[] = [];

  for (const raw of rawLines) {
    // Clean up empty pipe separators from empty table cells
    const cleanedPipes = raw
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' | ');
    const normalized = normalizeExtractedLine(cleanedPipes);
    if (normalized) {
      lines.push(normalized);
    }
  }

  return {
    lines,
    extractedLinks: Array.from(extractedLinks),
    hasTables,
    candidatePhotoDataUrl,
  };
}

/**
 * Extracts structured text lines, links, and metadata from a DOCX ArrayBuffer.
 */
export async function extractTextFromDocxBuffer(
  buffer: ArrayBuffer,
  fileName = 'resume.docx'
): Promise<ExtractedDocumentResult> {
  if (!buffer || buffer.byteLength === 0) {
    return {
      success: false,
      fileType: 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 1,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'EMPTY_FILE',
      errorMessage: 'The uploaded Word document is empty (0 bytes).',
    };
  }

  if (buffer.byteLength > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      success: false,
      fileType: 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 1,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'FILE_TOO_LARGE',
      errorMessage:
        'File size exceeds the 10 MB limit. Please upload a DOCX file smaller than 10 MB.',
    };
  }

  // Verify ZIP signature PK\x03\x04 (modern .docx files are OpenXML ZIP containers)
  const uint8 = new Uint8Array(buffer.slice(0, 8));
  const isZipHeader =
    uint8.length >= 4 &&
    uint8[0] === 0x50 &&
    uint8[1] === 0x4b &&
    uint8[2] === 0x03 &&
    uint8[3] === 0x04;

  // Check for legacy OLE2 .doc binary signature D0 CF 11 E0
  const isLegacyDocHeader =
    uint8.length >= 4 &&
    uint8[0] === 0xd0 &&
    uint8[1] === 0xcf &&
    uint8[2] === 0x11 &&
    uint8[3] === 0xe0;

  if (isLegacyDocHeader) {
    return {
      success: false,
      fileType: 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'UNSUPPORTED_FORMAT',
      errorMessage:
        'Legacy Microsoft Word (.doc) binary files are not supported. Please save your resume as a modern Word (.docx) or PDF (.pdf) file.',
    };
  }

  if (!isZipHeader) {
    return {
      success: false,
      fileType: 'docx',
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
        'This file is not a valid Word (.docx) document. Please upload an uncorrupted .docx or .pdf file.',
    };
  }

  try {
    let htmlValue = '';
    let rawValue = '';

    if (typeof window !== 'undefined') {
      // Browser environment: use Mammoth's official self-contained browser build
      const mammothBrowserMod = await import('mammoth/mammoth.browser');
      const mammothBrowser = mammothBrowserMod.default || mammothBrowserMod;
      const htmlRes = await mammothBrowser.convertToHtml({ arrayBuffer: buffer });
      htmlValue = htmlRes.value || '';
      if (!htmlValue.trim()) {
        const rawRes = await mammothBrowser.extractRawText({ arrayBuffer: buffer });
        rawValue = rawRes.value || '';
      }
    } else {
      // Node.js test environment
      const mammothMod = await import('mammoth');
      const mammoth = mammothMod.default || mammothMod;
      const nodeBuffer = Buffer.from(buffer);
      const htmlRes = await mammoth.convertToHtml({ buffer: nodeBuffer });
      htmlValue = htmlRes.value || '';
      if (!htmlValue.trim()) {
        const rawRes = await mammoth.extractRawText({ buffer: nodeBuffer });
        rawValue = rawRes.value || '';
      }
    }

    const parsed = parseMammothHtmlToLines(htmlValue);

    let lines = parsed.lines;
    if (lines.length === 0 && rawValue) {
      lines = rawValue
        .split(/\r?\n/)
        .map((l) => normalizeExtractedLine(l))
        .filter(Boolean);
    }

    const rawText = lines.join('\n').trim();
    const alphaNumericCount = rawText.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').length;

    if (alphaNumericCount < 15) {
      return {
        success: false,
        fileType: 'docx',
        fileName,
        lines: [],
        rawText: '',
        pageCount: 1,
        hasComplexLayout: parsed.hasTables,
        hasTables: parsed.hasTables,
        extractedLinks: [],
        photoNotice: 'Profile photo not imported. You can upload one manually.',
        errorCode: 'SCANNED_IMAGE_ONLY',
        errorMessage:
          'No readable text could be extracted from this Word document. Please ensure your resume contains selectable text rather than only scanned images.',
      };
    }

    return {
      success: true,
      fileType: 'docx',
      fileName,
      lines,
      rawText,
      pageCount: 1,
      hasComplexLayout: parsed.hasTables,
      hasTables: parsed.hasTables,
      extractedLinks: parsed.extractedLinks,
      extractedPhotoDataUrl: parsed.candidatePhotoDataUrl,
      photoNotice: parsed.candidatePhotoDataUrl
        ? 'Embedded portrait photo detected and imported.'
        : 'Profile photo not imported. You can upload one manually.',
    };
  } catch {
    return {
      success: false,
      fileType: 'docx',
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
        'Could not read this Word (.docx) document. The file may be corrupted or encrypted.',
    };
  }
}

/**
 * High-level dispatcher that validates file metadata and routes to PDF or DOCX extraction.
 */
export async function extractResumeFile(file: File): Promise<ExtractedDocumentResult> {
  const fileName = file.name || 'resume';
  const lowerName = fileName.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (lowerName.endsWith('.doc') || mime === 'application/msword') {
    return {
      success: false,
      fileType: 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'UNSUPPORTED_FORMAT',
      errorMessage:
        'Legacy .doc files are not supported. Please save your document as a .docx or .pdf file and try again.',
    };
  }

  const isPdf = lowerName.endsWith('.pdf') || mime === 'application/pdf';
  const isDocx =
    lowerName.endsWith('.docx') ||
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPdf && !isDocx) {
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
      errorCode: 'UNSUPPORTED_FORMAT',
      errorMessage:
        'Unsupported file format. Please upload a PDF (.pdf) or Microsoft Word (.docx) resume.',
    };
  }

  if (file.size === 0) {
    return {
      success: false,
      fileType: isPdf ? 'pdf' : 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'EMPTY_FILE',
      errorMessage: 'The selected file is empty (0 bytes).',
    };
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      success: false,
      fileType: isPdf ? 'pdf' : 'docx',
      fileName,
      lines: [],
      rawText: '',
      pageCount: 0,
      hasComplexLayout: false,
      hasTables: false,
      extractedLinks: [],
      photoNotice: 'Profile photo not imported. You can upload one manually.',
      errorCode: 'FILE_TOO_LARGE',
      errorMessage:
        'File exceeds the 10 MB maximum size limit. Please choose a file under 10 MB.',
    };
  }

  const buffer = await file.arrayBuffer();
  if (isPdf) {
    return extractTextFromPdfBuffer(buffer, fileName);
  }
  return extractTextFromDocxBuffer(buffer, fileName);
}
