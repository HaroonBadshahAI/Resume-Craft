import { ResumeData, ACCENT_COLORS, TEMPLATE_DEFINITIONS, PROFICIENCY_LEVELS } from './types';
import { SAMPLE_RESUME_DATA } from './sample-data';

export const STORAGE_KEY = 'resumecraft_state_v1';

interface VersionedStoragePayload {
  version: 1;
  updatedAt: string;
  data: ResumeData;
}

/**
 * Validates and normalizes parsed JSON into a safe ResumeData structure.
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(SAMPLE_RESUME_DATA);
  }

  const candidate = raw as Record<string, unknown>;
  const personalRaw = (candidate.personal as Record<string, unknown>) || {};
  const photoSettingsRaw = (candidate.photoSettings as Record<string, unknown>) || {};

  const validTemplates = new Set(TEMPLATE_DEFINITIONS.map((t) => t.id));
  const selectedTemplate = validTemplates.has(candidate.selectedTemplate as never)
    ? (candidate.selectedTemplate as ResumeData['selectedTemplate'])
    : 'modern';

  const validAccents = new Set(ACCENT_COLORS.map((c) => c.hex));
  const accentColor = validAccents.has(candidate.accentColor as never)
    ? (candidate.accentColor as ResumeData['accentColor'])
    : '#4F46E5';

  const validProficiencies = new Set(PROFICIENCY_LEVELS);

  const experience = Array.isArray(candidate.experience)
    ? candidate.experience.map((item, idx) => {
        const exp = (item as Record<string, unknown>) || {};
        const isCurrent = Boolean(exp.isCurrent);
        return {
          id: typeof exp.id === 'string' && exp.id ? exp.id : `exp-restored-${idx}`,
          jobTitle: typeof exp.jobTitle === 'string' ? exp.jobTitle : '',
          company: typeof exp.company === 'string' ? exp.company : '',
          location: typeof exp.location === 'string' ? exp.location : '',
          startDate: typeof exp.startDate === 'string' ? exp.startDate : '',
          endDate: isCurrent ? '' : typeof exp.endDate === 'string' ? exp.endDate : '',
          isCurrent,
          achievements: Array.isArray(exp.achievements)
            ? exp.achievements.map((a) => (typeof a === 'string' ? a : ''))
            : [''],
        };
      })
    : structuredClone(SAMPLE_RESUME_DATA.experience);

  const education = Array.isArray(candidate.education)
    ? candidate.education.map((item, idx) => {
        const edu = (item as Record<string, unknown>) || {};
        return {
          id: typeof edu.id === 'string' && edu.id ? edu.id : `edu-restored-${idx}`,
          degree: typeof edu.degree === 'string' ? edu.degree : '',
          institution: typeof edu.institution === 'string' ? edu.institution : '',
          location: typeof edu.location === 'string' ? edu.location : '',
          startDate: typeof edu.startDate === 'string' ? edu.startDate : '',
          endDate: typeof edu.endDate === 'string' ? edu.endDate : '',
          description: typeof edu.description === 'string' ? edu.description : '',
        };
      })
    : structuredClone(SAMPLE_RESUME_DATA.education);

  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean)
    : [...SAMPLE_RESUME_DATA.skills];

  const languages = Array.isArray(candidate.languages)
    ? candidate.languages.map((item, idx) => {
        const lang = (item as Record<string, unknown>) || {};
        const prof = validProficiencies.has(lang.proficiency as never)
          ? (lang.proficiency as ResumeData['languages'][number]['proficiency'])
          : 'Fluent';
        return {
          id: typeof lang.id === 'string' && lang.id ? lang.id : `lang-restored-${idx}`,
          name: typeof lang.name === 'string' ? lang.name : '',
          proficiency: prof,
        };
      })
    : structuredClone(SAMPLE_RESUME_DATA.languages);

  const projects = Array.isArray(candidate.projects)
    ? candidate.projects.map((item, idx) => {
        const proj = (item as Record<string, unknown>) || {};
        return {
          id: typeof proj.id === 'string' && proj.id ? proj.id : `proj-restored-${idx}`,
          title: typeof proj.title === 'string' ? proj.title : '',
          description: typeof proj.description === 'string' ? proj.description : '',
          technologies: typeof proj.technologies === 'string' ? proj.technologies : '',
          url: typeof proj.url === 'string' ? proj.url : '',
        };
      })
    : structuredClone(SAMPLE_RESUME_DATA.projects);

  const certifications = Array.isArray(candidate.certifications)
    ? candidate.certifications.map((item, idx) => {
        const cert = (item as Record<string, unknown>) || {};
        return {
          id: typeof cert.id === 'string' && cert.id ? cert.id : `cert-restored-${idx}`,
          name: typeof cert.name === 'string' ? cert.name : '',
          issuer: typeof cert.issuer === 'string' ? cert.issuer : '',
          issueDate: typeof cert.issueDate === 'string' ? cert.issueDate : '',
        };
      })
    : structuredClone(SAMPLE_RESUME_DATA.certifications);

  return {
    personal: {
      fullName: typeof personalRaw.fullName === 'string' ? personalRaw.fullName : '',
      jobTitle: typeof personalRaw.jobTitle === 'string' ? personalRaw.jobTitle : '',
      email: typeof personalRaw.email === 'string' ? personalRaw.email : '',
      phone: typeof personalRaw.phone === 'string' ? personalRaw.phone : '',
      location: typeof personalRaw.location === 'string' ? personalRaw.location : '',
      linkedin: typeof personalRaw.linkedin === 'string' ? personalRaw.linkedin : '',
      website: typeof personalRaw.website === 'string' ? personalRaw.website : '',
      photo: typeof personalRaw.photo === 'string' ? personalRaw.photo : '',
    },
    summary: typeof candidate.summary === 'string' ? candidate.summary : '',
    experience,
    education,
    skills,
    languages,
    projects,
    certifications,
    selectedTemplate,
    accentColor,
    photoSettings: {
      visible:
        typeof photoSettingsRaw.visible === 'boolean'
          ? photoSettingsRaw.visible
          : selectedTemplate !== 'minimal',
      zoom:
        typeof photoSettingsRaw.zoom === 'number' &&
        photoSettingsRaw.zoom >= 1 &&
        photoSettingsRaw.zoom <= 2.5
          ? photoSettingsRaw.zoom
          : 1,
      offsetX:
        typeof photoSettingsRaw.offsetX === 'number'
          ? Math.max(-50, Math.min(50, photoSettingsRaw.offsetX))
          : 0,
      offsetY:
        typeof photoSettingsRaw.offsetY === 'number'
          ? Math.max(-50, Math.min(50, photoSettingsRaw.offsetY))
          : 0,
      shape:
        photoSettingsRaw.shape === 'circle' ||
        photoSettingsRaw.shape === 'rounded' ||
        photoSettingsRaw.shape === 'square'
          ? photoSettingsRaw.shape
          : 'circle',
    },
  };
}

export function loadResumeFromStorage(): ResumeData {
  if (typeof window === 'undefined') {
    return structuredClone(SAMPLE_RESUME_DATA);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(SAMPLE_RESUME_DATA);
    }
    const parsed = JSON.parse(raw) as VersionedStoragePayload | ResumeData;
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      return normalizeResumeData(parsed.data);
    }
    return normalizeResumeData(parsed);
  } catch (err) {
    console.warn('Failed to load resume data from localStorage, falling back to sample data:', err);
    return structuredClone(SAMPLE_RESUME_DATA);
  }
}

export function saveResumeToStorage(data: ResumeData): { ok: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { ok: true };
  }

  try {
    const payload: VersionedStoragePayload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      data,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    console.error('Failed to save resume data to localStorage:', err);
    return {
      ok: false,
      error:
        'Browser storage quota reached. Try removing or re-uploading a smaller profile photo.',
    };
  }
}

/**
 * Resizes and compresses an uploaded image file (JPG, PNG, WebP) to a compact Data URL
 * suitable for localStorage persistence and crisp PDF rendering (max 420x420px at 0.86 quality).
 */
export async function processUploadedPhoto(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Please select a valid JPG, PNG, or WebP image file.');
  }

  const maxFileSizeBytes = 10 * 1024 * 1024; // 10 MB upload limit before compression
  if (file.size > maxFileSizeBytes) {
    throw new Error('Image file is too large (max 10 MB). Please choose a smaller image.');
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.onload = () => {
        try {
          const maxDimension = 420;
          let targetW = img.naturalWidth || img.width;
          let targetH = img.naturalHeight || img.height;

          if (targetW > maxDimension || targetH > maxDimension) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDimension) / targetW);
              targetW = maxDimension;
            } else {
              targetW = Math.round((targetW * maxDimension) / targetH);
              targetH = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          // Fill white background for transparent PNGs so JPEG compression looks clean
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to process image.'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
