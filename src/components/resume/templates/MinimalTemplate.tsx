import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import { formatDateRange, formatMonthYear } from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';

interface TemplateProps {
  data: ResumeData;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  const validExperience = experience.filter(
    (e) => e.jobTitle.trim() || e.company.trim() || e.achievements.some((a) => a.trim())
  );
  const validEducation = education.filter(
    (e) => e.degree.trim() || e.institution.trim() || e.description.trim()
  );
  const validSkills = skills.map((s) => s.trim()).filter(Boolean);
  const validLanguages = languages.filter((l) => l.name.trim());
  const validProjects = projects.filter(
    (p) => p.title.trim() || p.description.trim() || p.technologies.trim()
  );
  const validCertifications = certifications.filter(
    (c) => c.name.trim() || c.issuer.trim()
  );

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.website,
  ]
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="w-full min-h-[1123px] bg-white text-[#0F172A] px-12 py-10 flex flex-col gap-5 font-sans">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-6 pb-4 border-b border-slate-200" data-pdf-block>
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.jobTitle && (
            <p className="text-[13.5px] font-medium" style={{ color: accentColor }}>
              {personal.jobTitle}
            </p>
          )}
          {contactItems.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-slate-600">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">|</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Minimal ATS hides photo by default, but renders it if user explicitly toggles Show Photo */}
        <ProfilePortrait
          personal={personal}
          photoSettings={photoSettings}
          sizePx={72}
          borderColor="#E2E8F0"
        />
      </header>

      {/* SUMMARY */}
      {summary.trim() && (
        <section data-pdf-block>
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2"
            style={{ color: accentColor }}
          >
            Summary
          </h2>
          <p className="text-[12.5px] leading-[1.65] text-slate-800 whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* EXPERIENCE */}
      {validExperience.length > 0 && (
        <section className="space-y-4">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accentColor }}
            data-pdf-block
          >
            Experience
          </h2>
          <div className="space-y-4">
            {validExperience.map((exp) => {
              const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
              const bullets = exp.achievements.map((b) => b.trim()).filter(Boolean);
              return (
                <div key={exp.id} className="space-y-1" data-pdf-block>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-[13.5px] font-bold text-slate-900">
                      {exp.jobTitle || 'Role Title'}
                      {exp.company && (
                        <span className="font-medium text-slate-700"> · {exp.company}</span>
                      )}
                      {exp.location && (
                        <span className="font-normal text-slate-500"> ({exp.location})</span>
                      )}
                    </div>
                    {dateRange && (
                      <span className="text-[11.5px] text-slate-500 shrink-0 tabular-nums">
                        {dateRange}
                      </span>
                    )}
                  </div>
                  {bullets.length > 0 && (
                    <ul className="space-y-1 text-[12px] leading-[1.55] text-slate-700 list-disc pl-4">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {validEducation.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accentColor }}
            data-pdf-block
          >
            Education
          </h2>
          <div className="space-y-3">
            {validEducation.map((edu) => {
              const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
              return (
                <div key={edu.id} className="space-y-0.5" data-pdf-block>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-[13px] font-bold text-slate-900">
                      {edu.degree || 'Degree'}
                      {edu.institution && (
                        <span className="font-normal text-slate-700"> · {edu.institution}</span>
                      )}
                      {edu.location && (
                        <span className="font-normal text-slate-500"> ({edu.location})</span>
                      )}
                    </div>
                    {dateRange && (
                      <span className="text-[11.5px] text-slate-500 shrink-0 tabular-nums">
                        {dateRange}
                      </span>
                    )}
                  </div>
                  {edu.description.trim() && (
                    <p className="text-[12px] text-slate-600 leading-[1.5]">{edu.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {validSkills.length > 0 && (
        <section data-pdf-block>
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
            style={{ color: accentColor }}
          >
            Skills
          </h2>
          <p className="text-[12px] leading-[1.6] text-slate-800">
            {validSkills.join(', ')}
          </p>
        </section>
      )}

      {/* PROJECTS */}
      {validProjects.length > 0 && (
        <section className="space-y-2.5">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accentColor }}
            data-pdf-block
          >
            Projects
          </h2>
          <div className="space-y-2.5">
            {validProjects.map((proj) => (
              <div key={proj.id} className="space-y-0.5" data-pdf-block>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-[13px] font-bold text-slate-900">
                    {proj.title}
                    {proj.technologies.trim() && (
                      <span className="font-normal text-slate-600">
                        {' '}
                        — {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.url.trim() && (
                    <span className="text-[11px] text-slate-500">{proj.url}</span>
                  )}
                </div>
                {proj.description.trim() && (
                  <p className="text-[12px] leading-[1.55] text-slate-700">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LANGUAGES & CERTIFICATIONS */}
      {(validLanguages.length > 0 || validCertifications.length > 0) && (
        <div className="grid grid-cols-2 gap-8 pt-1" data-pdf-block>
          {validLanguages.length > 0 && (
            <section>
              <h2
                className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: accentColor }}
              >
                Languages
              </h2>
              <div className="space-y-1 text-[12px] text-slate-800">
                {validLanguages.map((lang) => (
                  <div key={lang.id}>
                    <span className="font-medium">{lang.name}</span> —{' '}
                    <span className="text-slate-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {validCertifications.length > 0 && (
            <section>
              <h2
                className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: accentColor }}
              >
                Certifications
              </h2>
              <div className="space-y-1 text-[12px] text-slate-800">
                {validCertifications.map((cert) => (
                  <div key={cert.id}>
                    <span className="font-medium">{cert.name}</span>
                    {(cert.issuer || cert.issueDate) && (
                      <span className="text-slate-600">
                        {' '}
                        — {[cert.issuer, formatMonthYear(cert.issueDate)].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
