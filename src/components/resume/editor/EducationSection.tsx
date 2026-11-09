import React from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { formatDateRange } from '../../../lib/resume/sample-data';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

export const EducationSection: React.FC = () => {
  const education = useResumeStore((s) => s.resume.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const deleteEducation = useResumeStore((s) => s.deleteEducation);

  return (
    <section
      id="editor-education"
      className="bg-white rounded-xl border border-slate-200 p-5 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Education</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic degrees, universities, graduation dates, and honors.
          </p>
        </div>

        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
          <GraduationCap className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-sm font-medium text-slate-700">No education entries added</p>
          <button
            type="button"
            onClick={addEducation}
            className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, idx) => {
            const formattedRange = formatDateRange(edu.startDate, edu.endDate, false);
            return (
              <div
                key={edu.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {edu.degree || `Education #${idx + 1}`}
                      {edu.institution ? ` · ${edu.institution}` : ''}
                    </span>
                    {formattedRange && (
                      <span className="ml-2 text-xs text-slate-500 tabular-nums">
                        ({formattedRange})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteEducation(edu.id)}
                    aria-label={`Delete Education ${edu.degree || idx + 1}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Education</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor={`edu-degree-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Degree / Qualification
                    </label>
                    <input
                      id={`edu-degree-${edu.id}`}
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, { degree: e.target.value })
                      }
                      placeholder="e.g. Bachelor of Business Administration"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`edu-school-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      School / University
                    </label>
                    <input
                      id={`edu-school-${edu.id}`}
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, { institution: e.target.value })
                      }
                      placeholder="e.g. University of Dubai"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor={`edu-location-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Location
                    </label>
                    <input
                      id={`edu-location-${edu.id}`}
                      type="text"
                      value={edu.location}
                      onChange={(e) =>
                        updateEducation(edu.id, { location: e.target.value })
                      }
                      placeholder="e.g. Dubai, UAE"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`edu-start-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Start Month / Year
                    </label>
                    <input
                      id={`edu-start-${edu.id}`}
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`edu-end-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      End Month / Year
                    </label>
                    <input
                      id={`edu-end-${edu.id}`}
                      type="month"
                      min={edu.startDate || undefined}
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor={`edu-desc-${edu.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Description / Honors (Optional)
                    </label>
                    <textarea
                      id={`edu-desc-${edu.id}`}
                      rows={2}
                      value={edu.description}
                      onChange={(e) =>
                        updateEducation(edu.id, { description: e.target.value })
                      }
                      placeholder="e.g. Concentration in Marketing Strategy. Graduated with Honors."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
