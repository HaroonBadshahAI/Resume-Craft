import React, { useRef, useState } from 'react';
import { useResumeStore } from '../../lib/resume/store';
import { extractResumeFile } from '../../lib/resume/import/docx-extractor';
import {
  parseExtractedResume,
  ParsedResumeImport,
} from '../../lib/resume/import/resume-parser';
import {
  hasExistingResumeContent,
  ImportMode,
} from '../../lib/resume/import/resume-merger';
import { ResumeData } from '../../lib/resume/types';
import { ImportReview } from './ImportReview';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface ImportResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStepState =
  | 'ready'
  | 'reading'
  | 'extracting'
  | 'reviewing'
  | 'complete'
  | 'error';

export const ImportResumeDialog: React.FC<ImportResumeDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const resume = useResumeStore((s) => s.resume);
  const importResumeData = useResumeStore((s) => s.importResumeData);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<ImportStepState>('ready');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedResumeImport | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const hasExisting = hasExistingResumeContent(resume);

  const resetDialogState = () => {
    setStep('ready');
    setIsDragging(false);
    setSelectedFileName('');
    setParsedResult(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetDialogState();
    onClose();
  };

  const processFile = async (file: File) => {
    setSelectedFileName(file.name);
    setErrorMessage('');
    setStep('reading');

    // Allow React to paint the "Reading document" state before CPU-intensive parsing
    await new Promise((r) => setTimeout(r, 80));

    const extraction = await extractResumeFile(file);

    if (!extraction.success) {
      setErrorMessage(
        extraction.errorMessage ||
          'Unable to extract text from the selected document.'
      );
      setStep('error');
      return;
    }

    setStep('extracting');
    await new Promise((r) => setTimeout(r, 80));

    const parsed = parseExtractedResume(extraction);

    // Check if literally nothing usable was found
    const hasAnyField =
      Boolean(
        parsed.data.personal.fullName ||
          parsed.data.personal.email ||
          parsed.data.personal.phone ||
          parsed.data.summary
      ) ||
      parsed.data.experience.length > 0 ||
      parsed.data.education.length > 0 ||
      parsed.data.skills.length > 0 ||
      parsed.data.languages.length > 0;

    if (!hasAnyField && parsed.rawText.trim().length < 25) {
      setErrorMessage(
        'No recognizable resume text or fields could be extracted from this file. Please upload a text-based PDF or Word (.docx) resume.'
      );
      setStep('error');
      return;
    }

    setParsedResult(parsed);
    setStep('reviewing');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleConfirmImport = (
    reviewedData: ResumeData,
    mode: ImportMode,
    overwritePersonalInMerge: boolean
  ) => {
    importResumeData(reviewedData, mode, {
      overwritePersonal: overwritePersonalInMerge,
    });
    setStep('complete');
    setTimeout(() => {
      handleClose();
    }, 350);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-resume-dialog-title"
      data-testid="import-resume-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        className={`w-full bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden ${
          step === 'reviewing'
            ? 'max-w-4xl h-[88vh]'
            : 'max-w-xl max-h-[90vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2
              id="import-resume-dialog-title"
              className="text-base font-bold text-slate-900"
            >
              {step === 'reviewing'
                ? 'Review & Edit Extracted Resume Information'
                : 'Import Existing Resume'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'reviewing'
                ? 'Verify extracted fields, make any adjustments, and confirm to populate your resume editor.'
                : 'Upload a text-based PDF or Word (.docx) resume to auto-fill the editor.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Import Resume Dialog"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Ready to Upload */}
        {step === 'ready' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInputChange}
              data-testid="import-file-input"
              className="sr-only"
            />

            {/* Drag and Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`p-8 rounded-xl border-2 border-dashed text-center transition-colors space-y-4 ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-red-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-indigo-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-blue-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Drag and drop your resume here
                </p>
                <p className="text-xs text-slate-500">
                  Supports <span className="font-semibold text-slate-700">PDF (.pdf)</span> and{' '}
                  <span className="font-semibold text-slate-700">Microsoft Word (.docx)</span> · Maximum file size <span className="font-mono tabular-nums font-semibold text-slate-700">10 MB</span>
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="browse-resume-files-button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Files</span>
                </button>
              </div>
            </div>

            {/* Privacy & Local Processing Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  100% Browser-Side Processing & Local Privacy
                </p>
                <p>
                  Your resume file is parsed directly inside your browser and is never uploaded to any external server or third-party AI service. Confirmed personal information is saved locally in your browser storage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 & 3: Reading Document / Extracting Information */}
        {(step === 'reading' || step === 'extracting') && (
          <div
            data-testid="import-loading-state"
            className="p-10 text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                {step === 'reading'
                  ? `Reading document "${selectedFileName}"...`
                  : 'Extracting resume sections and normalizing dates...'}
              </p>
              <p className="text-xs text-slate-500">
                {step === 'reading'
                  ? 'Reconstructing page text and reading order locally in your browser.'
                  : 'Mapping contact details, work history, education, skills, and languages.'}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Reviewing Extracted Data */}
        {step === 'reviewing' && parsedResult && (
          <ImportReview
            parsedImport={parsedResult}
            hasExistingData={hasExisting}
            onConfirmImport={handleConfirmImport}
            onCancel={handleClose}
          />
        )}

        {/* Step 5: Import Complete */}
        {step === 'complete' && (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-900">
              Import Complete!
            </p>
            <p className="text-xs text-slate-500">
              Populating your resume editor and updating the live preview...
            </p>
          </div>
        )}

        {/* Step 6: Error State */}
        {step === 'error' && (
          <div
            data-testid="import-error-state"
            className="p-6 space-y-5"
          >
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-red-900">
                  Could Not Import &ldquo;{selectedFileName || 'Document'}&rdquo;
                </h3>
                <p className="text-xs text-red-800 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={resetDialogState}
                data-testid="import-try-again-button"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
