import {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  LanguageItem,
  LanguageProficiency,
  ProjectItem,
  CertificationItem,
} from '../types';
import { SAMPLE_RESUME_DATA } from '../sample-data';
import {
  extractInlineDateRange,
  normalizeDateRange,
  normalizeSingleDate,
} from './date-normalizer';
import { ExtractedDocumentResult } from './pdf-extractor';

export interface ImportDiagnostics {
  missingFields: string[];
  uncertainFields: string[];
  dateWarnings: string[];
  layoutWarnings: string[];
  photoNotice: string;
  unmappedLines: string[];
  hasRecognizableSections: boolean;
  recognizedSections: string[];
}

export interface ParsedResumeImport {
  data: ResumeData;
  diagnostics: ImportDiagnostics;
  rawText: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
}

type SectionKey =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications';

const SECTION_HEADING_PATTERNS: Array<{ key: Exclude<SectionKey, 'header'>; regex: RegExp }> = [
  {
    key: 'summary',
    regex:
      /^(?:professional\s+summary|executive\s+summary|summary\s+of\s+qualifications|summary|professional\s+profile|career\s+profile|profile|about\s+me|about|career\s+objective|objective|personal\s+statement|overview)$/i,
  },
  {
    key: 'experience',
    regex:
      /^(?:professional\s+experience|work\s+experience|work\s+history|employment\s+history|employment|career\s+experience|career\s+history|relevant\s+experience|experience|positions\s+held)$/i,
  },
  {
    key: 'education',
    regex:
      /^(?:education|academic\s+background|academic\s+qualifications|education\s*(?:&|and)\s*training|academic\s+history|educational\s+background|qualifications)$/i,
  },
  {
    key: 'skills',
    regex:
      /^(?:skills|technical\s+skills|core\s+competencies|key\s+skills|skills\s*(?:&|and)\s*expertise|areas\s+of\s+expertise|competencies|tools\s*(?:&|and)\s*technologies|professional\s+skills|core\s+skills|technical\s+proficiencies)$/i,
  },
  {
    key: 'languages',
    regex:
      /^(?:languages|language\s+proficiency|spoken\s+languages|languages\s+known|language\s+skills)$/i,
  },
  {
    key: 'projects',
    regex:
      /^(?:projects|key\s+projects|selected\s+projects|personal\s+projects|academic\s+projects|notable\s+projects|portfolio\s+projects|featured\s+projects)$/i,
  },
  {
    key: 'certifications',
    regex:
      /^(?:certifications|licenses\s*(?:&|and)\s*certifications|professional\s+certifications|certificates|credentials|certifications\s*(?:&|and)\s*licenses|awards\s*(?:&|and)\s*certifications)$/i,
  },
];

const ROLE_KEYWORDS_REGEX =
  /\b(manager|engineer|developer|designer|specialist|analyst|director|consultant|architect|coordinator|executive|lead|officer|scientist|administrator|accountant|marketer|associate|intern|strategist|producer|editor|researcher|technician|assistant|representative|advisor|vp|president|founder|head\s+of|chief|programmer|recruiter|supervisor|controller|auditor|writer|instructor|teacher|professor|nurse|pharmacist|lawyer|attorney)\b/i;

const COMPANY_INDICATOR_REGEX =
  /\b(inc\.?|llc|ltd\.?|corp\.?|corporation|company|co\.|group|agency|digital|technologies|tech|solutions|systems|studio|labs|partners|consulting|enterprises|holdings|global|international|media|services|network|ventures|bank|hospital|clinic|foundation|association|institute|university)\b/i;

const DEGREE_KEYWORDS_REGEX =
  /\b(bachelor|master|b\.?s\.?c?|b\.?a\.?|m\.?s\.?c?|m\.?a\.?|m\.?b\.?a\.?|b\.?b\.?a\.?|ph\.?d\.?|doctorate|associate|diploma|certificate|b\.?eng|m\.?eng|b\.?tech|m\.?tech|llb|llm|md|degree|high\s+school|bsc|msc|ba|bs|ms|mba|bba)\b/i;

const INSTITUTION_KEYWORDS_REGEX =
  /\b(university|college|institute|school|academy|polytechnic|conservatory|faculty)\b/i;

const ACTION_VERB_START_REGEX =
  /^(led|managed|developed|executed|improved|increased|designed|built|created|implemented|delivered|coordinated|architected|spearheaded|optimized|reduced|assisted|collaborated|engineered|maintained|analyzed|achieved|launched|streamlined|directed|automated|conducted|established|generated|supported|oversaw|facilitated|drove|trained|resolved|authored|prepared|negotiated|administered|formulated|pioneered|transformed|upgraded|boosted|expanded|mentored|supervised|modernized|refactored|deployed|integrated|migrated|scaled|standardized|monitored|audited|forecasted)\b/i;

const KNOWN_LANGUAGES = [
  'English',
  'Arabic',
  'Urdu',
  'French',
  'Spanish',
  'German',
  'Mandarin',
  'Chinese',
  'Hindi',
  'Russian',
  'Portuguese',
  'Japanese',
  'Korean',
  'Italian',
  'Turkish',
  'Dutch',
  'Persian',
  'Farsi',
  'Bengali',
  'Punjabi',
  'Malay',
  'Indonesian',
  'Swahili',
  'Tagalog',
  'Vietnamese',
  'Polish',
  'Swedish',
  'Greek',
  'Hebrew',
  'Thai',
  'Pashto',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Ukrainian',
  'Romanian',
  'Czech',
  'Danish',
  'Finnish',
  'Norwegian',
  'Hungarian',
];

let idCounter = 1;
function createImportId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-imp-${Date.now()}-${idCounter}`;
}

/**
 * Checks if a line is a resume section heading.
 */
export function detectSectionHeading(rawLine: string): Exclude<SectionKey, 'header'> | null {
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.startsWith('•')) return null;

  // Strip surrounding decorative rules, colons, numbering like "01." or "1."
  const cleaned = trimmed
    .replace(/^[\d]+\s*[.)|-]\s*/, '')
    .replace(/^[—–\-=_*#|•·\s]+|[—–\-=_*#|:•·\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length > 48 || cleaned.split(/\s+/).length > 5) {
    return null;
  }

  for (const { key, regex } of SECTION_HEADING_PATTERNS) {
    if (regex.test(cleaned)) {
      return key;
    }
  }

  return null;
}

/**
 * Maps raw proficiency text to ResumeCraft's standard LanguageProficiency enum.
 */
export function normalizeLanguageProficiency(rawProf?: string): LanguageProficiency {
  if (!rawProf) return 'Fluent';
  const lower = rawProf.toLowerCase().trim();

  if (
    /\b(native|mother\s*tongue|bilingual|first\s*language|primary)\b/.test(lower)
  ) {
    return 'Native';
  }
  if (
    /\b(fluent|full\s*professional|proficient|c2|c1|near\s*native|mastery)\b/.test(
      lower
    )
  ) {
    return 'Fluent';
  }
  if (
    /\b(advanced|professional\s*working|upper\s*intermediate|b2|very\s*good)\b/.test(
      lower
    )
  ) {
    return 'Advanced';
  }
  if (
    /\b(intermediate|conversational|working\s*knowledge|limited\s*working|b1|moderate)\b/.test(
      lower
    )
  ) {
    return 'Intermediate';
  }
  if (/\b(basic|elementary|beginner|novice|a1|a2|fundamental)\b/.test(lower)) {
    return 'Basic';
  }

  return 'Fluent';
}

/**
 * Checks if a segment looks like a geographic location (e.g. "Dubai, UAE", "New York, NY", "London, UK").
 */
function looksLikeLocation(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned || cleaned.length > 45 || cleaned.length < 3) return false;
  if (/\d{3,}/.test(cleaned) || /@/.test(cleaned)) return false;
  if (
    ROLE_KEYWORDS_REGEX.test(cleaned) ||
    DEGREE_KEYWORDS_REGEX.test(cleaned) ||
    INSTITUTION_KEYWORDS_REGEX.test(cleaned) ||
    COMPANY_INDICATOR_REGEX.test(cleaned)
  ) {
    return false;
  }

  // City, Country or City, ST
  if (/^[A-Z][A-Za-z\s.-]+,\s*(?:[A-Z]{2,3}|[A-Z][A-Za-z\s.-]+)$/.test(cleaned)) {
    return true;
  }

  // Common global cities/countries
  if (
    /\b(dubai|abu\s+dhabi|sharjah|uae|united\s+arab\s+emirates|london|uk|united\s+kingdom|new\s+york|san\s+francisco|los\s+angeles|chicago|austin|seattle|boston|toronto|vancouver|canada|sydney|melbourne|australia|singapore|berlin|munich|germany|paris|france|amsterdam|netherlands|riyadh|jeddah|saudi\s+arabia|doha|qatar|kuwait|bahrain|muscat|oman|cairo|egypt|lahore|karachi|islamabad|pakistan|mumbai|bangalore|bengaluru|delhi|hyderabad|india|remote)\b/i.test(
      cleaned
    ) &&
    cleaned.split(/\s+/).length <= 5
  ) {
    return true;
  }

  return false;
}

/**
 * Layer 1: Extract structured Personal Information from header lines and full text fallback.
 */
function parsePersonalAndHeader(
  headerLines: string[],
  allLines: string[],
  extractedLinks: string[]
): { personal: PersonalInfo; extraSummaryLines: string[] } {
  const personal: PersonalInfo = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    photo: '',
  };

  const combinedHeader = headerLines.join('\n');
  const fullText = allLines.join('\n');

  // 1. Email
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
  const emailMatch = emailRegex.exec(combinedHeader) || emailRegex.exec(fullText);
  if (emailMatch) {
    personal.email = emailMatch[1].trim();
  }

  // 2. LinkedIn URL
  const linkedinRegex =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;
  const linkedinFromText =
    linkedinRegex.exec(combinedHeader) || linkedinRegex.exec(fullText);
  if (linkedinFromText) {
    personal.linkedin = linkedinFromText[0]
      .replace(/^https?:\/\/(www\.)?/i, '')
      .replace(/\/$/, '');
  } else {
    const linkMatch = extractedLinks.find((l) => /linkedin\.com\/in\//i.test(l));
    if (linkMatch) {
      personal.linkedin = linkMatch
        .replace(/^https?:\/\/(www\.)?/i, '')
        .replace(/\/$/, '');
    }
  }

  // 3. Phone Number (avoid matching year ranges like 2018 - 2022)
  const phoneCandidateRegex =
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{2,4}[\s.-])\d{3,4}[\s.-]?\d{3,4}\b/g;
  const searchPool = [...headerLines, ...allLines.slice(0, 15)];
  for (const line of searchPool) {
    const matches = line.match(phoneCandidateRegex);
    if (!matches) continue;
    for (const candidate of matches) {
      const trimmed = candidate.trim();
      // Reject year ranges like "2018 - 2021"
      if (/^(?:19|20)\d{2}\s*[-–—.]\s*(?:19|20)\d{2}$/.test(trimmed)) continue;
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
        personal.phone = trimmed;
        break;
      }
    }
    if (personal.phone) break;
  }

  // 4. Website / Portfolio URL
  const urlRegex =
    /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s|,;)]*)?)\b/gi;
  const urlLines = [...headerLines, ...extractedLinks];
  for (const line of urlLines) {
    let match: RegExpExecArray | null;
    urlRegex.lastIndex = 0;
    while ((match = urlRegex.exec(line)) !== null) {
      const fullMatch = match[0];
      const domainPart = match[1].toLowerCase();
      // Ignore email addresses (both before and after @), linkedin, and common file extensions
      const charBefore = match.index > 0 ? line[match.index - 1] : '';
      const charAfter = line[match.index + fullMatch.length] || '';
      if (charBefore === '@' || charAfter === '@') continue;
      if (
        domainPart.includes('linkedin.com') ||
        domainPart.includes('gmail.com') ||
        domainPart.includes('yahoo.com') ||
        domainPart.includes('outlook.com') ||
        domainPart.includes('hotmail.com') ||
        domainPart.includes('example.com') ||
        /\.(pdf|docx|doc|png|jpg)$/i.test(domainPart)
      ) {
        continue;
      }
      // Ensure the TLD is a real domain TLD (at least 2 letters, not e.g. "B.Sc")
      const tldMatch = /\.([a-zA-Z]{2,12})(?:\/|$)/.exec(domainPart);
      if (!tldMatch) continue;
      const tld = tldMatch[1].toLowerCase();
      if (['sc', 'ba', 'bs', 'ms', 'ma', 'ph', 'dr', 'mr', 'st'].includes(tld) && domainPart.length < 8) {
        continue;
      }

      personal.website = fullMatch
        .replace(/^https?:\/\/(www\.)?/i, '')
        .replace(/\/$/, '');
      break;
    }
    if (personal.website) break;
  }

  // 5. Analyze header lines for Name, Job Title, Location, and any inline summary paragraph
  const extraSummaryLines: string[] = [];
  const candidateHeaderTokens: string[] = [];

  for (const rawLine of headerLines) {
    const cleanedLine = rawLine.replace(/^•\s*/, '').trim();
    if (!cleanedLine) continue;

    // If a header line is a long paragraph (> 90 chars), treat it as an untitled summary paragraph
    if (
      cleanedLine.length > 90 &&
      !cleanedLine.includes('@') &&
      !cleanedLine.includes('|') &&
      !cleanedLine.includes('•')
    ) {
      extraSummaryLines.push(cleanedLine);
      continue;
    }

    // Split line by common contact separators (|, •, ·, —)
    const segments = cleanedLine
      .split(/\s*(?:\||•|·)\s*/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const seg of segments) {
      // Skip segments that are just email, phone, linkedin, or website
      if (personal.email && seg.includes(personal.email)) continue;
      if (personal.phone && seg.includes(personal.phone)) continue;
      if (/linkedin\.com/i.test(seg)) continue;
      if (personal.website && seg.toLowerCase().includes(personal.website.toLowerCase())) {
        continue;
      }
      if (/^(?:email|phone|tel|mobile|linkedin|website|portfolio|location|address)\s*:/i.test(seg)) {
        const val = seg.replace(/^[a-zA-Z\s]+:\s*/i, '').trim();
        if (!personal.location && looksLikeLocation(val)) {
          personal.location = val;
        }
        continue;
      }

      if (!personal.location && looksLikeLocation(seg)) {
        personal.location = seg;
        continue;
      }

      candidateHeaderTokens.push(seg);
    }
  }

  // Identify Full Name and Job Title from candidateHeaderTokens
  for (const token of candidateHeaderTokens) {
    const cleanToken = token
      .replace(/\b(?:curriculum\s+vitae|resume|cv)\b/gi, '')
      .trim();
    if (!cleanToken) continue;

    if (!personal.fullName) {
      // Name is typically 2-4 words, letters/spaces/hyphens/apostrophes, not a pure job title if another line exists
      const wordCount = cleanToken.split(/\s+/).length;
      if (
        wordCount >= 1 &&
        wordCount <= 5 &&
        cleanToken.length <= 45 &&
        !/\d/.test(cleanToken)
      ) {
        personal.fullName = cleanToken;
        continue;
      }
    }

    if (!personal.jobTitle) {
      if (
        ROLE_KEYWORDS_REGEX.test(cleanToken) ||
        (cleanToken.length <= 65 && cleanToken !== personal.fullName)
      ) {
        personal.jobTitle = cleanToken;
      }
    }
  }

  return { personal, extraSummaryLines };
}

/**
 * Checks whether a line in the Experience section is an achievement bullet point.
 */
function isAchievementLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(?:•|-|\*|\u2022|\d+\.)\s+/.test(trimmed)) return true;
  if (extractInlineDateRange(trimmed)) return false;
  if (ACTION_VERB_START_REGEX.test(trimmed) && trimmed.split(/\s+/).length >= 5) {
    return true;
  }
  if (trimmed.length > 68 && /[.!]$/.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Layer 3: Group and parse Work Experience entries from the Experience section lines.
 */
function parseExperienceSection(lines: string[]): {
  items: ExperienceItem[];
  dateWarnings: string[];
  uncertainFields: string[];
  unmappedLines: string[];
} {
  const items: ExperienceItem[] = [];
  const dateWarnings: string[] = [];
  const uncertainFields: string[] = [];
  const unmappedLines: string[] = [];

  if (lines.length === 0) {
    return { items, dateWarnings, uncertainFields, unmappedLines };
  }

  interface RawExpGroup {
    headerLines: string[];
    bullets: string[];
    hasDateRange: boolean;
  }

  const groups: RawExpGroup[] = [];
  let pendingHeaders: string[] = [];
  let currentGroup: RawExpGroup | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const bulletMatch = isAchievementLine(line);
    const inlineDate = !bulletMatch ? extractInlineDateRange(line) : null;

    if (bulletMatch) {
      const cleanBullet = line.replace(/^(?:•|-|\*|\u2022|\d+\.)\s*/, '').trim();
      if (!cleanBullet) continue;

      if (!currentGroup) {
        currentGroup = {
          headerLines: [...pendingHeaders],
          bullets: [cleanBullet],
          hasDateRange: false,
        };
        pendingHeaders = [];
        groups.push(currentGroup);
      } else if (pendingHeaders.length > 0 && currentGroup.bullets.length > 0) {
        // Pending headers appeared after the previous role's bullets -> start a new role!
        currentGroup = {
          headerLines: [...pendingHeaders],
          bullets: [cleanBullet],
          hasDateRange: false,
        };
        pendingHeaders = [];
        groups.push(currentGroup);
      } else {
        currentGroup.bullets.push(cleanBullet);
      }
      continue;
    }

    // Non-bullet line
    if (inlineDate) {
      if (
        !currentGroup ||
        currentGroup.hasDateRange ||
        currentGroup.bullets.length > 0
      ) {
        currentGroup = {
          headerLines: [...pendingHeaders, line],
          bullets: [],
          hasDateRange: true,
        };
        pendingHeaders = [];
        groups.push(currentGroup);
      } else {
        currentGroup.headerLines.push(line);
        currentGroup.hasDateRange = true;
      }
    } else {
      // Short header line without a date range (e.g. Job Title or Company Name)
      if (!currentGroup) {
        pendingHeaders.push(line);
      } else if (currentGroup.bullets.length > 0) {
        // We already collected bullets for currentGroup, so this non-bullet line is the header for the NEXT role
        pendingHeaders.push(line);
      } else if (currentGroup.headerLines.length < 3) {
        currentGroup.headerLines.push(line);
      } else {
        pendingHeaders.push(line);
      }
    }
  }

  if (pendingHeaders.length > 0) {
    if (groups.length === 0) {
      groups.push({
        headerLines: pendingHeaders,
        bullets: [],
        hasDateRange: false,
      });
    } else {
      unmappedLines.push(...pendingHeaders);
    }
  }

  // Convert each RawExpGroup into an ExperienceItem
  for (let idx = 0; idx < groups.length; idx++) {
    const group = groups[idx];
    let jobTitle = '';
    let company = '';
    let location = '';
    let startDate = '';
    let endDate = '';
    let isCurrent = false;

    const headerSegments: string[] = [];

    for (const hLine of group.headerLines) {
      const dateExtract = extractInlineDateRange(hLine);
      if (dateExtract && !startDate && !endDate) {
        startDate = dateExtract.range.startDate;
        endDate = dateExtract.range.endDate;
        isCurrent = dateExtract.range.isCurrent;
        for (const w of dateExtract.range.warnings) {
          dateWarnings.push(`Experience #${idx + 1}: ${w}`);
        }
        if (dateExtract.remainingText) {
          const parts = dateExtract.remainingText
            .split(/\s*(?:\||·|•|—|–|\s-\s)\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
          headerSegments.push(...parts);
        }
      } else {
        const parts = hLine
          .split(/\s*(?:\||·|•|—|–|\s-\s)\s*/)
          .map((s) => s.trim())
          .filter(Boolean);
        headerSegments.push(...parts);
      }
    }

    // Also handle "Job Title at Company" within a single segment
    const expandedSegments: string[] = [];
    for (const seg of headerSegments) {
      const atMatch = /^(.+?)\s+at\s+(.+)$/i.exec(seg);
      if (atMatch && ROLE_KEYWORDS_REGEX.test(atMatch[1])) {
        expandedSegments.push(atMatch[1].trim(), atMatch[2].trim());
      } else {
        expandedSegments.push(seg);
      }
    }

    for (const seg of expandedSegments) {
      if (!seg) continue;
      if (!location && looksLikeLocation(seg)) {
        location = seg;
        continue;
      }
      if (!jobTitle && ROLE_KEYWORDS_REGEX.test(seg) && !COMPANY_INDICATOR_REGEX.test(seg)) {
        jobTitle = seg;
        continue;
      }
      if (!company && COMPANY_INDICATOR_REGEX.test(seg) && !ROLE_KEYWORDS_REGEX.test(seg)) {
        company = seg;
        continue;
      }
      if (!jobTitle) {
        jobTitle = seg;
      } else if (!company) {
        // Check if company has ", City, Country" attached
        const commaParts = seg.split(',').map((p) => p.trim());
        if (
          !location &&
          commaParts.length >= 2 &&
          looksLikeLocation(commaParts.slice(-2).join(', '))
        ) {
          company = commaParts.slice(0, -2).join(', ') || commaParts[0];
          location = commaParts.slice(-2).join(', ');
        } else {
          company = seg;
        }
      } else if (!location) {
        location = seg;
      }
    }

    if (!jobTitle && !company && group.bullets.length === 0) {
      continue;
    }

    if (!jobTitle) {
      uncertainFields.push(
        `Work Experience #${idx + 1} (${company || 'Unnamed role'}): Job title could not be confidently identified.`
      );
    }
    if (!company) {
      uncertainFields.push(
        `Work Experience #${idx + 1} (${jobTitle || 'Unnamed role'}): Company name could not be confidently identified.`
      );
    }
    if (!startDate) {
      uncertainFields.push(
        `Work Experience #${idx + 1} (${jobTitle || company || 'Role'}): Start date is missing.`
      );
    }

    items.push({
      id: createImportId('exp'),
      jobTitle,
      company,
      location,
      startDate,
      endDate: isCurrent ? '' : endDate,
      isCurrent,
      achievements: group.bullets.length > 0 ? group.bullets : [''],
    });
  }

  return { items, dateWarnings, uncertainFields, unmappedLines };
}

/**
 * Layer 4A: Parse Education entries.
 */
function parseEducationSection(lines: string[]): {
  items: EducationItem[];
  dateWarnings: string[];
  uncertainFields: string[];
} {
  const items: EducationItem[] = [];
  const dateWarnings: string[] = [];
  const uncertainFields: string[] = [];

  if (lines.length === 0) {
    return { items, dateWarnings, uncertainFields };
  }

  interface EduGroup {
    lines: string[];
  }

  const groups: EduGroup[] = [];
  let current: EduGroup | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/^•\s*/, '').trim();
    if (!line) continue;

    const hasDegree = DEGREE_KEYWORDS_REGEX.test(line);
    const hasDate = Boolean(extractInlineDateRange(line));

    if (!current) {
      current = { lines: [line] };
      groups.push(current);
    } else if (
      hasDegree &&
      current.lines.some((l) => DEGREE_KEYWORDS_REGEX.test(l))
    ) {
      // Starting a second degree entry
      current = { lines: [line] };
      groups.push(current);
    } else if (
      hasDate &&
      current.lines.some((l) => Boolean(extractInlineDateRange(l))) &&
      current.lines.length >= 2
    ) {
      current = { lines: [line] };
      groups.push(current);
    } else {
      current.lines.push(line);
    }
  }

  for (let idx = 0; idx < groups.length; idx++) {
    const group = groups[idx];
    let degree = '';
    let institution = '';
    let location = '';
    let startDate = '';
    let endDate = '';
    const descLines: string[] = [];

    for (const line of group.lines) {
      const dateExtract = extractInlineDateRange(line);
      let textToInspect = line;

      if (dateExtract && !startDate && !endDate) {
        startDate = dateExtract.range.startDate;
        endDate = dateExtract.range.isCurrent ? '' : dateExtract.range.endDate;
        for (const w of dateExtract.range.warnings) {
          dateWarnings.push(`Education #${idx + 1}: ${w}`);
        }
        textToInspect = dateExtract.remainingText;
      } else {
        // Check for a standalone single graduation year like "Graduated 2018" or "2018"
        const singleYearMatch = /\b((?:19|20)\d{2})\b/.exec(line);
        if (
          singleYearMatch &&
          !startDate &&
          !endDate &&
          line.replace(singleYearMatch[0], '').trim().length < 15
        ) {
          const norm = normalizeSingleDate(singleYearMatch[1]);
          endDate = norm.value;
          if (norm.warning) dateWarnings.push(`Education #${idx + 1}: ${norm.warning}`);
          textToInspect = line
            .replace(/\b(?:graduated|class\s+of)?\s*(?:19|20)\d{2}\b/i, '')
            .trim();
        }
      }

      if (!textToInspect) continue;

      const segments = textToInspect
        .split(/\s*(?:\||·|•|—|–|\s-\s)\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const seg of segments) {
        if (!location && looksLikeLocation(seg)) {
          location = seg;
        } else if (!degree && DEGREE_KEYWORDS_REGEX.test(seg)) {
          degree = seg;
        } else if (!institution && INSTITUTION_KEYWORDS_REGEX.test(seg)) {
          institution = seg;
        } else if (!degree) {
          degree = seg;
        } else if (!institution && seg.length < 65) {
          institution = seg;
        } else {
          descLines.push(seg);
        }
      }
    }

    if (!degree && !institution) continue;

    if (!degree || !institution) {
      uncertainFields.push(
        `Education #${idx + 1}: Please verify degree and institution name.`
      );
    }

    items.push({
      id: createImportId('edu'),
      degree,
      institution,
      location,
      startDate,
      endDate,
      description: descLines.join('. ').replace(/\.\./g, '.').trim(),
    });
  }

  return { items, dateWarnings, uncertainFields };
}

/**
 * Layer 4B: Parse Skills list without inventing any skills not in the text.
 */
function parseSkillsSection(lines: string[]): {
  skills: string[];
  embeddedLanguages: LanguageItem[];
} {
  const skills: string[] = [];
  const seen = new Set<string>();
  const embeddedLanguages: LanguageItem[] = [];

  for (const rawLine of lines) {
    const cleaned = rawLine.replace(/^•\s*/, '').trim();
    if (!cleaned) continue;

    // Check if a line in Skills is actually "Languages: English (Fluent), Arabic (Intermediate)"
    if (/^languages?\s*:/i.test(cleaned)) {
      const langContent = cleaned.replace(/^languages?\s*:\s*/i, '');
      const parsedLangs = parseLanguagesSection([langContent]);
      embeddedLanguages.push(...parsedLangs);
      continue;
    }

    // Strip category prefix like "Technical Skills: " or "Tools & Platforms: "
    const withoutCategory = cleaned.replace(/^[A-Za-z0-9\s/&+-]{2,28}:\s*/, '');

    const tokens = withoutCategory
      .split(/\s*(?:,|•|\||;|·)\s*/)
      .map((t) => t.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean);

    for (const token of tokens) {
      // Skip overly long sentences or pure proficiency words
      if (token.length < 2 || token.length > 42) continue;
      if (PROFICIENCY_LEVELS_SET.has(token.toLowerCase())) continue;

      const key = token.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        skills.push(token);
      }
    }
  }

  return { skills, embeddedLanguages };
}

const PROFICIENCY_LEVELS_SET = new Set([
  'native',
  'fluent',
  'advanced',
  'intermediate',
  'basic',
  'bilingual',
  'proficient',
]);

/**
 * Layer 4C: Parse Languages and proficiency levels.
 * Handles inline formats ("English (Fluent), Arabic (Intermediate)"),
 * dash/colon formats ("English — Fluent"), and two-line pairs ("English" followed by "Fluent").
 */
export function parseLanguagesSection(lines: string[]): LanguageItem[] {
  const results: LanguageItem[] = [];
  const seen = new Set<string>();

  const addLang = (name: string, rawProf?: string) => {
    const cleanName = name
      .replace(/^[•\-*·|:\s]+|[•\-*·|:\s]+$/g, '')
      .trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 30) return;
    if (PROFICIENCY_LEVELS_SET.has(cleanName.toLowerCase())) return;

    const key = cleanName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    results.push({
      id: createImportId('lang'),
      name: cleanName,
      proficiency: normalizeLanguageProficiency(rawProf),
    });
  };

  // Expand comma/pipe/bullet separated tokens across lines
  const tokens: string[] = [];
  for (const rawLine of lines) {
    const cleaned = rawLine.replace(/^•\s*/, '').trim();
    if (!cleaned) continue;
    const parts = cleaned
      .split(/\s*(?:,|\||;|•|·)\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    tokens.push(...parts);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // 1. "English (Fluent)" or "Arabic [Intermediate]"
    const parenMatch = /^([A-Za-z\s]+?)\s*[([]([^)\]]+)[)\]]$/.exec(token);
    if (parenMatch) {
      addLang(parenMatch[1], parenMatch[2]);
      continue;
    }

    // 2. "English - Fluent" or "Arabic: Intermediate" or "Urdu — Native"
    const sepMatch = /^([A-Za-z\s]+?)\s*(?:[-–—:]|\s+is\s+)\s*([A-Za-z0-9\s]+)$/.exec(
      token
    );
    if (sepMatch) {
      addLang(sepMatch[1], sepMatch[2]);
      continue;
    }

    // 3. Check if next token is purely a proficiency keyword (two-line layout: "English" \n "Fluent")
    const nextToken = tokens[i + 1];
    if (
      nextToken &&
      /^(?:native|fluent|advanced|intermediate|basic|bilingual|proficient|mother\s+tongue|conversational|elementary|c1|c2|b1|b2|a1|a2)$/i.test(
        nextToken.trim()
      )
    ) {
      addLang(token, nextToken);
      i += 1;
      continue;
    }

    // 4. Check if token matches a known language name (with or without trailing proficiency word)
    for (const known of KNOWN_LANGUAGES) {
      const regex = new RegExp(`^(${known})(?:\\s+([A-Za-z0-9\\s]+))?$`, 'i');
      const match = regex.exec(token);
      if (match) {
        addLang(known, match[2]);
        break;
      }
    }
  }

  return results;
}

/**
 * Layer 4D: Parse Projects section.
 */
function parseProjectsSection(lines: string[]): ProjectItem[] {
  const projects: ProjectItem[] = [];
  if (lines.length === 0) return projects;

  interface ProjGroup {
    titleLine: string;
    bodyLines: string[];
  }

  const groups: ProjGroup[] = [];
  let current: ProjGroup | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = /^•\s*/.test(line);
    const cleaned = line.replace(/^•\s*/, '').trim();

    if (
      !current ||
      (!isBullet &&
        cleaned.length <= 65 &&
        !/[.!]$/.test(cleaned) &&
        current.bodyLines.length > 0)
    ) {
      current = { titleLine: cleaned, bodyLines: [] };
      groups.push(current);
    } else {
      current.bodyLines.push(cleaned);
    }
  }

  for (const grp of groups) {
    let title = grp.titleLine;
    let technologies = '';
    let url = '';
    const descParts: string[] = [];

    // Check if titleLine has "Title | Technologies" or "Title (Technologies)"
    const pipeParts = title.split(/\s*\|\s*/);
    if (pipeParts.length >= 2) {
      title = pipeParts[0].trim();
      technologies = pipeParts.slice(1).join(', ').trim();
    }

    for (const bLine of grp.bodyLines) {
      if (/^(?:technologies|tech\s+stack|built\s+with|tools)\s*:/i.test(bLine)) {
        technologies = bLine.replace(/^[a-zA-Z\s]+:\s*/i, '').trim();
        continue;
      }
      const urlMatch =
        /\b((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\/[^\s)]+)/i.exec(
          bLine
        );
      if (urlMatch && !url) {
        url = urlMatch[1].replace(/^https?:\/\/(www\.)?/i, '');
        const rest = bLine.replace(urlMatch[0], '').replace(/^[|·•\-:\s]+|[|·•\-:\s]+$/g, '').trim();
        if (rest) descParts.push(rest);
        continue;
      }
      descParts.push(bLine);
    }

    if (title) {
      projects.push({
        id: createImportId('proj'),
        title,
        description: descParts.join(' '),
        technologies,
        url,
      });
    }
  }

  return projects;
}

/**
 * Layer 4E: Parse Certifications section.
 */
function parseCertificationsSection(lines: string[]): {
  items: CertificationItem[];
  dateWarnings: string[];
} {
  const items: CertificationItem[] = [];
  const dateWarnings: string[] = [];

  for (const rawLine of lines) {
    const cleaned = rawLine.replace(/^•\s*/, '').trim();
    if (!cleaned) continue;

    let issueDate = '';
    let remaining = cleaned;

    // Look for YYYY-MM, Month YYYY, or YYYY at end or in parens
    const dateTokenRegex =
      /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*(?:19|20)\d{2}|(?:19|20)\d{2}-(?:0[1-9]|1[0-2])|\d{1,2}\/(?:19|20)\d{2}|(?:19|20)\d{2})\b/i;

    const dateMatch = dateTokenRegex.exec(cleaned);
    if (dateMatch) {
      const norm = normalizeSingleDate(dateMatch[1]);
      issueDate = norm.value;
      if (norm.warning) {
        dateWarnings.push(`Certification "${cleaned.slice(0, 35)}": ${norm.warning}`);
      }
      remaining = cleaned
        .replace(dateMatch[0], '')
        .replace(/\(\s*\)/g, '')
        .trim();
    }

    const parts = remaining
      .split(/\s*(?:\||—|–|\s-\s|,|\bissued\s+by\b)\s*/i)
      .map((p) => p.replace(/^[()[\]\s]+|[()[\]\s]+$/g, '').trim())
      .filter(Boolean);

    const name = parts[0] || remaining;
    const issuer = parts[1] || '';

    if (name) {
      items.push({
        id: createImportId('cert'),
        name,
        issuer,
        issueDate,
      });
    }
  }

  return { items, dateWarnings };
}

/**
 * Master 5-Layer Resume Parser: Maps an ExtractedDocumentResult (or raw lines)
 * into ResumeData plus detailed review diagnostics.
 */
export function parseExtractedResume(
  doc: Pick<
    ExtractedDocumentResult,
    | 'lines'
    | 'rawText'
    | 'fileName'
    | 'fileType'
    | 'hasComplexLayout'
    | 'hasTables'
    | 'extractedLinks'
    | 'extractedPhotoDataUrl'
    | 'photoNotice'
  >
): ParsedResumeImport {
  const sections: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
  };

  const recognizedSections: string[] = [];
  let currentSection: SectionKey = 'header';

  // Layer 2: Partition lines by recognized section headings
  for (const rawLine of doc.lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const detected = detectSectionHeading(line);
    if (detected) {
      currentSection = detected;
      if (!recognizedSections.includes(detected)) {
        recognizedSections.push(detected);
      }
      continue;
    }

    sections[currentSection].push(line);
  }

  // Layer 1: Personal & Header
  const { personal, extraSummaryLines } = parsePersonalAndHeader(
    sections.header,
    doc.lines,
    doc.extractedLinks || []
  );

  if (doc.extractedPhotoDataUrl) {
    personal.photo = doc.extractedPhotoDataUrl;
  }

  // Summary
  const summaryLines = [...sections.summary, ...extraSummaryLines];
  const summary = summaryLines
    .map((l) => l.replace(/^•\s*/, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Layer 3: Work Experience
  const expResult = parseExperienceSection(sections.experience);

  // Layer 4: Education, Skills, Languages, Projects, Certifications
  const eduResult = parseEducationSection(sections.education);
  const skillsResult = parseSkillsSection(sections.skills);
  const directLanguages = parseLanguagesSection(sections.languages);

  // Combine direct languages and any languages embedded inside Skills
  const combinedLanguages: LanguageItem[] = [...directLanguages];
  const seenLangs = new Set(combinedLanguages.map((l) => l.name.toLowerCase()));
  for (const emb of skillsResult.embeddedLanguages) {
    if (!seenLangs.has(emb.name.toLowerCase())) {
      seenLangs.add(emb.name.toLowerCase());
      combinedLanguages.push(emb);
    }
  }

  const projects = parseProjectsSection(sections.projects);
  const certResult = parseCertificationsSection(sections.certifications);

  // Layer 5: Validation, Normalization & Diagnostics
  const missingFields: string[] = [];
  if (!personal.fullName) missingFields.push('Full Name');
  if (!personal.jobTitle) missingFields.push('Professional Job Title');
  if (!personal.email) missingFields.push('Email Address');
  if (!personal.phone) missingFields.push('Phone Number');
  if (!summary) missingFields.push('Professional Summary');
  if (expResult.items.length === 0) missingFields.push('Work Experience');
  if (eduResult.items.length === 0) missingFields.push('Education');
  if (skillsResult.skills.length === 0) missingFields.push('Skills');

  const uncertainFields = [
    ...expResult.uncertainFields,
    ...eduResult.uncertainFields,
  ];

  const dateWarnings = [
    ...expResult.dateWarnings,
    ...eduResult.dateWarnings,
    ...certResult.dateWarnings,
  ];

  const layoutWarnings: string[] = [];
  if (doc.hasComplexLayout) {
    layoutWarnings.push(
      'Multi-column layout detected in the uploaded document. Please review extracted experience and education fields to verify reading order.'
    );
  }
  if (doc.hasTables) {
    layoutWarnings.push(
      'Table formatting detected in the uploaded document. Please verify that table cells mapped accurately.'
    );
  }
  if (recognizedSections.length === 0) {
    layoutWarnings.push(
      'No standard resume section headings (such as Experience, Education, or Skills) were detected. Please review and complete any missing sections manually.'
    );
  }

  const parsedData: ResumeData = {
    personal,
    summary,
    experience: expResult.items,
    education: eduResult.items,
    skills: skillsResult.skills,
    languages: combinedLanguages,
    projects,
    certifications: certResult.items,
    selectedTemplate: SAMPLE_RESUME_DATA.selectedTemplate,
    accentColor: SAMPLE_RESUME_DATA.accentColor,
    photoSettings: {
      visible: Boolean(personal.photo) || SAMPLE_RESUME_DATA.photoSettings.visible,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      shape: 'circle',
    },
  };

  return {
    data: parsedData,
    diagnostics: {
      missingFields,
      uncertainFields,
      dateWarnings,
      layoutWarnings,
      photoNotice:
        doc.photoNotice ||
        (personal.photo
          ? 'Embedded portrait photo detected and imported.'
          : 'Profile photo not imported. You can upload one manually.'),
      unmappedLines: expResult.unmappedLines,
      hasRecognizableSections:
        recognizedSections.length > 0 ||
        Boolean(personal.email || personal.phone || personal.fullName),
      recognizedSections,
    },
    rawText: doc.rawText,
    fileName: doc.fileName,
    fileType: doc.fileType,
  };
}
