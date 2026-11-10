import React, { useEffect, useRef, useState } from 'react';
import { useResumeStore } from './lib/resume/store';
import { ACCENT_COLORS, TEMPLATE_DEFINITIONS } from './lib/resume/types';
import { ResumeEditor } from './components/resume/editor/ResumeEditor';
import { ResumePreview } from './components/resume/ResumePreview';
import { ResumeDocument } from './components/resume/ResumeDocument';
import { TemplateGallery } from './components/resume/TemplateGallery';
import { ImportResumeDialog } from './components/resume/ImportResumeDialog';
import { ConfirmDialog } from './components/resume/ConfirmDialog';
import { ToastViewport } from './components/resume/ToastViewport';
import { A4_WIDTH_PX, exportResumeToPdf } from './lib/resume/pdf-export';
import {
  Download,
  LayoutTemplate,
  RotateCcw,
  FilePlus2,
  FileUp,
  Loader2,
  PenLine,
  Eye,
  Check,
} from 'lucide-react';

export default function App() {
  const resume = useResumeStore((s) => s.resume);
  const hydrate = useResumeStore((s) => s.hydrate);
  const storageWarning = useResumeStore((s) => s.storageWarning);
  const setAccentColor = useResumeStore((s) => s.setAccentColor);
  const loadSampleResume = useResumeStore((s) => s.loadSampleResume);
  const resetToBlankResume = useResumeStore((s) => s.resetToBlankResume);
  const addToast = useResumeStore((s) => s.addToast);

  const exportContainerRef = useRef<HTMLDivElement | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'sample' | 'new' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeTemplateMeta =
    TEMPLATE_DEFINITIONS.find((t) => t.id === resume.selectedTemplate) ||
    TEMPLATE_DEFINITIONS[0];

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    if (!exportContainerRef.current) {
      addToast({
        type: 'error',
        title: 'Export Container Not Ready',
        description: 'Please wait a moment and try downloading again.',
      });
      return;
    }

    setIsExporting(true);
    try {
      const { filename, pageCount } = await exportResumeToPdf(
        exportContainerRef.current,
        resume.personal.fullName
      );
      addToast({
        type: 'success',
        title: 'PDF Downloaded Successfully',
        description: `Saved ${filename} (${pageCount} ${pageCount === 1 ? 'page' : 'pages'}, ${activeTemplateMeta.name}).`,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      addToast({
        type: 'error',
        title: 'PDF Generation Failed',
        description:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while generating the PDF.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      data-testid="app-shell"
      className="relative flex-1 h-dvh max-h-dvh w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A]"
    >
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 h-15 px-4 lg:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#top"
            onClick={(e) => e.preventDefault()}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            ResumeCraft
          </a>
          <span
            aria-hidden="true"
            className="hidden sm:inline-block text-slate-300 select-none"
          >
            /
          </span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
            Resume Builder
          </span>
        </div>

        {/* Zone 2: Workspace Controls (Templates, Accent Color Selector, Load Sample, New Resume) */}
        <nav
          aria-label="Resume customization and data controls"
          className="hidden md:flex items-center gap-2 lg:gap-3 py-1"
        >
          {/* Templates Button */}
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/75 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates ({activeTemplateMeta.name})</span>
          </button>

          {/* Accent Color Selector */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg shrink-0"
            role="group"
            aria-label="Accent color selector"
          >
            <span className="hidden xl:inline text-[11px] font-semibold text-slate-500 mr-1 whitespace-nowrap">
              Accent:
            </span>
            {ACCENT_COLORS.map((color) => {
              const isSelected = resume.accentColor === color.hex;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setAccentColor(color.hex)}
                  title={`${color.name} (${color.hex})`}
                  aria-label={`Accent color ${color.name}`}
                  aria-pressed={isSelected}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer shrink-0 ${
                    isSelected ? 'scale-110 ring-2 ring-offset-1 ring-slate-900/40' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Import Resume Button */}
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            data-testid="toolbar-import-resume-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import Resume</span>
          </button>

          {/* Load Sample */}
          <button
            type="button"
            onClick={() => setConfirmMode('sample')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Load Sample</span>
          </button>

          {/* New Resume */}
          <button
            type="button"
            onClick={() => setConfirmMode('new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-slate-500" />
            <span>New Resume</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action — Download PDF */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            data-testid="download-pdf-button"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Optional Storage Quota Warning Banner */}
      {storageWarning && (
        <div
          role="alert"
          className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs font-medium text-amber-800 flex items-center justify-between"
        >
          <span>{storageWarning}</span>
        </div>
      )}

      {/* MOBILE CONTROLS & EDITOR / PREVIEW TAB SWITCHER (< lg) */}
      <div className="lg:hidden sticky top-15 z-20 bg-white border-b border-slate-200 px-3 py-2 space-y-2 shrink-0">
        <div className="md:hidden flex items-center justify-between gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates</span>
          </button>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg shrink-0">
            {ACCENT_COLORS.map((color) => {
              const isSelected = resume.accentColor === color.hex;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setAccentColor(color.hex)}
                  aria-label={`Mobile accent color ${color.name}`}
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'ring-2 ring-offset-1 ring-slate-900/40' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg whitespace-nowrap shrink-0"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmMode('sample')}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => setConfirmMode('new')}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
          >
            New
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              mobileTab === 'editor'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              mobileTab === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE: LEFT 42% EDITOR | RIGHT 58% LIVE A4 PREVIEW */}
      <main className="relative flex-1 min-h-0 w-full flex overflow-hidden">
        {/* LEFT PANEL — RESUME EDITOR */}
        <section
          aria-label="Resume Editor"
          data-testid="editor-layout-section"
          className={`relative w-full lg:w-[42%] xl:w-[40%] lg:shrink-0 flex-1 lg:flex-initial min-h-0 border-r border-slate-200 overflow-hidden ${
            mobileTab === 'editor' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <ResumeEditor onOpenImport={() => setIsImportOpen(true)} />
        </section>

        {/* RIGHT PANEL — ATS READINESS & LIVE A4 PREVIEW */}
        <section
          aria-label="Resume Preview"
          data-testid="preview-layout-section"
          className={`relative flex-1 min-w-0 min-h-0 overflow-hidden ${
            mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <ResumePreview />
        </section>
      </main>

      {/*
        DEDICATED UNSCALED A4 EXPORT CONTAINER AT (0,0)
        Clipped to height:0 / overflow:hidden in the live DOM so it never causes document scroll,
        and temporarily expanded during export / in html2canvas-pro's onclone callback.
      */}
      <div
        data-pdf-export-root="true"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: `${A4_WIDTH_PX}px`,
          height: '0px',
          zIndex: -9999,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <ResumeDocument
          ref={exportContainerRef}
          data={resume}
          showPageGuides={false}
        />
      </div>

      {/* TEMPLATE GALLERY MODAL */}
      <TemplateGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* IMPORT EXISTING RESUME DIALOG */}
      <ImportResumeDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* CONFIRMATION DIALOG FOR LOAD SAMPLE */}
      <ConfirmDialog
        isOpen={confirmMode === 'sample'}
        title="Load Sample Resume?"
        description="This will replace your current resume fields with Ayesha Khan's complete sample profile. Your current template and accent color will be kept."
        confirmLabel="Load Sample Data"
        confirmVariant="primary"
        onConfirm={loadSampleResume}
        onCancel={() => setConfirmMode(null)}
      />

      {/* CONFIRMATION DIALOG FOR NEW BLANK RESUME */}
      <ConfirmDialog
        isOpen={confirmMode === 'new'}
        title="Start a New Blank Resume?"
        description="This will clear all personal details, experience, education, skills, and uploaded photo so you can build a new resume from scratch."
        confirmLabel="Clear & Start New"
        confirmVariant="danger"
        onConfirm={resetToBlankResume}
        onCancel={() => setConfirmMode(null)}
      />

      {/* TOAST NOTIFICATIONS */}
      <ToastViewport />
    </div>
  );
}
