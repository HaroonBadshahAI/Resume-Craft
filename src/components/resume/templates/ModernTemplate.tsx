import React from 'react';
import { ResumeData } from '../../../lib/resume/types';
import { formatDateRange, formatMonthYear, getAccentPalette } from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  // Dark slate tinted by the selected accent color for sidebar
  const sidebarBg =
    accentColor === '#4F46E5'
      ? '#1E1B4B'
      : accentColor === '#059669'
        ? '#064E3B'
        : accentColor === '#9F1239'
          ? '#4C0519'
          : '#0F172A';

  return (
    <div className="w-full min-h-[1123px] flex bg-white text-[#0F172A] font-sans">
      {/* LEFT SIDEBAR */}
      <aside
        data-pdf-sidebar="true"
        className="w-[260px] shrink-0 text-white px-6 py-8 flex flex-col gap-6"
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Portrait & Name on Mobile/Sidebar */}
        <div className="flex flex-col items-center text-center gap-3.5" data-pdf-block>
          <ProfilePortrait
            personal={personal}
            photoSettings={photoSettings}
            sizePx={108}
            borderColor="rgba(255,255,255,0.35)"
          />
          <div className="w-full">
            <h1 className="text-[22px] font-bold tracking-tight leading-snug text-white break-words">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.jobTitle && (
              <p
                className="text-[12.5px] font-medium mt-1 tracking-wide uppercase"
                style={{ color: palette.borderHex }}
              >
                {personal.jobTitle}
              </p>
            )}
          </div>
        </div>

        {/* Contact Details */}
        {(personal.email ||
          personal.phone ||
          personal.location ||
          personal.linkedin ||
          personal.website) && (
          <div className="border-t border-white/15 pt-5 space-y-2.5 text-[11.5px]" data-pdf-block>
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-3"
              style={{ color: palette.borderHex }}
            >
              Contact
            </h2>
            {personal.email && (
              <div className="flex items-start gap-2.5 text-white/90 break-all">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-start gap-2.5 text-white/90">
                <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{personal.phone}</span>
              </div>
            )}
            {personal.location && (
              <div className="flex items-start gap-2.5 text-white/90">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{personal.location}</span>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex items-start gap-2.5 text-white/90 break-all">
                <Linkedin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{personal.linkedin}</span>
              </div>
            )}
            {personal.website && (
              <div className="flex items-start gap-2.5 text-white/90 break-all">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-80" />
                <span>{personal.website}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills in Sidebar */}
        {validSkills.length > 0 && (
          <div className="border-t border-white/15 pt-5" data-pdf-block>
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-3"
              style={{ color: palette.borderHex }}
            >
              Core Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {validSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded text-[11px] font-medium leading-tight text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages in Sidebar */}
        {validLanguages.length > 0 && (
          <div className="border-t border-white/15 pt-5" data-pdf-block>
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-3"
              style={{ color: palette.borderHex }}
            >
              Languages
            </h2>
            <div className="space-y-2">
              {validLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex items-center justify-between text-[11.5px] gap-2"
                >
                  <span className="font-medium text-white">{lang.name}</span>
                  <span className="text-white/70 text-[11px]">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications in Sidebar */}
        {validCertifications.length > 0 && (
          <div className="border-t border-white/15 pt-5" data-pdf-block>
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-3"
              style={{ color: palette.borderHex }}
            >
              Certifications
            </h2>
            <div className="space-y-3">
              {validCertifications.map((cert) => (
                <div key={cert.id} className="text-[11.5px]">
                  <div className="font-semibold text-white leading-snug">{cert.name}</div>
                  <div className="text-white/75 text-[11px] mt-0.5">
                    {[cert.issuer, formatMonthYear(cert.issueDate)].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 px-8 py-8 flex flex-col gap-6">
        {/* Professional Summary */}
        {summary.trim() && (
          <section data-pdf-block>
            <div className="flex items-center gap-2.5 mb-2.5">
              <h2
                className="text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                Professional Summary
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>
            <p className="text-[12.5px] leading-[1.65] text-slate-700 whitespace-pre-line">
              {summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {validExperience.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5" data-pdf-block>
              <h2
                className="text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                Work Experience
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            <div className="space-y-4">
              {validExperience.map((exp) => {
                const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
                const bullets = exp.achievements.map((b) => b.trim()).filter(Boolean);
                return (
                  <div key={exp.id} className="space-y-1.5" data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[14px] font-bold text-slate-900">
                        {exp.jobTitle || 'Role Title'}
                      </h3>
                      {dateRange && (
                        <span
                          className="text-[11.5px] font-medium shrink-0 tabular-nums"
                          style={{ color: accentColor }}
                        >
                          {dateRange}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                      <span>{exp.company}</span>
                      {exp.location && <span className="text-slate-500">{exp.location}</span>}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-[12px] leading-[1.55] text-slate-700 list-disc pl-4">
                        {bullets.map((b, i) => (
                          <li key={i} className="pl-0.5">
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
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5" data-pdf-block>
              <h2
                className="text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                Education
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            <div className="space-y-3.5">
              {validEducation.map((edu) => {
                const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
                return (
                  <div key={edu.id} className="space-y-1" data-pdf-block>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[13.5px] font-bold text-slate-900">
                        {edu.degree || 'Degree'}
                      </h3>
                      {dateRange && (
                        <span
                          className="text-[11.5px] font-medium shrink-0 tabular-nums"
                          style={{ color: accentColor }}
                        >
                          {dateRange}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[12px] font-medium text-slate-600">
                      <span>{edu.institution}</span>
                      {edu.location && <span className="text-slate-500">{edu.location}</span>}
                    </div>
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

        {/* Key Projects */}
        {validProjects.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5" data-pdf-block>
              <h2
                className="text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                Key Projects
              </h2>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            <div className="space-y-3">
              {validProjects.map((proj) => (
                <div key={proj.id} className="space-y-1" data-pdf-block>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[13.5px] font-bold text-slate-900">{proj.title}</h3>
                    {proj.url.trim() && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <ExternalLink className="w-3 h-3" />
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.technologies.trim() && (
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: accentColor }}
                    >
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
      </main>
    </div>
  );
};
