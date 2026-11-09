import React from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { formatDateRange } from '../../../lib/resume/sample-data';
import { Plus, Trash2, Wand2, Briefcase } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const experience = useResumeStore((s) => s.resume.experience);
  const addExperience = useResumeStore((s) => s.addExperience);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const deleteExperience = useResumeStore((s) => s.deleteExperience);
  const addExperienceBullet = useResumeStore((s) => s.addExperienceBullet);
  const updateExperienceBullet = useResumeStore((s) => s.updateExperienceBullet);
  const removeExperienceBullet = useResumeStore((s) => s.removeExperienceBullet);
  const improveExperienceBullets = useResumeStore((s) => s.improveExperienceBullets);

  return (
    <section
      id="editor-experience"
      className="bg-white rounded-xl border border-slate-200 p-5 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Include at least 3 action-oriented achievement bullets per role for ATS readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Experience</span>
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
          <Briefcase className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-sm font-medium text-slate-700">No work experience entries yet</p>
          <p className="text-xs text-slate-500">
            Add your current and past positions to showcase your career progression.
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Role</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {experience.map((exp, idx) => {
            const formattedRange = formatDateRange(
              exp.startDate,
              exp.endDate,
              exp.isCurrent
            );
            return (
              <div
                key={exp.id}
                data-testid={`experience-card-${idx}`}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {exp.jobTitle || `Position #${idx + 1}`}
                      {exp.company ? ` · ${exp.company}` : ''}
                    </span>
                    {formattedRange && (
                      <span className="ml-2 text-xs text-slate-500 tabular-nums">
                        ({formattedRange})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteExperience(exp.id)}
                    aria-label={`Delete Experience ${exp.jobTitle || idx + 1}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Experience</span>
                  </button>
                </div>

                {/* Role Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor={`exp-title-${exp.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Job Title
                    </label>
                    <input
                      id={`exp-title-${exp.id}`}
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        updateExperience(exp.id, { jobTitle: e.target.value })
                      }
                      placeholder="e.g. Senior Digital Marketing Manager"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`exp-company-${exp.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Company
                    </label>
                    <input
                      id={`exp-company-${exp.id}`}
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, { company: e.target.value })
                      }
                      placeholder="e.g. BrightWave Digital"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor={`exp-location-${exp.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Location
                    </label>
                    <input
                      id={`exp-location-${exp.id}`}
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        updateExperience(exp.id, { location: e.target.value })
                      }
                      placeholder="e.g. Dubai, UAE"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`exp-start-${exp.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Start Month / Year
                    </label>
                    <input
                      id={`exp-start-${exp.id}`}
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`exp-end-${exp.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      End Month / Year
                    </label>
                    <input
                      id={`exp-end-${exp.id}`}
                      type="month"
                      min={exp.startDate || undefined}
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? '' : exp.endDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 tabular-nums"
                    />
                  </div>
                </div>

                {/* Currently Working Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) =>
                        updateExperience(exp.id, { isCurrent: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Currently working here (displays &ldquo;Present&rdquo;)</span>
                  </label>
                </div>

                {/* Achievement Bullets */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Key Achievements & Responsibilities
                    </span>

                    <button
                      type="button"
                      onClick={() => improveExperienceBullets(exp.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Improve Bullets</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exp.achievements.map((bullet, bIndex) => (
                      <div key={bIndex} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold text-sm mt-2 select-none">
                          •
                        </span>
                        <input
                          type="text"
                          aria-label={`Achievement bullet ${bIndex + 1} for ${exp.jobTitle || `role ${idx + 1}`}`}
                          value={bullet}
                          onChange={(e) =>
                            updateExperienceBullet(exp.id, bIndex, e.target.value)
                          }
                          placeholder="e.g. Led integrated marketing campaigns across search and social channels."
                          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(exp.id, bIndex)}
                          aria-label={`Remove bullet ${bIndex + 1}`}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addExperienceBullet(exp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
