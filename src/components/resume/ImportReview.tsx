import React, { useState } from 'react';
import {
  ResumeData,
  PROFICIENCY_LEVELS,
  LanguageProficiency,
} from '../../lib/resume/types';
import { ParsedResumeImport } from '../../lib/resume/import/resume-parser';
import { ImportMode } from '../../lib/resume/import/resume-merger';
import { isEndBeforeStart } from '../../lib/resume/import/date-normalizer';
import { ResumeDateInput } from './editor/ResumeDateInput';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Layers,
  ImageOff,
} from 'lucide-react';

interface ImportReviewProps {
  parsedImport: ParsedResumeImport;
  hasExistingData: boolean;
  onConfirmImport: (
    reviewedData: ResumeData,
    mode: ImportMode,
    overwritePersonalInMerge: boolean
  ) => void;
  onCancel: () => void;
}

function makeReviewId(prefix: string): string {
  return `${prefix}-rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const ImportReview: React.FC<ImportReviewProps> = ({
  parsedImport,
  hasExistingData,
  onConfirmImport,
  onCancel,
}) => {
  const [draft, setDraft] = useState<ResumeData>(() =>
    structuredClone(parsedImport.data)
  );
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [overwritePersonalInMerge, setOverwritePersonalInMerge] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const { diagnostics, fileName, fileType } = parsedImport;

  // Dynamic validation checks on the current editable draft
  const missingCritical: string[] = [];
  if (!draft.personal.fullName.trim()) missingCritical.push('Full Name');
  if (!draft.personal.jobTitle.trim()) missingCritical.push('Job Title');
  if (!draft.personal.email.trim()) missingCritical.push('Email');
  if (!draft.personal.phone.trim()) missingCritical.push('Phone');
  if (!draft.summary.trim()) missingCritical.push('Summary');
  if (draft.experience.length === 0) missingCritical.push('Work Experience');
  if (draft.education.length === 0) missingCritical.push('Education');
  if (draft.skills.length === 0) missingCritical.push('Skills');

  const updatePersonalField = (
    key: keyof ResumeData['personal'],
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [key]: value,
      },
    }));
  };

  // Experience handlers
  const updateExp = (
    id: string,
    fields: Partial<ResumeData['experience'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...fields };
        if (next.isCurrent) next.endDate = '';
        return next;
      }),
    }));
  };

  const addExpEntry = () => {
    setDraft((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: makeReviewId('exp'),
          jobTitle: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          achievements: [''],
        },
      ],
    }));
  };

  const removeExpEntry = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const updateExpBullet = (expId: string, index: number, value: string) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const bullets = [...item.achievements];
        bullets[index] = value;
        return { ...item, achievements: bullets };
      }),
    }));
  };

  const addExpBullet = (expId: string) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === expId
          ? { ...item, achievements: [...item.achievements, ''] }
          : item
      ),
    }));
  };

  const removeExpBullet = (expId: string, index: number) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const next = item.achievements.filter((_, i) => i !== index);
        return { ...item, achievements: next.length > 0 ? next : [''] };
      }),
    }));
  };

  // Education handlers
  const updateEdu = (
    id: string,
    fields: Partial<ResumeData['education'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, ...fields } : item
      ),
    }));
  };

  const addEduEntry = () => {
    setDraft((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: makeReviewId('edu'),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  };

  const removeEduEntry = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (!trimmed) return;
    if (
      !draft.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      setDraft((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setNewSkillText('');
  };

  const handleRemoveSkill = (skill: string) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  // Languages handlers
  const addLangEntry = () => {
    setDraft((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          id: makeReviewId('lang'),
          name: '',
          proficiency: 'Fluent',
        },
      ],
    }));
  };

  const updateLang = (
    id: string,
    fields: Partial<ResumeData['languages'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      languages: prev.languages.map((l) =>
        l.id === id ? { ...l, ...fields } : l
      ),
    }));
  };

  const removeLang = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  // Projects handlers
  const addProjEntry = () => {
    setDraft((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: makeReviewId('proj'),
          title: '',
          description: '',
          technologies: '',
          url: '',
        },
      ],
    }));
  };

  const updateProj = (
    id: string,
    fields: Partial<ResumeData['projects'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...fields } : p
      ),
    }));
  };

  const removeProj = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Certifications handlers
  const addCertEntry = () => {
    setDraft((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: makeReviewId('cert'),
          name: '',
          issuer: '',
          issueDate: '',
        },
      ],
    }));
  };

  const updateCert = (
    id: string,
    fields: Partial<ResumeData['certifications'][number]>
  ) => {
    setDraft((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, ...fields } : c
      ),
    }));
  };

  const removeCert = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const allWarnings = [
    ...diagnostics.layoutWarnings,
    ...diagnostics.uncertainFields,
    ...diagnostics.dateWarnings,
  ];

  return (
    <div
      data-testid="import-review-screen"
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      {/* Scrollable Review Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
        {/* Extraction Summary & Status Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-slate-900">
                Extracted from {fileName} ({fileType.toUpperCase()})
              </span>
            </div>
            <div className="text-xs text-slate-600 tabular-nums">
              <span>{draft.experience.length} roles</span>
              <span className="mx-1.5">·</span>
              <span>{draft.education.length} education</span>
              <span className="mx-1.5">·</span>
              <span>{draft.skills.length} skills</span>
              <span className="mx-1.5">·</span>
              <span>{draft.languages.length} languages</span>
            </div>
          </div>

          {/* Photo Status Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
            <ImageOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{diagnostics.photoNotice}</span>
          </div>

          {/* Missing Information Highlight */}
          {missingCritical.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing or empty fields: </span>
                <span>{missingCritical.join(', ')}. </span>
                <span className="text-amber-800">
                  You can fill these in below or after importing into the editor.
                </span>
              </div>
            </div>
          )}

          {/* Uncertain Field Mappings & Date / Layout Warnings */}
          {allWarnings.length > 0 && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs text-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Items Flagged for Your Review ({allWarnings.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {allWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* If user already has resume data: Replace vs Merge Selector */}
        {hasExistingData && (
          <section
            aria-label="Import mode selection"
            className="p-4 rounded-xl border border-slate-200 bg-white space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-900">
              How would you like to apply this imported resume?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                data-testid="mode-replace-button"
                aria-pressed={importMode === 'replace'}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  importMode === 'replace'
                    ? 'border-indigo-600 bg-indigo-50/50 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Replace Current Resume</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Replaces current editor fields with the reviewed data below while keeping your selected template.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('merge')}
                data-testid="mode-merge-button"
                aria-pressed={importMode === 'merge'}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  importMode === 'merge'
                    ? 'border-indigo-600 bg-indigo-50/50 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Merge with Current Resume</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Preserves your non-empty personal fields and appends new experience, education, skills, and languages without duplicates.
                </p>
              </button>
            </div>

            {importMode === 'merge' && (
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={overwritePersonalInMerge}
                  onChange={(e) => setOverwritePersonalInMerge(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>
                  Also overwrite my existing personal details & summary with imported values
                </span>
              </label>
            )}
          </section>
        )}

        {/* 1. PERSONAL INFORMATION & SUMMARY */}
        <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              1. Personal Information & Summary
            </h3>
            <span className="text-xs text-slate-500">Editable before import</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label
                htmlFor="rev-full-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Full Name {!draft.personal.fullName.trim() && <span className="text-amber-600">(Missing)</span>}
              </label>
              <input
                id="rev-full-name"
                type="text"
                value={draft.personal.fullName}
                onChange={(e) => updatePersonalField('fullName', e.target.value)}
                placeholder="Candidate Full Name"
                className={`w-full px-3 py-2 text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  !draft.personal.fullName.trim()
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20'
                    : 'border-slate-200 bg-white focus:ring-indigo-600/20 focus:border-indigo-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rev-job-title"
                className="block text-xs font-semibold text-slate-700"
              >
                Professional Job Title {!draft.personal.jobTitle.trim() && <span className="text-amber-600">(Missing)</span>}
              </label>
              <input
                id="rev-job-title"
                type="text"
                value={draft.personal.jobTitle}
                onChange={(e) => updatePersonalField('jobTitle', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-3 py-2 text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  !draft.personal.jobTitle.trim()
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20'
                    : 'border-slate-200 bg-white focus:ring-indigo-600/20 focus:border-indigo-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rev-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email Address {!draft.personal.email.trim() && <span className="text-amber-600">(Missing)</span>}
              </label>
              <input
                id="rev-email"
                type="email"
                value={draft.personal.email}
                onChange={(e) => updatePersonalField('email', e.target.value)}
                placeholder="name@example.com"
                className={`w-full px-3 py-2 text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  !draft.personal.email.trim()
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20'
                    : 'border-slate-200 bg-white focus:ring-indigo-600/20 focus:border-indigo-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rev-phone"
                className="block text-xs font-semibold text-slate-700"
              >
                Phone Number {!draft.personal.phone.trim() && <span className="text-amber-600">(Missing)</span>}
              </label>
              <input
                id="rev-phone"
                type="tel"
                value={draft.personal.phone}
                onChange={(e) => updatePersonalField('phone', e.target.value)}
                placeholder="+1 555 234 5678"
                className={`w-full px-3 py-2 text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  !draft.personal.phone.trim()
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20'
                    : 'border-slate-200 bg-white focus:ring-indigo-600/20 focus:border-indigo-600'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rev-location"
                className="block text-xs font-semibold text-slate-700"
              >
                City / Country
              </label>
              <input
                id="rev-location"
                type="text"
                value={draft.personal.location}
                onChange={(e) => updatePersonalField('location', e.target.value)}
                placeholder="e.g. Dubai, UAE"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="rev-linkedin"
                className="block text-xs font-semibold text-slate-700"
              >
                LinkedIn
              </label>
              <input
                id="rev-linkedin"
                type="url"
                value={draft.personal.linkedin}
                onChange={(e) => updatePersonalField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="rev-website"
                className="block text-xs font-semibold text-slate-700"
              >
                Portfolio / Website
              </label>
              <input
                id="rev-website"
                type="url"
                value={draft.personal.website}
                onChange={(e) => updatePersonalField('website', e.target.value)}
                placeholder="portfolio.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="rev-summary"
                className="block text-xs font-semibold text-slate-700"
              >
                Professional Summary {!draft.summary.trim() && <span className="text-amber-600">(Not detected — optional)</span>}
              </label>
              <textarea
                id="rev-summary"
                rows={3}
                value={draft.summary}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Extracted summary text..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </section>

        {/* 2. WORK EXPERIENCE */}
        <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              2. Work Experience ({draft.experience.length})
            </h3>
            <button
              type="button"
              onClick={addExpEntry}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          {draft.experience.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No work experience entries were automatically recognized. You can add one now or after confirming import.
            </p>
          ) : (
            <div className="space-y-4">
              {draft.experience.map((exp, idx) => {
                const isIncomplete = !exp.jobTitle.trim() || !exp.company.trim();
                const hasDateOrderError =
                  !exp.isCurrent &&
                  Boolean(exp.startDate && exp.endDate) &&
                  isEndBeforeStart(exp.startDate, exp.endDate);

                return (
                  <div
                    key={exp.id}
                    data-testid={`review-exp-card-${idx}`}
                    className={`p-3.5 rounded-xl border space-y-3 ${
                      isIncomplete || hasDateOrderError
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Role #{idx + 1}
                        </span>
                        {isIncomplete && (
                          <span className="text-[11px] font-semibold text-amber-700">
                            · Missing job title or company
                          </span>
                        )}
                        {hasDateOrderError && (
                          <span className="text-[11px] font-semibold text-red-600">
                            · Check start/end date order
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExpEntry(exp.id)}
                        aria-label={`Remove extracted role ${idx + 1}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label
                          htmlFor={`rev-exp-title-${exp.id}`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Job Title
                        </label>
                        <input
                          id={`rev-exp-title-${exp.id}`}
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) =>
                            updateExp(exp.id, { jobTitle: e.target.value })
                          }
                          placeholder="Job Title"
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-white text-slate-900 ${
                            !exp.jobTitle.trim() ? 'border-amber-400' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`rev-exp-company-${exp.id}`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Company
                        </label>
                        <input
                          id={`rev-exp-company-${exp.id}`}
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateExp(exp.id, { company: e.target.value })
                          }
                          placeholder="Company Name"
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-white text-slate-900 ${
                            !exp.company.trim() ? 'border-amber-400' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`rev-exp-loc-${exp.id}`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Location
                        </label>
                        <input
                          id={`rev-exp-loc-${exp.id}`}
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            updateExp(exp.id, { location: e.target.value })
                          }
                          placeholder="City, Country"
                          className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`rev-exp-start-${exp.id}`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Start Date
                        </label>
                        <ResumeDateInput
                          id={`rev-exp-start-${exp.id}`}
                          value={exp.startDate}
                          hasWarning={!exp.startDate.trim()}
                          onChange={(val) => updateExp(exp.id, { startDate: val })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`rev-exp-end-${exp.id}`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          End Date
                        </label>
                        <ResumeDateInput
                          id={`rev-exp-end-${exp.id}`}
                          value={exp.isCurrent ? '' : exp.endDate}
                          disabled={exp.isCurrent}
                          hasWarning={hasDateOrderError}
                          onChange={(val) => updateExp(exp.id, { endDate: val })}
                        />
                      </div>

                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) =>
                              updateExp(exp.id, { isCurrent: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Current Role (Present)</span>
                        </label>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div className="space-y-2 pt-1">
                      <span className="block text-xs font-semibold text-slate-700">
                        Achievement Bullets
                      </span>
                      {exp.achievements.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            aria-label={`Review bullet ${bIdx + 1} for role ${idx + 1}`}
                            value={bullet}
                            onChange={(e) =>
                              updateExpBullet(exp.id, bIdx, e.target.value)
                            }
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => removeExpBullet(exp.id, bIdx)}
                            aria-label={`Delete review bullet ${bIdx + 1}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addExpBullet(exp.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. EDUCATION */}
        <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              3. Education ({draft.education.length})
            </h3>
            <button
              type="button"
              onClick={addEduEntry}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          {draft.education.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No education entries extracted. Click &ldquo;Add Education&rdquo; to enter one.
            </p>
          ) : (
            <div className="space-y-3">
              {draft.education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Education #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEduEntry(edu.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Degree
                      </label>
                      <input
                        type="text"
                        aria-label={`Review degree ${idx + 1}`}
                        value={edu.degree}
                        onChange={(e) =>
                          updateEdu(edu.id, { degree: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Institution
                      </label>
                      <input
                        type="text"
                        aria-label={`Review institution ${idx + 1}`}
                        value={edu.institution}
                        onChange={(e) =>
                          updateEdu(edu.id, { institution: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Start Date
                      </label>
                      <ResumeDateInput
                        id={`rev-edu-start-${edu.id}`}
                        value={edu.startDate}
                        onChange={(val) => updateEdu(edu.id, { startDate: val })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        End Date
                      </label>
                      <ResumeDateInput
                        id={`rev-edu-end-${edu.id}`}
                        value={edu.endDate}
                        onChange={(val) => updateEdu(edu.id, { endDate: val })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. SKILLS & LANGUAGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skills */}
          <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Skills ({draft.skills.length})
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Add skill in review"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill..."
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>

            {draft.skills.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No skills detected.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {draft.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove extracted skill ${skill}`}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Languages */}
          <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                5. Languages ({draft.languages.length})
              </h3>
              <button
                type="button"
                onClick={addLangEntry}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {draft.languages.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No languages detected.</p>
            ) : (
              <div className="space-y-2">
                {draft.languages.map((lang, idx) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label={`Review language name ${idx + 1}`}
                      value={lang.name}
                      onChange={(e) =>
                        updateLang(lang.id, { name: e.target.value })
                      }
                      placeholder="Language"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                    />
                    <select
                      aria-label={`Review language proficiency ${idx + 1}`}
                      value={lang.proficiency}
                      onChange={(e) =>
                        updateLang(lang.id, {
                          proficiency: e.target.value as LanguageProficiency,
                        })
                      }
                      className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 cursor-pointer"
                    >
                      {PROFICIENCY_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLang(lang.id)}
                      aria-label={`Remove extracted language ${lang.name || idx + 1}`}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 6. PROJECTS & CERTIFICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projects */}
          <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                6. Projects ({draft.projects.length})
              </h3>
              <button
                type="button"
                onClick={addProjEntry}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {draft.projects.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No projects detected.</p>
            ) : (
              <div className="space-y-2.5">
                {draft.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        aria-label={`Review project title ${idx + 1}`}
                        value={proj.title}
                        onChange={(e) =>
                          updateProj(proj.id, { title: e.target.value })
                        }
                        placeholder="Project Title"
                        className="flex-1 px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeProj(proj.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) =>
                        updateProj(proj.id, { description: e.target.value })
                      }
                      placeholder="Project description..."
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Certifications */}
          <section className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                7. Certifications ({draft.certifications.length})
              </h3>
              <button
                type="button"
                onClick={addCertEntry}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {draft.certifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No certifications detected.
              </p>
            ) : (
              <div className="space-y-2.5">
                {draft.certifications.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        aria-label={`Review certification name ${idx + 1}`}
                        value={cert.name}
                        onChange={(e) =>
                          updateCert(cert.id, { name: e.target.value })
                        }
                        placeholder="Certification Name"
                        className="flex-1 px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeCert(cert.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCert(cert.id, { issuer: e.target.value })
                        }
                        placeholder="Issuer (e.g. Google)"
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900"
                      />
                      <input
                        type="text"
                        value={cert.issueDate}
                        onChange={(e) =>
                          updateCert(cert.id, { issueDate: e.target.value })
                        }
                        placeholder="YYYY-MM or YYYY"
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-900 tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Collapsible Raw Extracted Text Viewer */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawText((v) => !v)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>View Extracted Document Text (Reference)</span>
            </span>
            {showRawText ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {showRawText && (
            <pre className="p-4 text-[11px] font-mono text-slate-700 bg-slate-50 border-t border-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {parsedImport.rawText}
            </pre>
          )}
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <p className="text-xs text-slate-500">
          Confirmed data is saved locally in your browser. No files are uploaded to external servers.
        </p>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            data-testid="cancel-import-button"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirmImport(draft, importMode, overwritePersonalInMerge)
            }
            data-testid="confirm-import-button"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            Import & Fill Resume
          </button>
        </div>
      </div>
    </div>
  );
};
