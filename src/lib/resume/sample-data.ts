import { ResumeData, AccentColorHex, ACCENT_COLORS } from './types';

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    fullName: 'Ayesha Khan',
    jobTitle: 'Senior Digital Marketing Manager',
    email: 'ayesha.khan@example.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
    linkedin: 'linkedin.com/in/ayesha-khan-demo',
    website: 'ayeshakhan.marketing',
    photo: '',
  },
  summary:
    'Results-oriented Digital Marketing Manager with over seven years of experience developing integrated marketing strategies, managing cross-functional teams, and optimizing digital campaigns. Experienced in SEO, performance marketing, analytics, and brand development. Skilled at translating marketing insights into actionable strategies that improve customer engagement, campaign effectiveness, and sustainable business growth.',
  experience: [
    {
      id: 'exp-sample-1',
      jobTitle: 'Senior Digital Marketing Manager',
      company: 'BrightWave Digital',
      location: 'Dubai, UAE',
      startDate: '2022-01',
      endDate: '',
      isCurrent: true,
      achievements: [
        'Led integrated marketing campaigns across search, social media, and email channels.',
        'Improved campaign conversion rates by 32% through performance optimization.',
        'Managed a cross-functional team of eight marketing professionals.',
        'Developed marketing strategies that increased qualified leads by 45%.',
      ],
    },
    {
      id: 'exp-sample-2',
      jobTitle: 'Digital Marketing Specialist',
      company: 'Nexa Creative Agency',
      location: 'Dubai, UAE',
      startDate: '2018-06',
      endDate: '2021-12',
      isCurrent: false,
      achievements: [
        'Executed SEO and paid advertising campaigns for multiple clients.',
        'Increased organic website traffic by 60% through content optimization.',
        'Coordinated social media campaigns across five digital platforms.',
        'Delivered monthly performance reports and actionable insights.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-sample-1',
      degree: 'Bachelor of Business Administration',
      institution: 'University of Dubai',
      location: 'Dubai, UAE',
      startDate: '2014-09',
      endDate: '2018-06',
      description: 'Concentration in Marketing Strategy and Consumer Analytics. Graduated with Honors.',
    },
  ],
  skills: [
    'Digital Marketing',
    'SEO',
    'Google Analytics',
    'Google Ads',
    'Content Strategy',
    'Social Media Marketing',
    'Campaign Management',
    'Team Leadership',
  ],
  languages: [
    {
      id: 'lang-sample-1',
      name: 'English',
      proficiency: 'Fluent',
    },
    {
      id: 'lang-sample-2',
      name: 'Arabic',
      proficiency: 'Intermediate',
    },
    {
      id: 'lang-sample-3',
      name: 'Urdu',
      proficiency: 'Native',
    },
  ],
  projects: [
    {
      id: 'proj-sample-1',
      title: 'MENA Omnichannel Growth Attribution Framework',
      description:
        'Designed a unified multi-touch attribution model and looker dashboard connecting paid search, paid social, and CRM pipeline revenue across 4 regional markets.',
      technologies: 'GA4, Google Ads, Looker Studio, HubSpot CRM',
      url: 'ayeshakhan.marketing/case-studies/attribution',
    },
  ],
  certifications: [
    {
      id: 'cert-sample-1',
      name: 'Google Analytics Certification',
      issuer: 'Google',
      issueDate: '2024-03',
    },
  ],
  selectedTemplate: 'modern',
  accentColor: '#4F46E5',
  photoSettings: {
    visible: true,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    shape: 'circle',
  },
};

export function createBlankResume(
  currentTemplate = SAMPLE_RESUME_DATA.selectedTemplate,
  currentAccent: AccentColorHex = SAMPLE_RESUME_DATA.accentColor
): ResumeData {
  return {
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      photo: '',
    },
    summary: '',
    experience: [
      {
        id: `exp-${Date.now()}`,
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        achievements: [''],
      },
    ],
    education: [
      {
        id: `edu-${Date.now() + 1}`,
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    skills: [],
    languages: [
      {
        id: `lang-${Date.now() + 2}`,
        name: 'English',
        proficiency: 'Fluent',
      },
    ],
    projects: [],
    certifications: [],
    selectedTemplate: currentTemplate,
    accentColor: currentAccent,
    photoSettings: {
      visible: currentTemplate !== 'minimal',
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      shape: 'circle',
    },
  };
}

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats an internal YYYY-MM string into "Jan 2022".
 * Safely handles empty strings or malformed values without crashing.
 */
export function formatMonthYear(value?: string): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  const match = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11 || Number.isNaN(monthIndex)) {
    return trimmed;
  }

  return `${MONTH_NAMES_SHORT[monthIndex]} ${year}`;
}

/**
 * Formats a start/end date range professionally as "Jan 2022 – Mar 2025" or "Jan 2022 – Present".
 */
export function formatDateRange(startDate?: string, endDate?: string, isCurrent?: boolean): string {
  const startFormatted = formatMonthYear(startDate);
  const endFormatted = isCurrent ? 'Present' : formatMonthYear(endDate);

  if (startFormatted && endFormatted) {
    return `${startFormatted} – ${endFormatted}`;
  }
  if (startFormatted && !endFormatted) {
    return startFormatted;
  }
  if (!startFormatted && endFormatted) {
    return endFormatted;
  }
  return '';
}

export function getAccentPalette(hex: AccentColorHex) {
  return ACCENT_COLORS.find((c) => c.hex === hex) || ACCENT_COLORS[0];
}
