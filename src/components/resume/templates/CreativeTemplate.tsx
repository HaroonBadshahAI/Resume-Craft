import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import { formatDateRange, formatMonthYear, getAccentPalette } from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  return (
    <div className="w-full min-h-[1123px] bg-white text-[#0F172A] flex flex-col font-sans">
      {/* BOLD PROFESSIONAL HEADER BLOCK */}
      <header
        className="px-10 py-8 text-white flex items-center justify-between gap-6"
        style={{ backgroundColor: accentColor }}
        data-pdf-block
      >
        <div className="flex-1 space-y-2">
          <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.16em] bg-white/15 text-white">
            {personal.jobTitle || 'Creative Professional'}
          </div>
          <h1 className="text-[30px] font-extrabold tracking-tight leading-tight text-white">
            {personal.fullName || 'Your Name'}
          </h1>

          {/* Contact Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-white/90">
            {personal.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 opacity-80" />
                {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 opacity-80" />
                {personal.phone}
              </span>
            )}
            {personal.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-80" />
                {personal.location}
              </span>
            )}
            {personal.linkedin && (
              <span className="inline-flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 opacity-80" />
                {personal.linkedin}
              </span>
            )}
            {personal.website && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 opacity-80" />
                {personal.website}
              </span>
            )}
          </div>
        </div>

        <ProfilePortrait
          personal={personal}
          photoSettings={photoSettings}
          sizePx={96}
          borderColor="rgba(255,255,255,0.5)"
        />
      </header>

      {/* DISTINCTIVE ACCENT SUMMARY BLOCK */}
      {summary.trim() && (
        <div
          className="px-10 py-5 border-b border-slate-200"
          style={{ backgroundColor: palette.lightBg }}
          data-pdf-block
        >
          <p className="text-[12.5px] leading-[1.65] text-slate-800 font-medium whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* MODERN TWO-COLUMN BODY */}
      <div className="flex-1 px-10 py-7 grid grid-cols-12 gap-8">
        {/* LEFT MAIN COLUMN (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Experience */}
          {validExperience.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2.5" data-pdf-block>
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Experience
                </h2>
              </div>

              <div className="space-y-4">
                {validExperience.map((exp) => {
                  const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
                  const bullets = exp.achievements.map((b) => b.trim()).filter(Boolean);
                  return (
                    <div
                      key={exp.id}
                      className="p-4 rounded-lg border border-slate-200/90 bg-slate-50/50 space-y-1.5"
                      data-pdf-block
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[14px] font-bold text-slate-900">
                          {exp.jobTitle || 'Role Title'}
                        </h3>
                        {dateRange && (
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded shrink-0 tabular-nums"
                            style={{
                              backgroundColor: palette.lightBg,
                              color: accentColor,
                            }}
                          >
                            {dateRange}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] font-semibold text-slate-600">
                        {exp.company}
                        {exp.location ? (
                          <span className="font-normal text-slate-500"> · {exp.location}</span>
                        ) : null}
                      </div>
                      {bullets.length > 0 && (
                        <ul className="pt-1 space-y-1 text-[12px] leading-[1.55] text-slate-700 list-disc pl-4">
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

          {/* Projects */}
          {validProjects.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center gap-2.5" data-pdf-block>
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Selected Projects
                </h2>
              </div>

              <div className="space-y-3">
                {validProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-lg border border-slate-200/90 space-y-1"
                    data-pdf-block
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[13.5px] font-bold text-slate-900">{proj.title}</h3>
                      {proj.url.trim() && (
                        <span className="text-[11px] font-medium" style={{ color: accentColor }}>
                          {proj.url}
                        </span>
                      )}
                    </div>
                    {proj.technologies.trim() && (
                      <div className="text-[11px] font-semibold text-slate-500">
                        {proj.technologies}
                      </div>
                    )}
                    {proj.description.trim() && (
                      <p className="text-[12px] leading-[1.55] text-slate-700">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT ACCENT COLUMN (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Skills Block */}
          {validSkills.length > 0 && (
            <section
              className="p-4 rounded-xl border space-y-3"
              style={{
                backgroundColor: palette.lightBg,
                borderColor: palette.borderHex,
              }}
              data-pdf-block
            >
              <h2
                className="text-[11.5px] font-extrabold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                Toolkit & Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {validSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-white rounded-md text-[11px] font-semibold text-slate-800 border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education Block */}
          {validEducation.length > 0 && (
            <section className="space-y-3" data-pdf-block>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Education
                </h2>
              </div>
              <div className="space-y-3">
                {validEducation.map((edu) => {
                  const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
                  return (
                    <div key={edu.id} className="space-y-0.5 text-[12px]">
                      <div className="font-bold text-slate-900 leading-snug">
                        {edu.degree || 'Degree'}
                      </div>
                      <div className="font-medium text-slate-700">{edu.institution}</div>
                      {dateRange && (
                        <div
                          className="text-[11px] font-semibold tabular-nums"
                          style={{ color: accentColor }}
                        >
                          {dateRange}
                        </div>
                      )}
                      {edu.description.trim() && (
                        <p className="text-[11.5px] text-slate-600 pt-0.5 leading-snug">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Languages Block */}
          {validLanguages.length > 0 && (
            <section className="space-y-2.5" data-pdf-block>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Languages
                </h2>
              </div>
              <div className="space-y-2">
                {validLanguages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200/80 text-[11.5px]"
                  >
                    <span className="font-bold text-slate-800">{lang.name}</span>
                    <span
                      className="font-semibold text-[11px]"
                      style={{ color: accentColor }}
                    >
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications Block */}
          {validCertifications.length > 0 && (
            <section className="space-y-2.5" data-pdf-block>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Certifications
                </h2>
              </div>
              <div className="space-y-2.5">
                {validCertifications.map((cert) => (
                  <div key={cert.id} className="text-[12px]">
                    <div className="font-bold text-slate-900 leading-snug">{cert.name}</div>
                    <div className="text-[11px] text-slate-600">
                      {[cert.issuer, formatMonthYear(cert.issueDate)].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
