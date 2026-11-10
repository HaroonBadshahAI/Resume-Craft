import React from 'react';
import { ResumeData, LanguageProficiency } from '../../../lib/resume/types';
import {
  formatDateRange,
  formatMonthYear,
  getAccentPalette,
} from '../../../lib/resume/sample-data';
import { ProfilePortrait } from './ProfilePortrait';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
}

const PROFICIENCY_PERCENT: Record<LanguageProficiency, number> = {
  Native: 100,
  Fluent: 90,
  Advanced: 75,
  Intermediate: 55,
  Basic: 35,
};

/**
 * Template 9: Nordic Split (Scandinavian Modern Right-Sidebar Layout)
 * - Spacious, airy left main column (flex-1) with timeline node dots
 * - Soft accent-tinted right sidebar (w-[255px]) housing portrait, contact, skills, and visual language bars
 */
export const NordicTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    <div className="w-full min-h-[1123px] flex bg-white text-slate-900 font-sans">
      {/* Main Left Column */}
      <main className="flex-1 px-9 py-10 space-y-6">
        {/* Clean Humanist Header */}
        <header
          data-pdf-block
          className="pb-5 border-b"
          style={{ borderColor: palette.borderHex }}
        >
          <div
            className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-xs mb-2"
            style={{
              backgroundColor: palette.lightBg,
              color: palette.hex,
            }}
          >
            {personal.jobTitle || 'Professional Profile'}
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-950 leading-tight">
            {personal.fullName || 'Your Full Name'}
          </h1>
          {summary.trim() && (
            <p className="mt-3 text-[11.5px] leading-[1.62] text-slate-600">
              {summary}
            </p>
          )}
        </header>

        {/* Experience with Timeline Dots */}
        {validExperience.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3.5"
              style={{ color: palette.hex }}
            >
              Work Experience
            </h2>
            <div
              className="space-y-4 border-l-2 pl-4 ml-1"
              style={{ borderColor: palette.borderHex }}
            >
              {validExperience.map((exp) => {
                const dateStr = formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.isCurrent
                );
                const bullets = exp.achievements.filter((b) => b.trim());
                return (
                  <div key={exp.id} data-pdf-block className="relative">
                    <span
                      className="w-2.5 h-2.5 rounded-full absolute -left-[21.5px] top-1 border-2 border-white"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[13px] font-bold text-slate-900">
                        {exp.jobTitle || 'Role Title'}
                      </h3>
                      {dateStr && (
                        <span
                          className="text-[10.5px] font-semibold px-2 py-0.5 rounded-xs shrink-0"
                          style={{
                            backgroundColor: palette.lightBg,
                            color: palette.secondaryHex,
                          }}
                        >
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-500 mt-0.5">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ''}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            className="text-[11.2px] leading-[1.52] text-slate-700 flex items-start gap-2"
                          >
                            <span
                              className="mt-[6px] w-1 h-1 rounded-full shrink-0"
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

        {/* Education */}
        {validEducation.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3"
              style={{ color: palette.hex }}
            >
              Education
            </h2>
            <div
              className="space-y-3 border-l-2 pl-4 ml-1"
              style={{ borderColor: palette.borderHex }}
            >
              {validEducation.map((edu) => {
                const dateStr = formatDateRange(
                  edu.startDate,
                  edu.endDate,
                  false
                );
                return (
                  <div key={edu.id} data-pdf-block className="relative">
                    <span
                      className="w-2 h-2 rounded-full absolute -left-[19.5px] top-1.5"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-[12.5px] font-bold text-slate-900">
                        {edu.degree}
                      </h3>
                      {dateStr && (
                        <span className="text-[10.5px] text-slate-500 shrink-0">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] font-medium text-slate-600">
                      {edu.institution}
                      {edu.location ? ` · ${edu.location}` : ''}
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

        {/* Projects */}
        {validProjects.length > 0 && (
          <section>
            <h2
              data-pdf-block
              className="text-[11px] font-bold uppercase tracking-[0.16em] mb-2.5"
              style={{ color: palette.hex }}
            >
              Key Projects
            </h2>
            <div className="space-y-2.5">
              {validProjects.map((proj) => (
                <div
                  key={proj.id}
                  data-pdf-block
                  className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[12px] font-bold text-slate-900">
                      {proj.title}
                    </h3>
                    {proj.url && (
                      <span
                        className="text-[10.5px] font-medium"
                        style={{ color: palette.hex }}
                      >
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.technologies && (
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {proj.technologies}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Soft Tinted Right Sidebar */}
      <aside
        className="w-[255px] shrink-0 px-6 py-10 flex flex-col gap-6 border-l"
        style={{
          backgroundColor: palette.lightBg,
          borderColor: palette.borderHex,
        }}
      >
        {personal.photo && photoSettings.visible && (
          <div className="flex justify-center">
            <ProfilePortrait
              personal={personal}
              photoSettings={photoSettings}
              sizePx={96}
              borderColor={palette.hex}
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2.5">
          <h2
            className="text-[10.5px] font-bold uppercase tracking-[0.16em] pb-1.5 border-b"
            style={{ color: palette.secondaryHex, borderColor: palette.borderHex }}
          >
            Contact Details
          </h2>
          <div className="space-y-2 text-[11px] text-slate-700">
            {personal.email && (
              <div className="flex items-start gap-2 break-all">
                <Mail
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  style={{ color: palette.hex }}
                />
                <span>{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-start gap-2">
                <Phone
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  style={{ color: palette.hex }}
                />
                <span>{personal.phone}</span>
              </div>
            )}
            {personal.location && (
              <div className="flex items-start gap-2">
                <MapPin
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  style={{ color: palette.hex }}
                />
                <span>{personal.location}</span>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex items-start gap-2 break-all">
                <Linkedin
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  style={{ color: palette.hex }}
                />
                <span>{personal.linkedin}</span>
              </div>
            )}
            {personal.website && (
              <div className="flex items-start gap-2 break-all">
                <Globe
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  style={{ color: palette.hex }}
                />
                <span>{personal.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Core Skills */}
        {skills.length > 0 && (
          <div className="space-y-2.5">
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.16em] pb-1.5 border-b"
              style={{
                color: palette.secondaryHex,
                borderColor: palette.borderHex,
              }}
            >
              Expertise & Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[10.5px] font-medium px-2.5 py-1 rounded-md bg-white text-slate-800 border shadow-2xs"
                  style={{ borderColor: palette.borderHex }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages with Visual Proficiency Bars */}
        {validLanguages.length > 0 && (
          <div className="space-y-2.5">
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.16em] pb-1.5 border-b"
              style={{
                color: palette.secondaryHex,
                borderColor: palette.borderHex,
              }}
            >
              Languages
            </h2>
            <div className="space-y-2.5">
              {validLanguages.map((lang) => {
                const pct = PROFICIENCY_PERCENT[lang.proficiency] || 70;
                return (
                  <div key={lang.id} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {lang.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang.proficiency}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: palette.hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {validCertifications.length > 0 && (
          <div className="space-y-2.5">
            <h2
              className="text-[10.5px] font-bold uppercase tracking-[0.16em] pb-1.5 border-b"
              style={{
                color: palette.secondaryHex,
                borderColor: palette.borderHex,
              }}
            >
              Certifications
            </h2>
            <div className="space-y-2">
              {validCertifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-2.5 rounded-md bg-white/80 border"
                  style={{ borderColor: palette.borderHex }}
                >
                  <div className="text-[11px] font-bold text-slate-900 leading-snug">
                    {cert.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {cert.issuer}
                    {cert.issueDate
                      ? ` · ${formatMonthYear(cert.issueDate)}`
                      : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
