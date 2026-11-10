import React, { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../lib/resume/store';
import { ResumeDocument } from './ResumeDocument';
import { ATSScore } from './ATSScore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../lib/resume/pdf-export';
import { TEMPLATE_DEFINITIONS, TemplateId } from '../../lib/resume/types';
import { ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

export const ResumePreview: React.FC = () => {
  const resume = useResumeStore((s) => s.resume);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  const viewportRef = useRef<HTMLDivElement>(null);
  const liveDocRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState<number>(0.78);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [docHeight, setDocHeight] = useState<number>(A4_HEIGHT_PX);

  // Measure available width to auto-scale A4 preview smoothly
  useEffect(() => {
    const updateScale = () => {
      if (!viewportRef.current || !autoFit) return;
      const availableWidth = viewportRef.current.clientWidth - 48; // padding
      if (availableWidth > 240) {
        const computed = Math.min(1, Math.max(0.38, availableWidth / A4_WIDTH_PX));
        setScale(Number(computed.toFixed(2)));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [autoFit]);

  // Track natural document height so wrapper height matches scaled A4 document
  useEffect(() => {
    if (!liveDocRef.current) return;
    const measure = () => {
      if (liveDocRef.current) {
        setDocHeight(Math.max(A4_HEIGHT_PX, liveDocRef.current.scrollHeight));
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(liveDocRef.current);
    return () => observer.disconnect();
  }, [resume]);

  const pageCount = Math.max(1, Math.ceil((docHeight - 12) / A4_HEIGHT_PX));

  const handleZoomOut = () => {
    setAutoFit(false);
    setScale((prev) => Math.max(0.4, Number((prev - 0.08).toFixed(2))));
  };

  const handleZoomIn = () => {
    setAutoFit(false);
    setScale((prev) => Math.min(1.15, Number((prev + 0.08).toFixed(2))));
  };

  const handleResetZoom = () => {
    setAutoFit(true);
  };

  return (
    <div
      data-testid="resume-preview-panel"
      className="relative min-h-0 flex-1 flex flex-col bg-[#F1F5F9] overflow-hidden"
    >
      {/* Top Bar Inside Preview Panel: ATS Score + Quick Template & Zoom Controls */}
      <div className="sticky top-0 z-10 p-4 pb-3 space-y-3 border-b border-slate-200/80 bg-[#F8FAFC] shrink-0">
        <ATSScore />

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Quick Template Switcher Pills */}
          <div
            className="flex items-center gap-1 bg-slate-200/75 p-1 rounded-lg overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Quick template selector"
          >
            {TEMPLATE_DEFINITIONS.map((tpl) => {
              const active = resume.selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTemplate(tpl.id as TemplateId)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tpl.name}
                </button>
              );
            })}
          </div>

          {/* Page Indicator & Zoom Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 tabular-nums px-2 py-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>
                A4 · {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </span>

            <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom out preview"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-semibold text-slate-700 tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom in preview"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Fit to width"
                aria-label="Reset zoom to fit width"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border-l border-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable A4 Document Stage */}
      <div
        ref={viewportRef}
        data-testid="resume-preview-scroll-container"
        className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-6 flex justify-center items-start"
      >
        <div
          style={{
            width: `${Math.round(A4_WIDTH_PX * scale)}px`,
            height: `${Math.round(docHeight * scale)}px`,
          }}
          className="relative shrink-0 overflow-hidden shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 bg-white"
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${A4_WIDTH_PX}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            className="bg-white"
          >
            <ResumeDocument
              ref={liveDocRef}
              data={resume}
              showPageGuides={pageCount > 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
