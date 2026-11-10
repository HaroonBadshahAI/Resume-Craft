export type TemplateId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'creative'
  | 'executive'
  | 'harvard'
  | 'tech'
  | 'swiss'
  | 'nordic'
  | 'metro';

export type TemplateCategory = 'professional' | 'modern' | 'creative';

export type AccentColorHex = '#4F46E5' | '#059669' | '#334155' | '#9F1239';

export interface AccentColorOption {
  id: string;
  name: string;
  hex: AccentColorHex;
  secondaryHex: string;
  lightBg: string;
  borderHex: string;
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    hex: '#4F46E5',
    secondaryHex: '#3730A3',
    lightBg: '#EEF2FF',
    borderHex: '#C7D2FE',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    hex: '#059669',
    secondaryHex: '#065F46',
    lightBg: '#ECFDF5',
    borderHex: '#A7F3D0',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    hex: '#334155',
    secondaryHex: '#1E293B',
    lightBg: '#F1F5F9',
    borderHex: '#CBD5E1',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    hex: '#9F1239',
    secondaryHex: '#881337',
    lightBg: '#FFF1F2',
    borderHex: '#FECDD3',
  },
];

export type LanguageProficiency = 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';

export const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
];

export interface PhotoSettings {
  visible: boolean;
  zoom: number; // 1 to 2
  offsetX: number; // -50 to 50 (%)
  offsetY: number; // -50 to 50 (%)
  shape: 'circle' | 'rounded' | 'square';
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  photo: string; // Data URL (resized/compressed JPEG/WebP/PNG) or empty string
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  isCurrent: boolean;
  achievements: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  description: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string;
  url: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  selectedTemplate: TemplateId;
  accentColor: AccentColorHex;
  photoSettings: PhotoSettings;
}

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  category: TemplateCategory;
  tagline: string;
  description: string;
  supportsPhotoByDefault: boolean;
  recommendedShape: 'circle' | 'rounded' | 'square';
  badge: string;
}

export const TEMPLATE_DEFINITIONS: TemplateMetadata[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    category: 'modern',
    tagline: 'Dark sidebar & structured hierarchy',
    description:
      'Features an accent-toned left sidebar for contact details, portrait, skills, and languages paired with a crisp main column for experience and education.',
    supportsPhotoByDefault: true,
    recommendedShape: 'circle',
    badge: 'Most Popular',
  },
  {
    id: 'classic',
    name: 'Classic Corporate',
    category: 'professional',
    tagline: 'Timeless serif headings & formal rules',
    description:
      'Traditional single-column layout with centered contact header, refined serif section headings, and horizontal dividers favored by corporate recruiters.',
    supportsPhotoByDefault: true,
    recommendedShape: 'rounded',
    badge: 'Recruiter Favorite',
  },
  {
    id: 'harvard',
    name: 'Harvard Ivy',
    category: 'professional',
    tagline: 'Wall Street & consulting single-column standard',
    description:
      'Modeled on the Ivy League & management consulting standard with formal serif typography, full-width horizontal rules, and right-aligned dates.',
    supportsPhotoByDefault: false,
    recommendedShape: 'square',
    badge: 'Finance & Consulting',
  },
  {
    id: 'minimal',
    name: 'Minimal ATS',
    category: 'professional',
    tagline: 'Ultra-clean parser-optimized layout',
    description:
      'Distraction-free single-column architecture with high-contrast sans-serif typography, clear date alignments, and maximum reading clarity.',
    supportsPhotoByDefault: false,
    recommendedShape: 'rounded',
    badge: 'ATS Optimized',
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'professional',
    tagline: 'Premium dark navy & warm gold accents',
    description:
      'Boardroom-grade layout with a commanding dark header, refined rule dividers, structured competency blocks, and executive typography.',
    supportsPhotoByDefault: true,
    recommendedShape: 'square',
    badge: 'Leadership',
  },
  {
    id: 'tech',
    name: 'Tech Minimal (LaTeX)',
    category: 'modern',
    tagline: 'Awesome-CV inspired monospace & stack matrix',
    description:
      'Engineered for software developers, data scientists, and technical PMs with numbered monospace headers and a prominent technical stack bar.',
    supportsPhotoByDefault: false,
    recommendedShape: 'rounded',
    badge: 'Engineering & Data',
  },
  {
    id: 'nordic',
    name: 'Nordic Split',
    category: 'modern',
    tagline: 'Scandinavian humanist layout & right sidebar',
    description:
      'Airy left main column with timeline dots paired with a soft accent-tinted right sidebar housing contact details, skills, and visual language bars.',
    supportsPhotoByDefault: true,
    recommendedShape: 'circle',
    badge: 'Modern Humanist',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    category: 'creative',
    tagline: 'Bold header banner & modern two-column grid',
    description:
      'Designed for marketers, designers, and product builders with a vibrant header block, integrated portrait, and asymmetric two-column body.',
    supportsPhotoByDefault: true,
    recommendedShape: 'rounded',
    badge: 'Design & Marketing',
  },
  {
    id: 'swiss',
    name: 'Swiss Editorial Grid',
    category: 'creative',
    tagline: 'International Typographic Style 12-col grid',
    description:
      'Architectural exposed hairline rules with a 3-column numbered section index on the left and 9-column editorial content blocks on the right.',
    supportsPhotoByDefault: true,
    recommendedShape: 'square',
    badge: 'Editorial & Product',
  },
  {
    id: 'metro',
    name: 'Metro Creative',
    category: 'creative',
    tagline: 'Two-tone geometric header & timeline cards',
    description:
      'Agency-ready layout featuring a split dark-and-accent geometric header banner, accent-bordered experience cards, and bold skill badges.',
    supportsPhotoByDefault: true,
    recommendedShape: 'rounded',
    badge: 'Agency & Creative',
  },
];
