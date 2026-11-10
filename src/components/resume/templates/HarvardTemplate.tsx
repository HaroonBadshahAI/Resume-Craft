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
 * Template 6: Harvard Ivy (Professional / Academic / Finance & Consulting Standard)
 * Single-column high-density layout modeled on the Harvard OCS & Wall Street standard:
 * - Centered formal serif header with pipe-separated contact metadata
 * - Full-width uppercase section headers with crisp bottom rule
 * - Institution/Company bold on left, Location right-aligned; Role/Degree italic on left, Date right-aligned
 */
export const HarvardTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  const contactItems = [
    personal.location.trim(),
    personal.phone.trim(),
    personal.email.trim(),
    personal.linkedin.trim(),
    personal.website.trim(),
  ].filter(Boolean);

  return (
    <div className="w-full min-h-[1123px] bg-white text-slate-900 px-12 py-10 font-serif">
      {/* Formal Ivy Header */}
      <header
        data-pdf-block
        className="pb-4 mb-5 border-b-2 text-center relative"
        style={{ borderColor: palette.hex }}
      >
        <div className="flex items-center justify-center gap-5">
          {personal.photo && photoSettings.visible && (
            <ProfilePortrait
              personal={personal}
              photoSettings={photoSettings}
              sizePx={68}
              borderColor={palette.hex}
            />
          )}
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-950 uppercase">
              {personal.fullName || 'Your Full Name'}
            </h1>
            {personal.jobTitle && (
              <p
                className="text-[12.5px] font-semibold tracking-wide mt-0.5 font-sans"
                style={{ color: palette.hex }}
              >
                {personal.jobTitle}
              </p>
            )}
            {contactItems.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-700 font-sans">
                {contactItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <span className="text-slate-400 select-none">•</span>
                    )}
                    <span>{item}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-5 font-sans">
        {/* Executive Summary */}
        {summary.trim() && (
          <section data-pdf-block>
            <h2
              className="font-serif text-[12px] font-bold uppercase tracking-[0.14em] pb-1 mb-2 border-b"
              style={{ color: palette.hex, borderColor: '#cbd5e1' }}
            >
              Executive Summary
            </h2>
            <p className="text-[11.5px] leading-[1.6] text-slate-800 text-justify">
              {summary}
            </p>
          </section>
        )}

        {/* Education (Placed prominently in Harvard/Consulting style if present, followed by Experience) */}
        {validExperience.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="font-serif text-[12px] font-bold uppercase tracking-[0.14em] pb-1 mb-2.5 border-b"
              style={{ color: palette.hex, borderColor: '#cbd5e1' }}
            >
              Professional Experience
            </h2>
            <div className="space-y-4">
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
                      <span className="text-[12.5px] font-bold text-slate-950">
                        {exp.company || 'Organization'}
                      </span>
                      {exp.location && (
                        <span className="text-[11px] font-medium text-slate-700 shrink-0">
                          {exp.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-4 mt-0.5">
                      <h3
                        className="text-[11.5px] font-semibold italic"
                        style={{ color: palette.secondaryHex }}
                      >
                        {exp.jobTitle || 'Role Title'}
                      </h3>
                      {dateStr && (
                        <span className="text-[11px] text-slate-600 shrink-0">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 pl-4 list-disc">
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            className="text-[11.2px] leading-[1.52] text-slate-800 pl-0.5"
                          >
                            {b}
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

        {/* Education */}
        {validEducation.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="font-serif text-[12px] font-bold uppercase tracking-[0.14em] pb-1 mb-2.5 border-b"
              style={{ color: palette.hex, borderColor: '#cbd5e1' }}
            >
              Education
            </h2>
            <div className="space-y-3">
              {validEducation.map((edu) => {
                const dateStr = formatDateRange(
                  edu.startDate,
                  edu.endDate,
                  false
                );
                return (
                  <div key={edu.id} data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[12px] font-bold text-slate-950">
                        {edu.institution || 'University / Institution'}
                      </span>
                      {edu.location && (
                        <span className="text-[11px] font-medium text-slate-700 shrink-0">
                          {edu.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-4 mt-0.5">
                      <span className="text-[11.5px] italic text-slate-800">
                        {edu.degree}
                      </span>
                      {dateStr && (
                        <span className="text-[11px] text-slate-600 shrink-0">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    {edu.description.trim() && (
                      <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Key Projects / Leadership */}
        {validProjects.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="font-serif text-[12px] font-bold uppercase tracking-[0.14em] pb-1 mb-2.5 border-b"
              style={{ color: palette.hex, borderColor: '#cbd5e1' }}
            >
              Selected Initiatives & Projects
            </h2>
            <div className="space-y-2.5">
              {validProjects.map((proj) => (
                <div key={proj.id} data-pdf-block>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[11.5px] font-bold text-slate-950">
                      {proj.title}
                      {proj.technologies.trim() && (
                        <span className="font-normal italic text-slate-600">
                          {' '}
                          — {proj.technologies}
                        </span>
                      )}
                    </h3>
                    {proj.url.trim() && (
                      <span className="text-[10.5px] text-slate-500">
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.description.trim() && (
                    <p className="text-[11px] leading-[1.5] text-slate-800 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills, Certifications & Languages */}
        {(skills.length > 0 ||
          validLanguages.length > 0 ||
          validCertifications.length > 0) && (
          <section data-pdf-block>
            <h2
              className="font-serif text-[12px] font-bold uppercase tracking-[0.14em] pb-1 mb-2 border-b"
              style={{ color: palette.hex, borderColor: '#cbd5e1' }}
            >
              Skills, Credentials & Languages
            </h2>
            <div className="space-y-1.5 text-[11.2px] leading-[1.55] text-slate-800">
              {skills.length > 0 && (
                <div>
                  <span className="font-bold text-slate-950">
                    Core Competencies:{' '}
                  </span>
                  <span>{skills.join(' • ')}</span>
                </div>
              )}
              {validCertifications.length > 0 && (
                <div>
                  <span className="font-bold text-slate-950">
                    Certifications:{' '}
                  </span>
                  <span>
                    {validCertifications
                      .map((c) => {
                        const d = formatMonthYear(c.issueDate);
                        return `${c.name}${c.issuer ? ` (${c.issuer}${d ? `, ${d}` : ''})` : ''}`;
                      })
                      .join(' • ')}
                  </span>
                </div>
              )}
              {validLanguages.length > 0 && (
                <div>
                  <span className="font-bold text-slate-950">Languages: </span>
                  <span>
                    {validLanguages
                      .map((l) => `${l.name} (${l.proficiency})`)
                      .join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
