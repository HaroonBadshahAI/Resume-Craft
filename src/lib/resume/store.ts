import { create } from 'zustand';
import {
  ResumeData,
  PersonalInfo,
  PhotoSettings,
  ExperienceItem,
  EducationItem,
  LanguageItem,
  ProjectItem,
  CertificationItem,
  TemplateId,
  AccentColorHex,
  TEMPLATE_DEFINITIONS,
} from './types';
import { SAMPLE_RESUME_DATA, createBlankResume } from './sample-data';
import { loadResumeFromStorage, saveResumeToStorage } from './storage';
import {
  generateProfessionalSummary,
  improveAllBullets,
  improveAchievementBullet,
} from './writing-assistant';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ResumeStoreState {
  resume: ResumeData;
  hydrated: boolean;
  storageWarning: string | null;
  toasts: ToastMessage[];

  // Lifecycle & Global actions
  hydrate: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  loadSampleResume: () => void;
  resetToBlankResume: () => void;
  setTemplate: (template: TemplateId) => void;
  setAccentColor: (color: AccentColorHex) => void;

  // Personal & Photo
  updatePersonal: (fields: Partial<PersonalInfo>) => void;
  updatePhotoSettings: (settings: Partial<PhotoSettings>) => void;
  removePhoto: () => void;

  // Summary
  setSummary: (summary: string) => void;
  writeSummaryForMe: () => void;

  // Experience
  addExperience: () => void;
  updateExperience: (id: string, fields: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  addExperienceBullet: (expId: string) => void;
  updateExperienceBullet: (expId: string, index: number, value: string) => void;
  removeExperienceBullet: (expId: string, index: number) => void;
  improveExperienceBullets: (expId: string) => void;
  improveSingleExperienceBullet: (expId: string, index: number) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, fields: Partial<EducationItem>) => void;
  deleteEducation: (id: string) => void;

  // Skills
  addSkill: (skill: string) => boolean;
  addSkillsBatch: (skills: string[]) => number;
  removeSkill: (skill: string) => void;

  // Languages
  addLanguage: (name?: string, proficiency?: LanguageItem['proficiency']) => void;
  updateLanguage: (id: string, fields: Partial<LanguageItem>) => void;
  deleteLanguage: (id: string) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, fields: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, fields: Partial<CertificationItem>) => void;
  deleteCertification: (id: string) => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useResumeStore = create<ResumeStoreState>((set, get) => {
  const persistAndSet = (updater: (prev: ResumeData) => ResumeData) => {
    const next = updater(get().resume);
    const saveResult = saveResumeToStorage(next);
    set({
      resume: next,
      storageWarning: saveResult.ok ? null : saveResult.error || null,
    });
  };

  return {
    resume: structuredClone(SAMPLE_RESUME_DATA),
    hydrated: false,
    storageWarning: null,
    toasts: [],

    hydrate: () => {
      if (get().hydrated) return;
      const loaded = loadResumeFromStorage();
      set({ resume: loaded, hydrated: true });
    },

    addToast: (toast) => {
      const id = makeId('toast');
      set((state) => ({
        toasts: [...state.toasts, { ...toast, id }],
      }));
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 4200);
    },

    dismissToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    loadSampleResume: () => {
      const currentTemplate = get().resume.selectedTemplate;
      const currentAccent = get().resume.accentColor;
      const sample = structuredClone(SAMPLE_RESUME_DATA);
      sample.selectedTemplate = currentTemplate;
      sample.accentColor = currentAccent;
      saveResumeToStorage(sample);
      set({ resume: sample, storageWarning: null });
      get().addToast({
        type: 'success',
        title: 'Sample Resume Loaded',
        description: "Restored Ayesha Khan's sample profile.",
      });
    },

    resetToBlankResume: () => {
      const { selectedTemplate, accentColor } = get().resume;
      const blank = createBlankResume(selectedTemplate, accentColor);
      saveResumeToStorage(blank);
      set({ resume: blank, storageWarning: null });
      get().addToast({
        type: 'info',
        title: 'Started New Resume',
        description: 'All fields have been cleared for a fresh start.',
      });
    },

    setTemplate: (template) => {
      const meta = TEMPLATE_DEFINITIONS.find((t) => t.id === template);
      persistAndSet((prev) => ({
        ...prev,
        selectedTemplate: template,
        photoSettings: {
          ...prev.photoSettings,
          // When switching to minimal ATS, default photo visibility to false unless user explicitly toggles it later;
          // When switching to other templates, if user has a photo or template supports it, preserve visibility
          visible: template === 'minimal' ? false : prev.photoSettings.visible,
          shape: meta ? meta.recommendedShape : prev.photoSettings.shape,
        },
      }));
    },

    setAccentColor: (color) => {
      persistAndSet((prev) => ({
        ...prev,
        accentColor: color,
      }));
    },

    updatePersonal: (fields) => {
      persistAndSet((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          ...fields,
        },
      }));
    },

    updatePhotoSettings: (settings) => {
      persistAndSet((prev) => ({
        ...prev,
        photoSettings: {
          ...prev.photoSettings,
          ...settings,
        },
      }));
    },

    removePhoto: () => {
      persistAndSet((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          photo: '',
        },
        photoSettings: {
          ...prev.photoSettings,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        },
      }));
      get().addToast({
        type: 'info',
        title: 'Photo Removed',
        description: 'Profile photo has been removed from your resume.',
      });
    },

    setSummary: (summary) => {
      persistAndSet((prev) => ({
        ...prev,
        summary,
      }));
    },

    writeSummaryForMe: () => {
      const current = get().resume;
      const generated = generateProfessionalSummary(current);
      persistAndSet((prev) => ({
        ...prev,
        summary: generated,
      }));
      get().addToast({
        type: 'success',
        title: 'Professional Summary Generated',
        description: 'Tailored to your job title, skills, and experience.',
      });
    },

    addExperience: () => {
      const newEntry: ExperienceItem = {
        id: makeId('exp'),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        achievements: [''],
      };
      persistAndSet((prev) => ({
        ...prev,
        experience: [...prev.experience, newEntry],
      }));
    },

    updateExperience: (id, fields) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) => {
          if (item.id !== id) return item;
          const updated: ExperienceItem = { ...item, ...fields };
          if (updated.isCurrent) {
            updated.endDate = '';
          } else if (
            updated.startDate &&
            updated.endDate &&
            updated.endDate < updated.startDate
          ) {
            // Prevent end dates earlier than start dates
            updated.endDate = updated.startDate;
          }
          return updated;
        }),
      }));
    },

    deleteExperience: (id) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.filter((item) => item.id !== id),
      }));
    },

    addExperienceBullet: (expId) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) =>
          item.id === expId
            ? { ...item, achievements: [...item.achievements, ''] }
            : item
        ),
      }));
    },

    updateExperienceBullet: (expId, index, value) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) => {
          if (item.id !== expId) return item;
          const nextBullets = [...item.achievements];
          nextBullets[index] = value;
          return { ...item, achievements: nextBullets };
        }),
      }));
    },

    removeExperienceBullet: (expId, index) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) => {
          if (item.id !== expId) return item;
          const filtered = item.achievements.filter((_, i) => i !== index);
          return {
            ...item,
            achievements: filtered.length > 0 ? filtered : [''],
          };
        }),
      }));
    },

    improveExperienceBullets: (expId) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) => {
          if (item.id !== expId) return item;
          return {
            ...item,
            achievements: improveAllBullets(item.achievements),
          };
        }),
      }));
      get().addToast({
        type: 'success',
        title: 'Bullets Strengthened',
        description: 'Updated achievement bullets with strong action verbs.',
      });
    },

    improveSingleExperienceBullet: (expId, index) => {
      persistAndSet((prev) => ({
        ...prev,
        experience: prev.experience.map((item) => {
          if (item.id !== expId) return item;
          const nextBullets = [...item.achievements];
          if (nextBullets[index]?.trim()) {
            nextBullets[index] = improveAchievementBullet(nextBullets[index]);
          }
          return { ...item, achievements: nextBullets };
        }),
      }));
    },

    addEducation: () => {
      const newEdu: EducationItem = {
        id: makeId('edu'),
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      };
      persistAndSet((prev) => ({
        ...prev,
        education: [...prev.education, newEdu],
      }));
    },

    updateEducation: (id, fields) => {
      persistAndSet((prev) => ({
        ...prev,
        education: prev.education.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...fields };
          if (
            updated.startDate &&
            updated.endDate &&
            updated.endDate < updated.startDate
          ) {
            updated.endDate = updated.startDate;
          }
          return updated;
        }),
      }));
    },

    deleteEducation: (id) => {
      persistAndSet((prev) => ({
        ...prev,
        education: prev.education.filter((item) => item.id !== id),
      }));
    },

    addSkill: (rawSkill) => {
      const trimmed = rawSkill.trim();
      if (!trimmed) return false;
      const existing = get().resume.skills;
      const isDuplicate = existing.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) return false;

      persistAndSet((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      return true;
    },

    addSkillsBatch: (newSkills) => {
      const current = get().resume.skills;
      const existingSet = new Set(current.map((s) => s.toLowerCase()));
      const toAdd: string[] = [];

      for (const raw of newSkills) {
        const trimmed = raw.trim();
        if (trimmed && !existingSet.has(trimmed.toLowerCase())) {
          existingSet.add(trimmed.toLowerCase());
          toAdd.push(trimmed);
        }
      }

      if (toAdd.length > 0) {
        persistAndSet((prev) => ({
          ...prev,
          skills: [...prev.skills, ...toAdd],
        }));
      }
      return toAdd.length;
    },

    removeSkill: (skillToRemove) => {
      persistAndSet((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s !== skillToRemove),
      }));
    },

    addLanguage: (name = '', proficiency = 'Fluent') => {
      const newLang: LanguageItem = {
        id: makeId('lang'),
        name: name.trim(),
        proficiency,
      };
      persistAndSet((prev) => ({
        ...prev,
        languages: [...prev.languages, newLang],
      }));
    },

    updateLanguage: (id, fields) => {
      persistAndSet((prev) => ({
        ...prev,
        languages: prev.languages.map((lang) =>
          lang.id === id ? { ...lang, ...fields } : lang
        ),
      }));
    },

    deleteLanguage: (id) => {
      persistAndSet((prev) => ({
        ...prev,
        languages: prev.languages.filter((lang) => lang.id !== id),
      }));
    },

    addProject: () => {
      const newProj: ProjectItem = {
        id: makeId('proj'),
        title: '',
        description: '',
        technologies: '',
        url: '',
      };
      persistAndSet((prev) => ({
        ...prev,
        projects: [...prev.projects, newProj],
      }));
    },

    updateProject: (id, fields) => {
      persistAndSet((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === id ? { ...p, ...fields } : p
        ),
      }));
    },

    deleteProject: (id) => {
      persistAndSet((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    },

    addCertification: () => {
      const newCert: CertificationItem = {
        id: makeId('cert'),
        name: '',
        issuer: '',
        issueDate: '',
      };
      persistAndSet((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCert],
      }));
    },

    updateCertification: (id, fields) => {
      persistAndSet((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c) =>
          c.id === id ? { ...c, ...fields } : c
        ),
      }));
    },

    deleteCertification: (id) => {
      persistAndSet((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.id !== id),
      }));
    },
  };
});
