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
 * Template 8: Swiss Editorial Grid (International Typographic Style)
 * Inspired by Josef Müller-Brockmann / Pentagram editorial resumes:
 * - Architectural exposed hairline grid lines (1px solid)
 * - Asymmetric 12-column layout (3 cols left section index / 9 cols right content)
 * - Oversized geometric display typography and ultra-clean negative space
 */
export const SwissTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    <div className="w-full min-h-[1123px] bg-white text-slate-950 px-10 py-10 font-sans">
      {/* Top Architectural Grid Header */}
      <header
        data-pdf-block
        className="grid grid-cols-12 border-t-4 border-b border-slate-900 py-6 gap-6 items-start"
        style={{ borderTopColor: palette.hex }}
      >
        <div className="col-span-8 pr-4">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5"
            style={{ color: palette.hex }}
          >
            Curriculum Vitae — Dossier
          </div>
          <h1 className="text-[32px] font-black tracking-tight text-slate-950 leading-[1.05]">
            {personal.fullName || 'Your Full Name'}
          </h1>
          <p className="text-[14px] font-medium text-slate-600 mt-1.5">
            {personal.jobTitle || 'Professional Title'}
          </p>
        </div>

        <div className="col-span-4 border-l border-slate-200 pl-4 flex flex-col justify-between gap-3">
          {personal.photo && photoSettings.visible && (
            <div className="mb-1">
              <ProfilePortrait
                personal={personal}
                photoSettings={photoSettings}
                sizePx={64}
                borderColor={palette.hex}
              />
            </div>
          )}
          <div className="space-y-1 text-[10.5px] text-slate-700 leading-snug">
            {personal.email && (
              <div className="truncate font-medium">{personal.email}</div>
            )}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.location && <div>{personal.location}</div>}
            {personal.linkedin && (
              <div className="truncate text-slate-500">{personal.linkedin}</div>
            )}
            {personal.website && (
              <div
                className="truncate font-medium"
                style={{ color: palette.hex }}
              >
                {personal.website}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Editorial Grid Sections */}
      <div className="divide-y divide-slate-200">
        {/* 01 / Profile */}
        {summary.trim() && (
          <section data-pdf-block className="grid grid-cols-12 py-5 gap-6">
            <div className="col-span-3 pr-2">
              <div
                className="text-[10px] font-mono font-bold"
                style={{ color: palette.hex }}
              >
                01
              </div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-900 mt-0.5">
                Profile
              </h2>
            </div>
            <div className="col-span-9">
              <p className="text-[12px] leading-[1.62] text-slate-800 font-normal">
                {summary}
              </p>
            </div>
          </section>
        )}

        {/* 02 / Experience */}
        {validExperience.length > 0 && (
          <section className="grid grid-cols-12 py-5 gap-6">
            <div data-pdf-block className="col-span-3 pr-2">
              <div
                className="text-[10px] font-mono font-bold"
                style={{ color: palette.hex }}
              >
                02
              </div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-900 mt-0.5">
                Experience
              </h2>
            </div>
            <div className="col-span-9 space-y-5">
              {validExperience.map((exp) => {
                const dateStr = formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.isCurrent
                );
                const bullets = exp.achievements.filter((b) => b.trim());
                return (
                  <div key={exp.id} data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[13px] font-bold text-slate-950">
                        {exp.jobTitle || 'Role Title'}
                      </h3>
                      {dateStr && (
                        <span className="text-[10.5px] font-mono text-slate-500 shrink-0">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[11.5px] font-semibold mt-0.5"
                      style={{ color: palette.hex }}
                    >
                      {exp.company}
                      {exp.location ? ` — ${exp.location}` : ''}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            className="text-[11.3px] leading-[1.52] text-slate-700 flex items-start gap-2.5"
                          >
                            <span
                              className="w-1.5 h-[2px] mt-[8px] shrink-0"
                              style={{ backgroundColor: palette.hex }}
                            />
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

        {/* 03 / Education */}
        {validEducation.length > 0 && (
          <section className="grid grid-cols-12 py-5 gap-6">
            <div data-pdf-block className="col-span-3 pr-2">
              <div
                className="text-[10px] font-mono font-bold"
                style={{ color: palette.hex }}
              >
                03
              </div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-900 mt-0.5">
                Education
              </h2>
            </div>
            <div className="col-span-9 space-y-3.5">
              {validEducation.map((edu) => {
                const dateStr = formatDateRange(
                  edu.startDate,
                  edu.endDate,
                  false
                );
                return (
                  <div key={edu.id} data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[12.5px] font-bold text-slate-950">
                        {edu.degree}
                      </h3>
                      {dateStr && (
                        <span className="text-[10.5px] font-mono text-slate-500 shrink-0">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-700">
                      {edu.institution}
                      {edu.location ? `, ${edu.location}` : ''}
                    </div>
                    {edu.description && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 04 / Selected Works & Projects */}
        {validProjects.length > 0 && (
          <section className="grid grid-cols-12 py-5 gap-6">
            <div data-pdf-block className="col-span-3 pr-2">
              <div
                className="text-[10px] font-mono font-bold"
                style={{ color: palette.hex }}
              >
                04
              </div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-900 mt-0.5">
                Selected Works
              </h2>
            </div>
            <div className="col-span-9 grid grid-cols-2 gap-4">
              {validProjects.map((proj) => (
                <div
                  key={proj.id}
                  data-pdf-block
                  className="border-t-2 pt-2"
                  style={{ borderColor: palette.hex }}
                >
                  <h3 className="text-[12px] font-bold text-slate-950">
                    {proj.title}
                  </h3>
                  {proj.technologies && (
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {proj.technologies}
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

        {/* 05 / Capabilities & Credentials */}
        {(skills.length > 0 ||
          validLanguages.length > 0 ||
          validCertifications.length > 0) && (
          <section data-pdf-block className="grid grid-cols-12 py-5 gap-6">
            <div className="col-span-3 pr-2">
              <div
                className="text-[10px] font-mono font-bold"
                style={{ color: palette.hex }}
              >
                05
              </div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-900 mt-0.5">
                Capabilities
              </h2>
            </div>
            <div className="col-span-9 grid grid-cols-12 gap-6">
              {skills.length > 0 && (
                <div className="col-span-7">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Core Disciplines
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10.5px] font-medium px-2 py-0.5 border border-slate-300 text-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-5 space-y-3">
                {validLanguages.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Languages
                    </h3>
                    <div className="space-y-0.5 text-[11px]">
                      {validLanguages.map((l) => (
                        <div key={l.id} className="flex justify-between">
                          <span className="font-medium text-slate-900">
                            {l.name}
                          </span>
                          <span className="text-slate-500">{l.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {validCertifications.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Credentials
                    </h3>
                    <div className="space-y-1 text-[10.5px]">
                      {validCertifications.map((c) => (
                        <div key={c.id} className="text-slate-800">
                          <span className="font-semibold">{c.name}</span>
                          {c.issuer ? ` — ${c.issuer}` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
