import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import {
  formatDateRange,
  formatMonthYear,
  getAccentPalette,
} from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';

interface TemplateProps {
  data: ResumeData;
}

/**
 * Template 7: Tech Minimal / LaTeX Awesome-CV Inspired
 * Designed for Software Engineers, Data Scientists, DevOps, and Technical PMs:
 * - Monospace metadata tags & numbered section indices (01 // SKILLS, 02 // EXPERIENCE)
 * - Prominent top Technical Stack bar for instant technical screening
 * - High-contrast code-inspired typography with crisp left border accents
 */
export const TechTemplate: React.FC<TemplateProps> = ({ data }) => {
  const {
    personal,
    summary,
    experience,
    education,
    skills,
    languages,
    projects,
    certifications,
    accentColor,
    photoSettings,
  } = data;

  const palette = getAccentPalette(accentColor);

  const validExperience = experience.filter(
    (e) =>
      e.jobTitle.trim() ||
      e.company.trim() ||
      e.achievements.some((a) => a.trim())
  );
  const validEducation = education.filter(
    (e) => e.degree.trim() || e.institution.trim()
  );
  const validLanguages = languages.filter((l) => l.name.trim());
  const validProjects = projects.filter(
    (p) => p.title.trim() || p.description.trim()
  );
  const validCertifications = certifications.filter((c) => c.name.trim());

  return (
    <div className="w-full min-h-[1123px] bg-white text-slate-900 px-10 py-9 font-sans">
      {/* Top Technical Header */}
      <header
        data-pdf-block
        className="pb-5 mb-5 border-b-2 flex items-start justify-between gap-6"
        style={{ borderColor: '#0F172A' }}
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs text-white uppercase tracking-wider"
              style={{ backgroundColor: palette.hex }}
            >
              CV // SPEC
            </span>
            {personal.location && (
              <span className="font-mono text-[11px] text-slate-500">
                {personal.location}
              </span>
            )}
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-950 leading-none">
            {personal.fullName || 'Your Full Name'}
          </h1>
          <p
            className="font-mono text-[13px] font-semibold"
            style={{ color: palette.hex }}
          >
            {personal.jobTitle || 'Software & Systems Engineer'}
          </p>

          <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-slate-600">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.website && <span>{personal.website}</span>}
          </div>
        </div>

        {personal.photo && photoSettings.visible && (
          <ProfilePortrait
            personal={personal}
            photoSettings={photoSettings}
            sizePx={74}
            borderColor={palette.hex}
          />
        )}
      </header>

      <div className="space-y-5">
        {/* Summary */}
        {summary.trim() && (
          <section data-pdf-block>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ color: palette.hex }}
              >
                01 //
              </span>
              <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Architecture & Profile
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>
            <p className="text-[11.3px] leading-[1.58] text-slate-700">
              {summary}
            </p>
          </section>
        )}

        {/* Prominent Technical Stack Matrix */}
        {skills.length > 0 && (
          <section data-pdf-block>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ color: palette.hex }}
              >
                02 //
              </span>
              <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Technical Stack & Core Competencies
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>
            <div
              className="p-3 rounded-md border flex flex-wrap gap-1.5"
              style={{
                backgroundColor: palette.lightBg,
                borderColor: palette.borderHex,
              }}
            >
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-[10.5px] font-medium px-2 py-0.5 rounded-xs bg-white text-slate-800 border"
                  style={{ borderColor: palette.borderHex }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {validExperience.length > 0 && (
          <section>
            <div data-pdf-block className="flex items-center gap-2 mb-2.5">
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ color: palette.hex }}
              >
                03 //
              </span>
              <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Engineering & Work Experience
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>
            <div className="space-y-4">
              {validExperience.map((exp) => {
                const dateStr = formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.isCurrent
                );
                const bullets = exp.achievements.filter((b) => b.trim());
                return (
                  <div
                    key={exp.id}
                    data-pdf-block
                    className="pl-3.5 border-l-2"
                    style={{ borderColor: palette.hex }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-bold text-slate-950 inline">
                          {exp.jobTitle || 'Role Title'}
                        </h3>
                        {exp.company && (
                          <span
                            className="text-[12px] font-semibold ml-1.5"
                            style={{ color: palette.hex }}
                          >
                            @ {exp.company}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-500 shrink-0">
                        {dateStr}
                        {exp.location ? ` | ${exp.location}` : ''}
                      </div>
                    </div>

                    {bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {bullets.map((b, idx) => (
                          <li
                            key={idx}
                            className="text-[11.2px] leading-[1.52] text-slate-700 flex items-start gap-2"
                          >
                            <span
                              className="font-mono text-[10px] mt-[2px] shrink-0"
                              style={{ color: palette.hex }}
                            >
                              &gt;
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {validProjects.length > 0 && (
          <section>
            <div data-pdf-block className="flex items-center gap-2 mb-2.5">
              <span
                className="font-mono text-[10.5px] font-bold"
                style={{ color: palette.hex }}
              >
                04 //
              </span>
              <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Systems & Open-Source Projects
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {validProjects.map((proj) => (
                <div
                  key={proj.id}
                  data-pdf-block
                  className="p-3 rounded-md border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[12px] font-bold text-slate-900">
                      {proj.title}
                    </h3>
                    {proj.url && (
                      <span
                        className="font-mono text-[10px] truncate max-w-[140px]"
                        style={{ color: palette.hex }}
                      >
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.technologies && (
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                      [{proj.technologies}]
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-[11px] leading-[1.48] text-slate-700 mt-1">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom 2-Column Grid: Education + Certifications/Languages */}
        <div className="grid grid-cols-12 gap-6 pt-1">
          {validEducation.length > 0 && (
            <section className="col-span-7">
              <div data-pdf-block className="flex items-center gap-2 mb-2">
                <span
                  className="font-mono text-[10.5px] font-bold"
                  style={{ color: palette.hex }}
                >
                  05 //
                </span>
                <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Education
                </h2>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>
              <div className="space-y-2.5">
                {validEducation.map((edu) => {
                  const dateStr = formatDateRange(
                    edu.startDate,
                    edu.endDate,
                    false
                  );
                  return (
                    <div key={edu.id} data-pdf-block>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[12px] font-bold text-slate-900">
                          {edu.degree}
                        </h3>
                        {dateStr && (
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            {dateStr}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] font-medium"
                        style={{ color: palette.hex }}
                      >
                        {edu.institution}
                        {edu.location ? ` · ${edu.location}` : ''}
                      </div>
                      {edu.description && (
                        <p className="text-[10.5px] text-slate-600 mt-0.5">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(validCertifications.length > 0 || validLanguages.length > 0) && (
            <section
              className={
                validEducation.length > 0 ? 'col-span-5' : 'col-span-12'
              }
            >
              <div data-pdf-block className="flex items-center gap-2 mb-2">
                <span
                  className="font-mono text-[10.5px] font-bold"
                  style={{ color: palette.hex }}
                >
                  06 //
                </span>
                <h2 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Certs & Languages
                </h2>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>
              <div className="space-y-2 text-[11px]">
                {validCertifications.map((cert) => (
                  <div key={cert.id} data-pdf-block>
                    <div className="font-bold text-slate-900">{cert.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {cert.issuer}
                      {cert.issueDate
                        ? ` · ${formatMonthYear(cert.issueDate)}`
                        : ''}
                    </div>
                  </div>
                ))}
                {validLanguages.length > 0 && (
                  <div data-pdf-block className="pt-1 flex flex-wrap gap-2">
                    {validLanguages.map((l) => (
                      <span
                        key={l.id}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700"
                      >
                        {l.name}: {l.proficiency}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
