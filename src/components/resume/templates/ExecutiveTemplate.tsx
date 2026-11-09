import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import { formatDateRange, formatMonthYear } from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';

interface TemplateProps {
  data: ResumeData;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  // Executive template retains its signature deep navy header (#0B132B) with warm gold (#D4AF37)
  // while weaving the user's selected accent color into section titles and highlights
  const executiveNavy = '#0F172A';
  const executiveGold = '#C59B27';

  const contactItems = [
    personal.location,
    personal.phone,
    personal.email,
    personal.linkedin,
    personal.website,
  ]
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="w-full min-h-[1123px] bg-white text-[#0F172A] flex flex-col font-sans">
      {/* EXECUTIVE DARK NAVY & GOLD HEADER */}
      <header
        className="px-12 py-9 text-white flex items-center justify-between gap-6 border-b-4"
        style={{
          backgroundColor: executiveNavy,
          borderColor: executiveGold,
        }}
        data-pdf-block
      >
        <div className="space-y-2 flex-1">
          <h1
            className="text-[32px] font-bold tracking-wide text-white leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.jobTitle && (
            <div
              className="text-[13px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: executiveGold }}
            >
              {personal.jobTitle}
            </div>
          )}

          {contactItems.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-300">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span style={{ color: executiveGold }} aria-hidden="true">
                      •
                    </span>
                  )}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <ProfilePortrait
          personal={personal}
          photoSettings={photoSettings}
          sizePx={92}
          borderColor={executiveGold}
        />
      </header>

      {/* BODY */}
      <div className="px-12 py-8 flex flex-col gap-6 flex-1">
        {/* EXECUTIVE SUMMARY */}
        {summary.trim() && (
          <section data-pdf-block>
            <div className="flex items-center gap-3 mb-2.5">
              <h2
                className="text-[13px] font-bold uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                Executive Profile
              </h2>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
            </div>
            <p className="text-[12.5px] leading-[1.7] text-slate-800 whitespace-pre-line">
              {summary}
            </p>
          </section>
        )}

        {/* CORE COMPETENCIES */}
        {validSkills.length > 0 && (
          <section data-pdf-block>
            <div className="flex items-center gap-3 mb-2.5">
              <h2
                className="text-[13px] font-bold uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                Areas of Expertise
              </h2>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
            </div>
            <div className="grid grid-cols-4 gap-x-4 gap-y-1.5 pt-0.5">
              {validSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 text-[12px] font-medium text-slate-800"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: executiveGold }}
                  />
                  <span className="truncate">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LEADERSHIP & EXPERIENCE */}
        {validExperience.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3" data-pdf-block>
              <h2
                className="text-[13px] font-bold uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                Professional Experience
              </h2>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
            </div>

            <div className="space-y-4">
              {validExperience.map((exp) => {
                const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
                const bullets = exp.achievements.map((b) => b.trim()).filter(Boolean);
                return (
                  <div key={exp.id} className="space-y-1.5" data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-1">
                      <div>
                        <span className="text-[14px] font-bold text-slate-900">
                          {exp.jobTitle || 'Role Title'}
                        </span>
                        {exp.company && (
                          <span className="text-[13px] font-semibold" style={{ color: accentColor }}>
                            {' '}
                            | {exp.company}
                          </span>
                        )}
                        {exp.location && (
                          <span className="text-[12px] text-slate-500"> · {exp.location}</span>
                        )}
                      </div>
                      {dateRange && (
                        <span className="text-[11.5px] font-bold text-slate-700 shrink-0 tabular-nums">
                          {dateRange}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="space-y-1 text-[12px] leading-[1.6] text-slate-700 list-disc pl-5">
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

        {/* STRATEGIC PROJECTS */}
        {validProjects.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center gap-3" data-pdf-block>
              <h2
                className="text-[13px] font-bold uppercase tracking-[0.16em]"
                style={{ color: accentColor }}
              >
                Key Initiatives & Projects
              </h2>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
            </div>

            <div className="space-y-3">
              {validProjects.map((proj) => (
                <div key={proj.id} className="space-y-0.5" data-pdf-block>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[13.5px] font-bold text-slate-900">
                      {proj.title}
                      {proj.technologies.trim() && (
                        <span className="text-[11.5px] font-medium text-slate-500">
                          {' '}
                          ({proj.technologies})
                        </span>
                      )}
                    </h3>
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

        {/* EDUCATION, LANGUAGES & CERTIFICATIONS */}
        <div className="grid grid-cols-12 gap-8 pt-1" data-pdf-block>
          {validEducation.length > 0 && (
            <div
              className={
                validLanguages.length > 0 || validCertifications.length > 0
                  ? 'col-span-7 space-y-2.5'
                  : 'col-span-12 space-y-2.5'
              }
            >
              <div className="flex items-center gap-3">
                <h2
                  className="text-[13px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: accentColor }}
                >
                  Education
                </h2>
                <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
              </div>

              <div className="space-y-2.5">
                {validEducation.map((edu) => {
                  const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
                  return (
                    <div key={edu.id} className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[13px] font-bold text-slate-900">
                          {edu.degree || 'Degree'}
                        </h3>
                        {dateRange && (
                          <span className="text-[11px] font-semibold text-slate-600 tabular-nums shrink-0">
                            {dateRange}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] font-medium text-slate-700">
                        {[edu.institution, edu.location].filter(Boolean).join(' · ')}
                      </div>
                      {edu.description.trim() && (
                        <p className="text-[11.5px] text-slate-600 leading-snug">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(validLanguages.length > 0 || validCertifications.length > 0) && (
            <div
              className={
                validEducation.length > 0 ? 'col-span-5 space-y-4' : 'col-span-12 space-y-4'
              }
            >
              {validLanguages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-[13px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: accentColor }}
                    >
                      Languages
                    </h2>
                    <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
                  </div>
                  <div className="space-y-1 text-[12px]">
                    {validLanguages.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{lang.name}</span>
                        <span className="text-slate-600">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validCertifications.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-[13px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: accentColor }}
                    >
                      Credentials
                    </h2>
                    <div className="flex-1 h-[1px]" style={{ backgroundColor: executiveGold }} />
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    {validCertifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="font-semibold text-slate-900 leading-snug">
                          {cert.name}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {[cert.issuer, formatMonthYear(cert.issueDate)]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
