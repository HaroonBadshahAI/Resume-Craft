import React from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { formatMonthYear } from '../../../lib/resume/sample-data';
import { ResumeDateInput } from './ResumeDateInput';
import { Plus, Trash2, FolderKanban, Award } from 'lucide-react';

export const ProjectsAndCertificationsSection: React.FC = () => {
  const projects = useResumeStore((s) => s.resume.projects);
  const certifications = useResumeStore((s) => s.resume.certifications);

  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const deleteProject = useResumeStore((s) => s.deleteProject);

  const addCertification = useResumeStore((s) => s.addCertification);
  const updateCertification = useResumeStore((s) => s.updateCertification);
  const deleteCertification = useResumeStore((s) => s.deleteCertification);

  return (
    <div className="space-y-6">
      {/* PROJECTS SECTION */}
      <section
        id="editor-projects"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Projects (Optional)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Shown on your resume only when project details are filled in.
            </p>
          </div>

          <button
            type="button"
            onClick={addProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl space-y-1.5">
            <FolderKanban className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              No projects added. Click &ldquo;Add Project&rdquo; to showcase portfolio work or case studies.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-slate-800">
                    {proj.title || `Project #${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteProject(proj.id)}
                    aria-label={`Delete Project ${proj.title || idx + 1}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor={`proj-title-${proj.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Project Title
                    </label>
                    <input
                      id={`proj-title-${proj.id}`}
                      type="text"
                      value={proj.title}
                      onChange={(e) =>
                        updateProject(proj.id, { title: e.target.value })
                      }
                      placeholder="e.g. Omnichannel Attribution Dashboard"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`proj-tech-${proj.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Technologies / Tools
                    </label>
                    <input
                      id={`proj-tech-${proj.id}`}
                      type="text"
                      value={proj.technologies}
                      onChange={(e) =>
                        updateProject(proj.id, { technologies: e.target.value })
                      }
                      placeholder="e.g. GA4, Looker Studio, HubSpot"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor={`proj-url-${proj.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Project URL
                    </label>
                    <input
                      id={`proj-url-${proj.id}`}
                      type="url"
                      value={proj.url}
                      onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                      placeholder="e.g. github.com/username/project"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor={`proj-desc-${proj.id}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Description
                    </label>
                    <textarea
                      id={`proj-desc-${proj.id}`}
                      rows={2}
                      value={proj.description}
                      onChange={(e) =>
                        updateProject(proj.id, { description: e.target.value })
                      }
                      placeholder="Briefly describe what you built and its measurable outcome..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CERTIFICATIONS SECTION */}
      <section
        id="editor-certifications"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Certifications (Optional)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Professional licenses, credentials, and industry certifications.
            </p>
          </div>

          <button
            type="button"
            onClick={addCertification}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        </div>

        {certifications.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl space-y-1.5">
            <Award className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              No certifications listed. Click &ldquo;Add Certification&rdquo; to include credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {certifications.map((cert, idx) => {
              const formattedIssue = formatMonthYear(cert.issueDate);
              return (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        {cert.name || `Certification #${idx + 1}`}
                      </span>
                      {formattedIssue && (
                        <span className="ml-2 text-xs text-slate-500 tabular-nums">
                          ({formattedIssue})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCertification(cert.id)}
                      aria-label={`Delete Certification ${cert.name || idx + 1}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <label
                        htmlFor={`cert-name-${cert.id}`}
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Certification Name
                      </label>
                      <input
                        id={`cert-name-${cert.id}`}
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(cert.id, { name: e.target.value })
                        }
                        placeholder="e.g. Google Analytics Certification"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label
                        htmlFor={`cert-issuer-${cert.id}`}
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Issuing Organization
                      </label>
                      <input
                        id={`cert-issuer-${cert.id}`}
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(cert.id, { issuer: e.target.value })
                        }
                        placeholder="e.g. Google"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label
                        htmlFor={`cert-date-${cert.id}`}
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Issue Date
                      </label>
                      <ResumeDateInput
                        id={`cert-date-${cert.id}`}
                        value={cert.issueDate}
                        onChange={(val) =>
                          updateCertification(cert.id, { issueDate: val })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
