import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  LanguageItem,
  ProjectItem,
  CertificationItem,
} from '../types';

export type ImportMode = 'replace' | 'merge';

export interface MergeOptions {
  /** When true, imported non-empty personal fields and summary overwrite existing non-empty ones. Default: false. */
  overwritePersonal?: boolean;
}

let mergeCounter = 1;
function ensureStableId(existingId: string | undefined, prefix: string): string {
  if (existingId && existingId.trim()) return existingId.trim();
  mergeCounter += 1;
  return `${prefix}-mrg-${Date.now()}-${mergeCounter}`;
}

function isBlankExperience(exp: ExperienceItem): boolean {
  const hasBullets = exp.achievements.some((b) => b.trim().length > 0);
  return (
    !exp.jobTitle.trim() &&
    !exp.company.trim() &&
    !exp.startDate.trim() &&
    !hasBullets
  );
}

function isBlankEducation(edu: EducationItem): boolean {
  return (
    !edu.degree.trim() &&
    !edu.institution.trim() &&
    !edu.startDate.trim() &&
    !edu.endDate.trim()
  );
}

/**
 * Determines whether the current resume in the editor contains meaningful data.
 */
export function hasExistingResumeContent(resume: ResumeData): boolean {
  if (
    resume.personal.fullName.trim() ||
    resume.personal.email.trim() ||
    resume.personal.phone.trim() ||
    resume.summary.trim()
  ) {
    return true;
  }
  if (resume.experience.some((e) => !isBlankExperience(e))) return true;
  if (resume.education.some((e) => !isBlankEducation(e))) return true;
  if (resume.skills.length > 0) return true;
  return false;
}

/**
 * Replaces the current resume's content with the reviewed imported resume data,
 * while preserving the user's selected template and accent color.
 */
export function applyReplaceResume(
  currentResume: ResumeData,
  imported: ResumeData
): ResumeData {
  const cleanExperience: ExperienceItem[] = imported.experience
    .filter((e) => !isBlankExperience(e))
    .map((e) => ({
      ...e,
      id: ensureStableId(e.id, 'exp'),
      endDate: e.isCurrent ? '' : e.endDate,
      achievements:
        e.achievements.filter((b) => b.trim().length > 0).length > 0
          ? e.achievements.filter((b) => b.trim().length > 0)
          : [''],
    }));

  const cleanEducation: EducationItem[] = imported.education
    .filter((e) => !isBlankEducation(e))
    .map((e) => ({
      ...e,
      id: ensureStableId(e.id, 'edu'),
    }));

  const cleanLanguages: LanguageItem[] = imported.languages
    .filter((l) => l.name.trim().length > 0)
    .map((l) => ({
      ...l,
      id: ensureStableId(l.id, 'lang'),
    }));

  const cleanProjects: ProjectItem[] = imported.projects
    .filter((p) => p.title.trim().length > 0 || p.description.trim().length > 0)
    .map((p) => ({
      ...p,
      id: ensureStableId(p.id, 'proj'),
    }));

  const cleanCertifications: CertificationItem[] = imported.certifications
    .filter((c) => c.name.trim().length > 0)
    .map((c) => ({
      ...c,
      id: ensureStableId(c.id, 'cert'),
    }));

  const seenSkills = new Set<string>();
  const cleanSkills: string[] = [];
  for (const s of imported.skills) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seenSkills.has(lower)) {
      seenSkills.add(lower);
      cleanSkills.push(trimmed);
    }
  }

  return {
    personal: {
      fullName: imported.personal.fullName.trim(),
      jobTitle: imported.personal.jobTitle.trim(),
      email: imported.personal.email.trim(),
      phone: imported.personal.phone.trim(),
      location: imported.personal.location.trim(),
      linkedin: imported.personal.linkedin.trim(),
      website: imported.personal.website.trim(),
      photo: imported.personal.photo || '',
    },
    summary: imported.summary.trim(),
    experience: cleanExperience,
    education: cleanEducation,
    skills: cleanSkills,
    languages: cleanLanguages,
    projects: cleanProjects,
    certifications: cleanCertifications,
    selectedTemplate: currentResume.selectedTemplate,
    accentColor: currentResume.accentColor,
    photoSettings: {
      ...currentResume.photoSettings,
      visible:
        currentResume.selectedTemplate === 'minimal'
          ? false
          : currentResume.photoSettings.visible,
    },
  };
}

/**
 * Merges reviewed imported resume data into the current resume:
 * - Preserves non-empty personal fields (and summary) unless `options.overwritePersonal` is true
 * - Avoids duplicate experience, education, skills, languages, projects, and certifications
 * - Assigns stable IDs to all new entries
 */
export function applyMergeResume(
  currentResume: ResumeData,
  imported: ResumeData,
  options: MergeOptions = {}
): ResumeData {
  const overwrite = Boolean(options.overwritePersonal);

  const pickField = (currentVal: string, importedVal: string): string => {
    const cur = (currentVal || '').trim();
    const imp = (importedVal || '').trim();
    if (overwrite) {
      return imp || cur;
    }
    return cur || imp;
  };

  const mergedPersonal = {
    fullName: pickField(currentResume.personal.fullName, imported.personal.fullName),
    jobTitle: pickField(currentResume.personal.jobTitle, imported.personal.jobTitle),
    email: pickField(currentResume.personal.email, imported.personal.email),
    phone: pickField(currentResume.personal.phone, imported.personal.phone),
    location: pickField(currentResume.personal.location, imported.personal.location),
    linkedin: pickField(currentResume.personal.linkedin, imported.personal.linkedin),
    website: pickField(currentResume.personal.website, imported.personal.website),
    photo: pickField(currentResume.personal.photo, imported.personal.photo),
  };

  const mergedSummary = pickField(currentResume.summary, imported.summary);

  // Merge Experience without duplicates
  const existingExp = currentResume.experience
    .filter((e) => !isBlankExperience(e))
    .map((e) => ({ ...e, achievements: [...e.achievements] }));

  for (const impExp of imported.experience) {
    if (isBlankExperience(impExp)) continue;

    const impTitleKey = impExp.jobTitle.trim().toLowerCase();
    const impCompanyKey = impExp.company.trim().toLowerCase();
    const impStartKey = impExp.startDate.trim().slice(0, 4);

    const matchIndex = existingExp.findIndex((cur) => {
      const curTitleKey = cur.jobTitle.trim().toLowerCase();
      const curCompanyKey = cur.company.trim().toLowerCase();
      const curStartKey = cur.startDate.trim().slice(0, 4);
      return (
        curTitleKey === impTitleKey &&
        curCompanyKey === impCompanyKey &&
        (!curStartKey || !impStartKey || curStartKey === impStartKey)
      );
    });

    if (matchIndex >= 0) {
      const target = existingExp[matchIndex];
      if (!target.location && impExp.location) target.location = impExp.location;
      if (!target.startDate && impExp.startDate) target.startDate = impExp.startDate;
      if (!target.endDate && !target.isCurrent && impExp.endDate) {
        target.endDate = impExp.endDate;
      }

      const existingBulletsLower = new Set(
        target.achievements.map((b) => b.trim().toLowerCase()).filter(Boolean)
      );
      for (const b of impExp.achievements) {
        const cleanB = b.trim();
        if (cleanB && !existingBulletsLower.has(cleanB.toLowerCase())) {
          existingBulletsLower.add(cleanB.toLowerCase());
          target.achievements.push(cleanB);
        }
      }
      target.achievements = target.achievements.filter((b) => b.trim().length > 0);
      if (target.achievements.length === 0) target.achievements = [''];
    } else {
      const cleanBullets = impExp.achievements.filter((b) => b.trim().length > 0);
      existingExp.push({
        ...impExp,
        id: ensureStableId(impExp.id, 'exp'),
        endDate: impExp.isCurrent ? '' : impExp.endDate,
        achievements: cleanBullets.length > 0 ? cleanBullets : [''],
      });
    }
  }

  // Merge Education without duplicates
  const existingEdu = currentResume.education
    .filter((e) => !isBlankEducation(e))
    .map((e) => ({ ...e }));

  for (const impEdu of imported.education) {
    if (isBlankEducation(impEdu)) continue;
    const degKey = impEdu.degree.trim().toLowerCase();
    const instKey = impEdu.institution.trim().toLowerCase();

    const exists = existingEdu.some(
      (cur) =>
        cur.degree.trim().toLowerCase() === degKey &&
        cur.institution.trim().toLowerCase() === instKey
    );

    if (!exists) {
      existingEdu.push({
        ...impEdu,
        id: ensureStableId(impEdu.id, 'edu'),
      });
    }
  }

  // Merge Skills without duplicates
  const mergedSkills = [...currentResume.skills];
  const seenSkills = new Set(mergedSkills.map((s) => s.trim().toLowerCase()));
  for (const skill of imported.skills) {
    const trimmed = skill.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seenSkills.has(key)) {
      seenSkills.add(key);
      mergedSkills.push(trimmed);
    }
  }

  // Merge Languages without duplicates
  const mergedLanguages = currentResume.languages
    .filter((l) => l.name.trim().length > 0)
    .map((l) => ({ ...l }));
  const seenLangs = new Set(mergedLanguages.map((l) => l.name.trim().toLowerCase()));

  for (const lang of imported.languages) {
    const cleanName = lang.name.trim();
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();
    if (!seenLangs.has(key)) {
      seenLangs.add(key);
      mergedLanguages.push({
        ...lang,
        name: cleanName,
        id: ensureStableId(lang.id, 'lang'),
      });
    }
  }

  // Merge Projects without duplicates
  const mergedProjects = currentResume.projects
    .filter((p) => p.title.trim().length > 0)
    .map((p) => ({ ...p }));
  const seenProjects = new Set(mergedProjects.map((p) => p.title.trim().toLowerCase()));

  for (const proj of imported.projects) {
    const cleanTitle = proj.title.trim();
    if (!cleanTitle) continue;
    const key = cleanTitle.toLowerCase();
    if (!seenProjects.has(key)) {
      seenProjects.add(key);
      mergedProjects.push({
        ...proj,
        title: cleanTitle,
        id: ensureStableId(proj.id, 'proj'),
      });
    }
  }

  // Merge Certifications without duplicates
  const mergedCerts = currentResume.certifications
    .filter((c) => c.name.trim().length > 0)
    .map((c) => ({ ...c }));
  const seenCerts = new Set(mergedCerts.map((c) => c.name.trim().toLowerCase()));

  for (const cert of imported.certifications) {
    const cleanName = cert.name.trim();
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();
    if (!seenCerts.has(key)) {
      seenCerts.add(key);
      mergedCerts.push({
        ...cert,
        name: cleanName,
        id: ensureStableId(cert.id, 'cert'),
      });
    }
  }

  return {
    ...currentResume,
    personal: mergedPersonal,
    summary: mergedSummary,
    experience: existingExp,
    education: existingEdu,
    skills: mergedSkills,
    languages: mergedLanguages,
    projects: mergedProjects,
    certifications: mergedCerts,
  };
}
