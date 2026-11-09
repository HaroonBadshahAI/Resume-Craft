import React, { useState } from 'react';
import { PersonalSection } from './PersonalSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsAndLanguagesSection } from './SkillsAndLanguagesSection';
import { ProjectsAndCertificationsSection } from './ProjectsAndCertificationsSection';

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

export const ResumeEditor: React.FC = () => {
  const [activeSection, setActiveSection] = useState<EditorFilterTab>('all');

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sticky Section Navigation Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
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
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
  );
};
