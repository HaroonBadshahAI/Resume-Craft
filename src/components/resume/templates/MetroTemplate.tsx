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
 * Template 10: Metro Creative Timeline (Agency & Creative Director Layout)
 * - Bold split two-tone geometric header banner (Dark slate + Accent color block)
 * - Structured 2-column body with accent-bordered cards and vertical timeline spine
 */
export const MetroTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    <div className="w-full min-h-[1123px] bg-white text-slate-900 font-sans flex flex-col">
      {/* Two-Tone Geometric Header Banner */}
      <header data-pdf-block className="grid grid-cols-12">
        <div className="col-span-8 bg-slate-950 text-white px-9 py-8 flex items-center gap-5">
          {personal.photo && photoSettings.visible && (
            <ProfilePortrait
              personal={personal}
              photoSettings={photoSettings}
              sizePx={78}
              borderColor={palette.hex}
            />
          )}
          <div>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-xs mb-2 text-white"
              style={{ backgroundColor: palette.hex }}
            >
              {personal.jobTitle || 'Creative & Product Leader'}
            </span>
            <h1 className="text-[27px] font-black tracking-tight leading-none">
              {personal.fullName || 'Your Full Name'}
            </h1>
          </div>
        </div>
        <div
          className="col-span-4 px-6 py-8 text-white flex flex-col justify-center space-y-1.5 text-[11px]"
          style={{ backgroundColor: palette.hex }}
        >
          {personal.email && (
            <div className="font-semibold truncate">{personal.email}</div>
          )}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && (
            <div className="text-white/90">{personal.location}</div>
          )}
          {personal.linkedin && (
            <div className="text-white/80 truncate text-[10.5px]">
              {personal.linkedin}
            </div>
          )}
          {personal.website && (
            <div className="font-bold underline decoration-white/50 truncate">
              {personal.website}
            </div>
          )}
        </div>
      </header>

      {/* Summary Banner Strip */}
      {summary.trim() && (
        <section
          data-pdf-block
          className="px-9 py-4 border-b"
          style={{
            backgroundColor: palette.lightBg,
            borderColor: palette.borderHex,
          }}
        >
          <p className="text-[11.5px] leading-[1.6] text-slate-800 font-medium">
            {summary}
          </p>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="flex-1 px-9 py-7 grid grid-cols-12 gap-7">
        {/* Left 8 Columns: Experience & Projects */}
        <div className="col-span-8 space-y-6">
          {validExperience.length > 0 && (
            <section>
              <div data-pdf-block className="flex items-center gap-2.5 mb-3.5">
                <span
                  className="w-3 h-3 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-950">
                  Career Timeline
                </h2>
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
                      className="p-3.5 rounded-lg border border-slate-200 border-l-4 bg-white"
                      style={{ borderLeftColor: palette.hex }}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[13px] font-bold text-slate-950">
                          {exp.jobTitle || 'Role Title'}
                        </h3>
                        {dateStr && (
                          <span className="text-[10.5px] font-bold text-slate-500 shrink-0">
                            {dateStr}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11.5px] font-semibold mt-0.5"
                        style={{ color: palette.hex }}
                      >
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </div>
                      {bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {bullets.map((b, i) => (
                            <li
                              key={i}
                              className="text-[11.2px] leading-[1.5] text-slate-700 flex items-start gap-2"
                            >
                              <span
                                className="font-bold text-[11px] leading-none mt-1"
                                style={{ color: palette.hex }}
                              >
                                ▪
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

          {validProjects.length > 0 && (
            <section>
              <div data-pdf-block className="flex items-center gap-2.5 mb-3">
                <span
                  className="w-3 h-3 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-950">
                  Featured Projects & Case Studies
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {validProjects.map((proj) => (
                  <div
                    key={proj.id}
                    data-pdf-block
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-[12px] font-bold text-slate-950">
                        {proj.title}
                      </h3>
                      {proj.url && (
                        <span
                          className="text-[10.5px] font-semibold"
                          style={{ color: palette.hex }}
                        >
                          {proj.url}
                        </span>
                      )}
                    </div>
                    {proj.technologies && (
                      <div className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
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
        </div>

        {/* Right 4 Columns: Skills, Education, Languages, Certifications */}
        <div className="col-span-4 space-y-6">
          {skills.length > 0 && (
            <section data-pdf-block>
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-950">
                  Skills & Tools
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10.5px] font-semibold px-2.5 py-1 rounded-xs text-white"
                    style={{ backgroundColor: palette.secondaryHex }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {validEducation.length > 0 && (
            <section>
              <div data-pdf-block className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-950">
                  Education
                </h2>
              </div>
              <div className="space-y-3">
                {validEducation.map((edu) => {
                  const dateStr = formatDateRange(
                    edu.startDate,
                    edu.endDate,
                    false
                  );
                  return (
                    <div
                      key={edu.id}
                      data-pdf-block
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                    >
                      <h3 className="text-[11.5px] font-bold text-slate-950">
                        {edu.degree}
                      </h3>
                      <div
                        className="text-[11px] font-semibold mt-0.5"
                        style={{ color: palette.hex }}
                      >
                        {edu.institution}
                      </div>
                      {dateStr && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {dateStr}
                        </div>
                      )}
                      {edu.description && (
                        <p className="text-[10.5px] text-slate-600 mt-1">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {validLanguages.length > 0 && (
            <section data-pdf-block>
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-950">
                  Languages
                </h2>
              </div>
              <div className="space-y-1.5">
                {validLanguages.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200"
                  >
                    <span className="font-bold text-slate-900">{l.name}</span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: palette.hex }}
                    >
                      {l.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {validCertifications.length > 0 && (
            <section data-pdf-block>
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: palette.hex }}
                />
                <h2 className="text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-950">
                  Certifications
                </h2>
              </div>
              <div className="space-y-2">
                {validCertifications.map((c) => (
                  <div
                    key={c.id}
                    className="text-[11px] p-2.5 rounded border border-slate-200"
                  >
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {c.issuer}
                      {c.issueDate ? ` · ${formatMonthYear(c.issueDate)}` : ''}
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
