/**
 * Dedicated reusable PDF export engine using html2canvas-pro and jsPDF.
 * Captures the actual rendered off-screen unscaled A4 ResumeDocument element
 * with deterministic A4 page break handling so blocks are not sliced mid-line.
 */

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_PX = 794; // 210mm at 96 DPI
export const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI

export function buildCandidateFilename(fullName: string): string {
  const cleaned = (fullName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_');
  return `${cleaned || 'Candidate'}_Resume.pdf`;
}

async function waitForImagesAndFonts(container: HTMLElement): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const onFinish = () => {
            img.removeEventListener('load', onFinish);
            img.removeEventListener('error', onFinish);
            resolve();
          };
          img.addEventListener('load', onFinish);
          img.addEventListener('error', onFinish);
        })
    )
  );

  // Allow one animation frame for layout paint stabilization
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Computes safe vertical split offsets (in CSS px relative to container top)
 * so multipage resumes break cleanly between [data-pdf-block] elements instead of slicing text.
 */
function computePageSlices(container: HTMLElement, totalHeightPx: number): Array<{ topPx: number; heightPx: number }> {
  const pageHeight = A4_HEIGHT_PX;
  if (totalHeightPx <= pageHeight + 8) {
    return [{ topPx: 0, heightPx: Math.max(totalHeightPx, pageHeight) }];
  }

  const containerRect = container.getBoundingClientRect();
  const blocks = Array.from(container.querySelectorAll<HTMLElement>('[data-pdf-block]'));
  const blockBounds = blocks
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top - containerRect.top),
        bottom: Math.round(rect.bottom - containerRect.top),
        height: Math.round(rect.height),
      };
    })
    .filter((b) => b.height > 8 && b.height < pageHeight * 0.75)
    .sort((a, b) => a.top - b.top);

  const slices: Array<{ topPx: number; heightPx: number }> = [];
  let currentTop = 0;

  while (currentTop < totalHeightPx - 12) {
    const remaining = totalHeightPx - currentTop;
    if (remaining <= pageHeight + 8) {
      slices.push({ topPx: currentTop, heightPx: remaining });
      break;
    }

    const idealCut = currentTop + pageHeight;
    let safeCut = idealCut;

    // Check if any atomic block straddles idealCut
    const straddlingBlock = blockBounds.find(
      (b) => b.top < idealCut - 4 && b.bottom > idealCut + 4 && b.top > currentTop + 140
    );

    if (straddlingBlock) {
      safeCut = Math.max(currentTop + 200, straddlingBlock.top - 8);
    }

    const sliceHeight = safeCut - currentTop;
    slices.push({ topPx: currentTop, heightPx: sliceHeight });
    currentTop = safeCut;
  }

  return slices;
}

export async function exportResumeToPdf(
  exportElement: HTMLElement,
  candidateName: string
): Promise<{ filename: string; pageCount: number }> {
  if (!exportElement) {
    throw new Error('Export container element is not mounted.');
  }

  await waitForImagesAndFonts(exportElement);

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const naturalWidth = A4_WIDTH_PX;
  const measuredHeight = Math.max(exportElement.scrollHeight, exportElement.offsetHeight, A4_HEIGHT_PX);
  const scale = 2; // Crisp 2x retina capture

  const fullCanvas = await html2canvas(exportElement, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    width: naturalWidth,
    height: measuredHeight,
    windowWidth: naturalWidth,
    windowHeight: measuredHeight,
    logging: false,
  });

  const slices = computePageSlices(exportElement, measuredHeight);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Sample bottom-left pixel so sidebar templates maintain continuous sidebar background color on page 2+
  const fullCtx = fullCanvas.getContext('2d');
  let leftEdgeColor = '#FFFFFF';
  if (fullCtx) {
    const pixel = fullCtx.getImageData(16 * scale, (measuredHeight - 10) * scale, 1, 1).data;
    if (pixel[3] > 0) {
      leftEdgeColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    }
  }

  for (let i = 0; i < slices.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const slice = slices[i];
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = naturalWidth * scale;
    pageCanvas.height = A4_HEIGHT_PX * scale;

    const pageCtx = pageCanvas.getContext('2d');
    if (!pageCtx) {
      throw new Error('Could not initialize 2D canvas context for PDF page generation.');
    }

    // Fill page background white
    pageCtx.fillStyle = '#FFFFFF';
    pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // If the template has a colored left sidebar (like Modern Professional), extend sidebar background to bottom of page
    if (leftEdgeColor !== 'rgb(255, 255, 255)' && leftEdgeColor !== '#FFFFFF') {
      const sidebarEl = exportElement.querySelector<HTMLElement>('[data-pdf-sidebar]');
      if (sidebarEl) {
        const sidebarWidthPx = sidebarEl.offsetWidth;
        pageCtx.fillStyle = leftEdgeColor;
        pageCtx.fillRect(0, 0, sidebarWidthPx * scale, pageCanvas.height);
      }
    }

    const sourceY = Math.round(slice.topPx * scale);
    const sourceH = Math.min(
      Math.round(slice.heightPx * scale),
      fullCanvas.height - sourceY
    );

    if (sourceH > 0) {
      pageCtx.drawImage(
        fullCanvas,
        0,
        sourceY,
        fullCanvas.width,
        sourceH,
        0,
        0,
        pageCanvas.width,
        sourceH
      );
    }

    const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(pageDataUrl, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
  }

  const filename = buildCandidateFilename(candidateName);
  pdf.save(filename);

  return {
    filename,
    pageCount: slices.length,
  };
}
