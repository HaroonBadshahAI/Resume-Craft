import React, { useState } from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { PROFICIENCY_LEVELS, LanguageProficiency } from '../../../lib/resume/types';
import {
  JOB_CATEGORIES,
  JobCategory,
  detectJobCategory,
  getSuggestedSkills,
} from '../../../lib/resume/writing-assistant';
import { Plus, X, Wand2, Trash2, Globe2 } from 'lucide-react';

export const SkillsAndLanguagesSection: React.FC = () => {
  const skills = useResumeStore((s) => s.resume.skills);
  const languages = useResumeStore((s) => s.resume.languages);
  const jobTitle = useResumeStore((s) => s.resume.personal.jobTitle);
  const addSkill = useResumeStore((s) => s.addSkill);
  const addSkillsBatch = useResumeStore((s) => s.addSkillsBatch);
  const removeSkill = useResumeStore((s) => s.removeSkill);
  const addLanguage = useResumeStore((s) => s.addLanguage);
  const updateLanguage = useResumeStore((s) => s.updateLanguage);
  const deleteLanguage = useResumeStore((s) => s.deleteLanguage);
  const addToast = useResumeStore((s) => s.addToast);

  const [skillInput, setSkillInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>(() =>
    detectJobCategory(jobTitle)
  );
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const added = addSkill(trimmed);
    if (added) {
      setSkillInput('');
    } else {
      addToast({
        type: 'info',
        title: 'Duplicate Skill',
        description: `"${trimmed}" is already in your skills list.`,
      });
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSuggestSkillsButton = () => {
    const detected = detectJobCategory(jobTitle);
    setSelectedCategory(detected);
    setShowSuggestionsPanel(true);
    const { suggestions } = getSuggestedSkills(detected, skills);
    const toAdd = suggestions.slice(0, 4);
    if (toAdd.length > 0) {
      const count = addSkillsBatch(toAdd);
      addToast({
        type: 'success',
        title: `Added ${count} Suggested Skills`,
        description: `Recommended for ${detected}.`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Skill Suggestions Open',
        description: 'Select any category below to add more skills.',
      });
    }
  };

  const { suggestions: categorySuggestions } = getSuggestedSkills(
    selectedCategory,
    skills
  );

  return (
    <div className="space-y-6">
      {/* SKILLS EDITOR */}
      <section
        id="editor-skills"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Skills</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Include 5 or more core skills. Press Enter or click Add.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSuggestSkillsButton}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Suggest Skills</span>
          </button>
        </div>

        {/* Add Skill Input */}
        <div className="flex items-center gap-2">
          <input
            id="input-add-skill"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Enter a skill (e.g. Marketing Automation, SQL, Figma)..."
            aria-label="Enter a skill"
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Add
          </button>
        </div>

        {/* Active Skill Tags */}
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove skill ${skill}`}
                  className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No skills added yet. Enter a skill above or click &ldquo;Suggest Skills&rdquo;.
          </p>
        )}

        {/* Role-Based Skill Suggestions Drawer */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="select-skill-category"
              className="text-xs font-semibold text-slate-600"
            >
              Browse Suggestions by Profession:
            </label>
            <select
              id="select-skill-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as JobCategory);
                setShowSuggestionsPanel(true);
              }}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {(showSuggestionsPanel || categorySuggestions.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {categorySuggestions.map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => addSkill(suggested)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>{suggested}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LANGUAGES EDITOR */}
      <section
        id="editor-languages"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Languages</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add spoken and written languages with standard proficiency levels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => addLanguage('', 'Fluent')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Language</span>
          </button>
        </div>

        {languages.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
            <Globe2 className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No languages listed yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {languages.map((lang, idx) => (
              <div
                key={lang.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40"
              >
                <div className="flex-1">
                  <label htmlFor={`lang-name-${lang.id}`} className="sr-only">
                    Language Name {idx + 1}
                  </label>
                  <input
                    id={`lang-name-${lang.id}`}
                    type="text"
                    value={lang.name}
                    onChange={(e) =>
                      updateLanguage(lang.id, { name: e.target.value })
                    }
                    placeholder="e.g. English, Arabic, Urdu, French..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>

                <div className="sm:w-44">
                  <label htmlFor={`lang-prof-${lang.id}`} className="sr-only">
                    Proficiency Level {idx + 1}
                  </label>
                  <select
                    id={`lang-prof-${lang.id}`}
                    value={lang.proficiency}
                    onChange={(e) =>
                      updateLanguage(lang.id, {
                        proficiency: e.target.value as LanguageProficiency,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 cursor-pointer"
                  >
                    {PROFICIENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => deleteLanguage(lang.id)}
                  aria-label={`Delete Language ${lang.name || idx + 1}`}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
