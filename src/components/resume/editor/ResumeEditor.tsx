import React, { useState } from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { PersonalSection } from './PersonalSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsAndLanguagesSection } from './SkillsAndLanguagesSection';
import { ProjectsAndCertificationsSection } from './ProjectsAndCertificationsSection';
import { FileUp, CheckCircle2 } from 'lucide-react';

type EditorFilterTab =
  | 'all'
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects';

const SECTION_TABS: Array<{ id: EditorFilterTab; label: string }> = [
  { id: 'all', label: 'All Sections' },
  { id: 'personal', label: 'Personal' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills & Languages' },
  { id: 'projects', label: 'Projects & Certs' },
];

interface ResumeEditorProps {
  onOpenImport?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ onOpenImport }) => {
  const [activeSection, setActiveSection] = useState<EditorFilterTab>('all');
  const recentlyImportedHighlight = useResumeStore(
    (s) => s.recentlyImportedHighlight
  );

  return (
    <div
      data-testid="resume-editor-panel"
      className="relative flex-1 min-h-0 flex flex-col bg-[#F8FAFC] overflow-hidden"
    >
      {/* Sticky Section Navigation Bar */}
      <div className="sticky top-0 z-10 px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div
          className="flex items-center gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Resume editor sections"
        >
          {SECTION_TABS.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Editor Cards */}
      <div
        data-testid="resume-editor-scroll-container"
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-5 space-y-6"
      >
        {/* Onboarding Import Existing Resume Card */}
        {onOpenImport && (
          <div
            data-testid="onboarding-import-card"
            className="p-4 rounded-xl bg-white border border-indigo-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900">
                Already have a resume? Upload it and redesign it in seconds.
              </p>
              <p className="text-[11px] text-slate-500">
                Supports text-based PDF (.pdf) and Word (.docx) files · 100% browser-side privacy
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenImport}
              data-testid="import-existing-resume-button"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import Existing Resume</span>
            </button>
          </div>
        )}

        {/* Brief highlight banner when sections were just populated */}
        {recentlyImportedHighlight && (
          <div
            data-testid="imported-sections-highlight-banner"
            className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 transition-opacity"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Editor sections populated from your imported resume. Review and customize any field below.
            </span>
          </div>
        )}

        <div
          className={`space-y-6 rounded-xl transition-shadow duration-200 ${
            recentlyImportedHighlight
              ? 'ring-2 ring-indigo-500/50 ring-offset-4 ring-offset-[#F8FAFC]'
              : ''
          }`}
        >
          {(activeSection === 'all' || activeSection === 'personal') && (
            <PersonalSection />
          )}
          {(activeSection === 'all' || activeSection === 'experience') && (
            <ExperienceSection />
          )}
          {(activeSection === 'all' || activeSection === 'education') && (
            <EducationSection />
          )}
          {(activeSection === 'all' || activeSection === 'skills') && (
            <SkillsAndLanguagesSection />
          )}
          {(activeSection === 'all' || activeSection === 'projects') && (
            <ProjectsAndCertificationsSection />
          )}
        </div>
      </div>
    </div>
  );
};

