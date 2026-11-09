import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import { formatDateRange, formatMonthYear } from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';

interface TemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    personal.location,
    personal.phone,
    personal.email,
    personal.linkedin,
    personal.website,
  ]
    .map((x) => x.trim())
    .filter(Boolean);

  const hasVisiblePhoto = Boolean(personal.photo && photoSettings.visible);

  return (
    <div className="w-full min-h-[1123px] bg-white text-[#1E293B] px-12 py-10 flex flex-col gap-5 font-sans">
      {/* HEADER */}
      <header
        className="border-b-2 pb-5 flex items-center justify-between gap-6"
        style={{ borderColor: accentColor }}
        data-pdf-block
      >
        <div className={hasVisiblePhoto ? 'text-left flex-1' : 'text-center w-full'}>
          <h1
            className="text-[32px] font-bold tracking-tight leading-tight text-slate-900"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.jobTitle && (
            <p
              className="text-[14px] font-semibold tracking-wide mt-0.5"
              style={{ color: accentColor }}
            >
              {personal.jobTitle}
            </p>
          )}
          {contactItems.length > 0 && (
            <div
              className={`mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-slate-600 ${
                hasVisiblePhoto ? 'justify-start' : 'justify-center'
              }`}
            >
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400">·</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {hasVisiblePhoto && (
          <ProfilePortrait
            personal={personal}
            photoSettings={photoSettings}
            sizePx={84}
            borderColor={accentColor}
          />
        )}
      </header>

      {/* PROFESSIONAL SUMMARY */}
      {summary.trim() && (
        <section data-pdf-block>
          <h2
            className="text-[16px] font-bold uppercase tracking-[0.08em] border-b pb-1 mb-2.5"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: accentColor,
              borderColor: '#CBD5E1',
            }}
          >
            Professional Summary
          </h2>
          <p className="text-[12.5px] leading-[1.65] text-slate-700 whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* PROFESSIONAL EXPERIENCE */}
      {validExperience.length > 0 && (
        <section className="space-y-4">
          <h2
            className="text-[16px] font-bold uppercase tracking-[0.08em] border-b pb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: accentColor,
              borderColor: '#CBD5E1',
            }}
            data-pdf-block
          >
            Professional Experience
          </h2>

          <div className="space-y-4">
            {validExperience.map((exp) => {
              const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
              const bullets = exp.achievements.map((b) => b.trim()).filter(Boolean);
              return (
                <div key={exp.id} className="space-y-1" data-pdf-block>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[14px] font-bold text-slate-900">
                      {exp.company || 'Company Name'}
                      {exp.location ? (
                        <span className="font-normal text-slate-600"> — {exp.location}</span>
                      ) : null}
                    </h3>
                    {dateRange && (
                      <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                        {dateRange}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[12.5px] font-semibold italic"
                    style={{ color: accentColor }}
                  >
                    {exp.jobTitle}
                  </div>
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1 text-[12px] leading-[1.55] text-slate-700 list-disc pl-5">
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
            className="text-[16px] font-bold uppercase tracking-[0.08em] border-b pb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: accentColor,
              borderColor: '#CBD5E1',
            }}
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
                    <h3 className="text-[13.5px] font-bold text-slate-900">
                      {edu.institution || 'Institution'}
                      {edu.location ? (
                        <span className="font-normal text-slate-600"> — {edu.location}</span>
                      ) : null}
                    </h3>
                    {dateRange && (
                      <span className="text-[11.5px] font-semibold text-slate-700 shrink-0 tabular-nums">
                        {dateRange}
                      </span>
                    )}
                  </div>
                  <div className="text-[12.5px] font-medium text-slate-800">{edu.degree}</div>
                  {edu.description.trim() && (
                    <p className="text-[12px] leading-[1.55] text-slate-600 pt-0.5">
                      {edu.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {validProjects.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-[16px] font-bold uppercase tracking-[0.08em] border-b pb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: accentColor,
              borderColor: '#CBD5E1',
            }}
            data-pdf-block
          >
            Notable Projects
          </h2>
          <div className="space-y-3">
            {validProjects.map((proj) => (
              <div key={proj.id} className="space-y-0.5" data-pdf-block>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[13.5px] font-bold text-slate-900">{proj.title}</h3>
                  {proj.url.trim() && (
                    <span className="text-[11px] text-slate-500">{proj.url}</span>
                  )}
                </div>
                {proj.technologies.trim() && (
                  <div className="text-[11.5px] italic text-slate-600">
                    Technologies: {proj.technologies}
                  </div>
                )}
                {proj.description.trim() && (
                  <p className="text-[12px] leading-[1.55] text-slate-700">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS, LANGUAGES & CERTIFICATIONS */}
      {(validSkills.length > 0 ||
        validLanguages.length > 0 ||
        validCertifications.length > 0) && (
        <section className="space-y-3" data-pdf-block>
          <h2
            className="text-[16px] font-bold uppercase tracking-[0.08em] border-b pb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: accentColor,
              borderColor: '#CBD5E1',
            }}
          >
            Skills, Languages & Certifications
          </h2>

          <div className="space-y-2 text-[12px] leading-[1.6]">
            {validSkills.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Core Competencies: </span>
                <span className="text-slate-700">{validSkills.join(' · ')}</span>
              </div>
            )}

            {validLanguages.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Languages: </span>
                <span className="text-slate-700">
                  {validLanguages
                    .map((l) => `${l.name} (${l.proficiency})`)
                    .join(' · ')}
                </span>
              </div>
            )}

            {validCertifications.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Certifications: </span>
                <span className="text-slate-700">
                  {validCertifications
                    .map((c) => {
                      const dateStr = formatMonthYear(c.issueDate);
                      const meta = [c.issuer, dateStr].filter(Boolean).join(', ');
                      return meta ? `${c.name} (${meta})` : c.name;
                    })
                    .join(' · ')}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
