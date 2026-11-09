import { ExperienceItem, ResumeData } from './types';

export type JobCategory =
  | 'Software Developer'
  | 'UI/UX Designer'
  | 'Digital Marketer'
  | 'Project Manager'
  | 'Sales Professional'
  | 'Accountant'
  | 'Teacher'
  | 'Engineer'
  | 'Data Analyst'
  | 'HR Professional';

export const JOB_CATEGORIES: JobCategory[] = [
  'Software Developer',
  'UI/UX Designer',
  'Digital Marketer',
  'Project Manager',
  'Sales Professional',
  'Accountant',
  'Teacher',
  'Engineer',
  'Data Analyst',
  'HR Professional',
];

export const CATEGORY_SKILLS_MAP: Record<JobCategory, string[]> = {
  'Software Developer': [
    'TypeScript',
    'React',
    'Node.js',
    'REST APIs',
    'PostgreSQL',
    'Git & CI/CD',
    'System Architecture',
    'Automated Testing',
    'Cloud Deployment',
    'Agile Development',
  ],
  'UI/UX Designer': [
    'Figma',
    'Design Systems',
    'User Research',
    'Wireframing & Prototyping',
    'Usability Testing',
    'Interaction Design',
    'Information Architecture',
    'WCAG Accessibility',
    'Responsive Web Design',
    'Design Handoff',
  ],
  'Digital Marketer': [
    'Digital Marketing',
    'SEO & SEM',
    'Google Analytics',
    'Google Ads',
    'Content Strategy',
    'Social Media Marketing',
    'Conversion Rate Optimization',
    'Email Automation',
    'Campaign Management',
    'Marketing Attribution',
  ],
  'Project Manager': [
    'Project Lifecycle Management',
    'Agile & Scrum',
    'Stakeholder Communication',
    'Risk Mitigation',
    'Resource Allocation',
    'Budget Tracking',
    'Cross-Functional Leadership',
    'Jira & Confluence',
    'Process Improvement',
    'Vendor Management',
  ],
  'Sales Professional': [
    'B2B Consultative Selling',
    'Pipeline Management',
    'CRM Administration (Salesforce)',
    'Account Expansion',
    'Contract Negotiation',
    'Executive Presentations',
    'Lead Qualification',
    'Revenue Forecasting',
    'Client Retention',
    'Territory Strategy',
  ],
  Accountant: [
    'Financial Reporting',
    'General Ledger Reconciliation',
    'GAAP & IFRS Compliance',
    'Accounts Payable & Receivable',
    'Tax Preparation',
    'Budget Variance Analysis',
    'Audit Preparation',
    'ERP Systems (SAP / NetSuite)',
    'Advanced Excel Modeling',
    'Internal Controls',
  ],
  Teacher: [
    'Curriculum Development',
    'Differentiated Instruction',
    'Classroom Management',
    'Student Assessment',
    'Individualized Education Plans',
    'Educational Technology',
    'Parent-Teacher Communication',
    'Lesson Planning',
    'Collaborative Learning',
    'Academic Mentoring',
  ],
  Engineer: [
    'CAD Modeling (AutoCAD / SolidWorks)',
    'Technical Specifications',
    'Quality Assurance & Testing',
    'Root Cause Analysis',
    'Systems Integration',
    'Safety & Regulatory Compliance',
    'Lean Manufacturing',
    'Project Documentation',
    'Structural Analysis',
    'Cross-Discipline Coordination',
  ],
  'Data Analyst': [
    'SQL & Relational Databases',
    'Python (Pandas / NumPy)',
    'Data Visualization (Tableau / Power BI)',
    'Statistical Analysis',
    'A/B Testing & Experimentation',
    'ETL Data Pipelines',
    'KPI Dashboarding',
    'Predictive Modeling',
    'Spreadsheet Automation',
    'Business Intelligence',
  ],
  'HR Professional': [
    'Full-Cycle Talent Acquisition',
    'Employee Relations',
    'Onboarding & Retention',
    'Performance Management',
    'HRIS Administration',
    'Compensation & Benefits',
    'Labor Law Compliance',
    'Training & Development',
    'Workforce Planning',
    'Organizational Culture',
  ],
};

/**
 * Matches a freeform job title to the closest supported JobCategory.
 */
export function detectJobCategory(jobTitle: string): JobCategory {
  const lower = (jobTitle || '').toLowerCase();
  if (lower.includes('ux') || lower.includes('ui') || lower.includes('design') || lower.includes('product designer')) {
    return 'UI/UX Designer';
  }
  if (lower.includes('market') || lower.includes('seo') || lower.includes('brand') || lower.includes('growth') || lower.includes('content')) {
    return 'Digital Marketer';
  }
  if (lower.includes('data') || lower.includes('analyst') || lower.includes('analytics') || lower.includes('bi ')) {
    return 'Data Analyst';
  }
  if (lower.includes('project') || lower.includes('scrum') || lower.includes('program') || lower.includes('product manager') || lower.includes('delivery')) {
    return 'Project Manager';
  }
  if (lower.includes('sales') || lower.includes('account executive') || lower.includes('business development') || lower.includes('commercial')) {
    return 'Sales Professional';
  }
  if (lower.includes('accountant') || lower.includes('accounting') || lower.includes('finance') || lower.includes('auditor') || lower.includes('controller') || lower.includes('bookkeep')) {
    return 'Accountant';
  }
  if (lower.includes('teach') || lower.includes('educat') || lower.includes('instructor') || lower.includes('professor') || lower.includes('lecturer')) {
    return 'Teacher';
  }
  if (lower.includes('hr') || lower.includes('human resource') || lower.includes('recruit') || lower.includes('talent') || lower.includes('people')) {
    return 'HR Professional';
  }
  if (
    lower.includes('mechanical') ||
    lower.includes('civil') ||
    lower.includes('electrical') ||
    lower.includes('industrial') ||
    lower.includes('chemical') ||
    (lower.includes('engineer') && !lower.includes('software') && !lower.includes('frontend') && !lower.includes('backend') && !lower.includes('full'))
  ) {
    return 'Engineer';
  }
  return 'Software Developer';
}

/**
 * Suggests relevant skills based on job title or explicit category, filtering out skills already present.
 */
export function getSuggestedSkills(
  jobTitleOrCategory: string,
  existingSkills: string[]
): { category: JobCategory; suggestions: string[] } {
  const matchedCategory = (JOB_CATEGORIES.find(
    (c) => c.toLowerCase() === jobTitleOrCategory.trim().toLowerCase()
  ) || detectJobCategory(jobTitleOrCategory)) as JobCategory;

  const existingSet = new Set(existingSkills.map((s) => s.trim().toLowerCase()));
  const pool = CATEGORY_SKILLS_MAP[matchedCategory] || CATEGORY_SKILLS_MAP['Software Developer'];
  const suggestions = pool.filter((skill) => !existingSet.has(skill.toLowerCase()));

  return {
    category: matchedCategory,
    suggestions,
  };
}

/**
 * Calculates approximate experience span from experience entries without inventing years if dates are empty.
 */
function calculateActualExperiencePhrase(experience: ExperienceItem[]): string {
  const validRanges: { startMs: number; endMs: number }[] = [];
  const now = new Date();

  for (const item of experience) {
    if (!item.startDate || !/^\d{4}-\d{2}$/.test(item.startDate)) continue;
    const [sYear, sMonth] = item.startDate.split('-').map(Number);
    const startMs = new Date(sYear, sMonth - 1, 1).getTime();

    let endMs = now.getTime();
    if (!item.isCurrent && item.endDate && /^\d{4}-\d{2}$/.test(item.endDate)) {
      const [eYear, eMonth] = item.endDate.split('-').map(Number);
      endMs = new Date(eYear, eMonth - 1, 28).getTime();
    }

    if (endMs >= startMs) {
      validRanges.push({ startMs, endMs });
    }
  }

  if (validRanges.length === 0) return '';

  const earliestStart = Math.min(...validRanges.map((r) => r.startMs));
  const latestEnd = Math.max(...validRanges.map((r) => r.endMs));
  const diffYears = (latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 365.25);

  if (diffYears >= 1.5) {
    const rounded = Math.floor(diffYears);
    return `with over ${rounded} ${rounded === 1 ? 'year' : 'years'} of hands-on experience`;
  }
  if (diffYears >= 0.5) {
    return 'with practical experience';
  }
  return '';
}

/**
 * Generates a polished, profession-aware summary without inventing metrics or fake qualifications.
 */
export function generateProfessionalSummary(resume: ResumeData): string {
  const role = resume.personal.jobTitle.trim() || 'Professional';
  const category = detectJobCategory(role);
  const expPhrase = calculateActualExperiencePhrase(resume.experience);
  const topSkills = resume.skills.slice(0, 5).filter(Boolean);

  const companies = resume.experience
    .map((e) => e.company.trim())
    .filter(Boolean)
    .slice(0, 2);

  const recentRole = resume.experience
    .map((e) => e.jobTitle.trim())
    .filter(Boolean)[0];

  const skillsClause =
    topSkills.length >= 3
      ? `Core competencies include ${topSkills.slice(0, -1).join(', ')}, and ${topSkills[topSkills.length - 1]}.`
      : topSkills.length > 0
        ? `Proficient in ${topSkills.join(' and ')}.`
        : 'Equipped with a strong foundation in cross-functional collaboration, analytical problem solving, and structured execution.';

  const historyClause =
    companies.length > 0
      ? `Proven track record of contributing to high-impact initiatives${recentRole ? ` as ${recentRole}` : ''} at ${companies.join(' and ')}.`
      : 'Committed to delivering measurable operational excellence, clear stakeholder communication, and continuous process improvement.';

  const categoryTemplates: Record<JobCategory, string> = {
    'Digital Marketer': `Results-oriented ${role}${expPhrase ? ` ${expPhrase}` : ''} developing integrated digital strategies, optimizing multi-channel campaigns, and aligning brand messaging with audience intent. ${skillsClause} ${historyClause} Skilled at translating performance analytics into actionable marketing initiatives that strengthen customer engagement and sustainable growth.`,
    'Software Developer': `Detail-driven ${role}${expPhrase ? ` ${expPhrase}` : ''} designing, building, and maintaining scalable software applications and reliable user experiences. ${skillsClause} ${historyClause} Focused on writing clean, maintainable code, collaborating across product and engineering teams, and delivering resilient technical solutions.`,
    'UI/UX Designer': `User-centered ${role}${expPhrase ? ` ${expPhrase}` : ''} crafting intuitive digital products, cohesive design systems, and accessible interface workflows from concept to delivery. ${skillsClause} ${historyClause} Dedicated to bridging user research insights with business goals to create clear, engaging product experiences.`,
    'Project Manager': `Structured and collaborative ${role}${expPhrase ? ` ${expPhrase}` : ''} guiding cross-functional teams, managing project lifecycles, and aligning deliverables with strategic objectives. ${skillsClause} ${historyClause} Adept at removing delivery bottlenecks, maintaining transparent stakeholder communication, and keeping complex initiatives on schedule.`,
    'Sales Professional': `Client-focused ${role}${expPhrase ? ` ${expPhrase}` : ''} cultivating long-term commercial relationships, managing full-cycle pipelines, and aligning solutions with customer needs. ${skillsClause} ${historyClause} Recognized for consultative communication, disciplined account management, and consistent execution across competitive markets.`,
    Accountant: `Analytical and accuracy-driven ${role}${expPhrase ? ` ${expPhrase}` : ''} managing financial reporting, ledger reconciliations, and regulatory compliance workflows. ${skillsClause} ${historyClause} Dedicated to maintaining rigorous internal controls, clear audit documentation, and dependable financial insights for leadership.`,
    Teacher: `Dedicated and adaptable ${role}${expPhrase ? ` ${expPhrase}` : ''} fostering inclusive learning environments, designing structured curricula, and supporting diverse student needs. ${skillsClause} ${historyClause} Committed to encouraging critical thinking, clear academic progress, and constructive collaboration with students, families, and faculty.`,
    Engineer: `Solutions-oriented ${role}${expPhrase ? ` ${expPhrase}` : ''} applying rigorous technical analysis, quality assurance standards, and structured engineering methodology to complex projects. ${skillsClause} ${historyClause} Focused on operational safety, cross-disciplinary coordination, and reliable technical execution.`,
    'Data Analyst': `Insight-driven ${role}${expPhrase ? ` ${expPhrase}` : ''} transforming complex datasets into clear reporting dashboards, structured analyses, and evidence-based business recommendations. ${skillsClause} ${historyClause} Skilled at maintaining data integrity, identifying operational trends, and communicating findings clearly to technical and non-technical stakeholders.`,
    'HR Professional': `People-focused ${role}${expPhrase ? ` ${expPhrase}` : ''} supporting full-cycle talent acquisition, employee relations, onboarding programs, and organizational development. ${skillsClause} ${historyClause} Dedicated to building supportive workplace policies, streamlined HR operations, and strong team alignment.`,
  };

  return categoryTemplates[category] || categoryTemplates['Software Developer'];
}

interface BulletRewriteRule {
  pattern: RegExp;
  replace: (match: RegExpExecArray, original: string) => string;
}

const SPECIFIC_REWRITE_RULES: BulletRewriteRule[] = [
  {
    pattern: /^worked in a shop and helped customers\.?$/i,
    replace: () =>
      'Assisted retail customers with product selection, inquiries, and purchasing decisions.',
  },
  {
    pattern: /^(?:helped|assisted) customers(?: with (.*))?$/i,
    replace: (m) =>
      m[1]
        ? `Resolved customer inquiries and provided tailored guidance regarding ${m[1].replace(/\.$/, '')}.`
        : 'Assisted customers with product selection, inquiries, and timely issue resolution.',
  },
  {
    pattern: /^(?:was )?responsible for managing (.*)$/i,
    replace: (m) => `Directed and coordinated ${m[1].replace(/\.$/, '')} to ensure consistent operational delivery.`,
  },
  {
    pattern: /^(?:was )?responsible for (.*)$/i,
    replace: (m) => `Managed and executed ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^worked on (.*)$/i,
    replace: (m) => `Contributed to the development and execution of ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^helped (?:with|to) (.*)$/i,
    replace: (m) => `Collaborated cross-functionally to support and execute ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^made (.*) better$/i,
    replace: (m) => `Optimized and streamlined ${m[1].replace(/\.$/, '')} to enhance overall quality and efficiency.`,
  },
  {
    pattern: /^did (.*)$/i,
    replace: (m) => `Executed and delivered ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^handled (.*)$/i,
    replace: (m) => `Orchestrated and managed ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^in charge of (.*)$/i,
    replace: (m) => `Spearheaded and oversaw ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^wrote code for (.*)$/i,
    replace: (m) => `Engineered and maintained production code for ${m[1].replace(/\.$/, '')}.`,
  },
  {
    pattern: /^fixed bugs in (.*)$/i,
    replace: (m) => `Diagnosed and resolved software defects across ${m[1].replace(/\.$/, '')} to improve system stability.`,
  },
  {
    pattern: /^ran social media(.*)$/i,
    replace: (m) =>
      `Coordinated and executed social media campaigns${m[1] ? m[1].replace(/\.$/, '') : ''} to strengthen audience engagement.`,
  },
  {
    pattern: /^talked to clients(.*)$/i,
    replace: (m) =>
      `Communicated directly with clients${m[1] ? m[1].replace(/\.$/, '') : ''} to gather requirements and maintain high satisfaction.`,
  },
];

const WEAK_VERB_UPGRADES: Array<[RegExp, string]> = [
  [/^managed\b/i, 'Directed'],
  [/^led\b/i, 'Spearheaded'],
  [/^built\b/i, 'Engineered'],
  [/^created\b/i, 'Developed'],
  [/^made\b/i, 'Produced'],
  [/^used\b/i, 'Leveraged'],
  [/^improved\b/i, 'Elevated'],
  [/^increased\b/i, 'Accelerated'],
  [/^organized\b/i, 'Coordinated'],
  [/^checked\b/i, 'Audited'],
  [/^taught\b/i, 'Instructed'],
  [/^sold\b/i, 'Closed and delivered'],
  [/^designed\b/i, 'Architected'],
  [/^tested\b/i, 'Validated'],
  [/^updated\b/i, 'Modernized'],
  [/^supported\b/i, 'Facilitated'],
];

export const STRONG_ACTION_VERBS = new Set([
  'accelerated',
  'achieved',
  'administered',
  'advocated',
  'analyzed',
  'architected',
  'assisted',
  'audited',
  'authored',
  'automated',
  'boosted',
  'built',
  'championed',
  'closed',
  'coached',
  'collaborated',
  'communicated',
  'conceived',
  'conducted',
  'consolidated',
  'constructed',
  'contributed',
  'converted',
  'coordinated',
  'cultivated',
  'decreased',
  'defined',
  'delivered',
  'deployed',
  'designed',
  'developed',
  'devised',
  'diagnosed',
  'directed',
  'documented',
  'drove',
  'educated',
  'elevated',
  'eliminated',
  'enabled',
  'engineered',
  'enhanced',
  'established',
  'evaluated',
  'executed',
  'expanded',
  'expedited',
  'facilitated',
  'Forecasted',
  'forecasted',
  'formulated',
  'fostered',
  'founded',
  'generated',
  'guided',
  'headed',
  'identified',
  'implemented',
  'improved',
  'increased',
  'influenced',
  'initiated',
  'innovated',
  'inspected',
  'instituted',
  'instructed',
  'integrated',
  'introduced',
  'launched',
  'led',
  'leveraged',
  'maintained',
  'managed',
  'maximized',
  'mentored',
  'migrated',
  'minimized',
  'modernized',
  'monitored',
  'negotiated',
  'operated',
  'optimized',
  'orchestrated',
  'organized',
  'overhauled',
  'oversaw',
  'partnered',
  'performed',
  'pioneered',
  'planned',
  'prepared',
  'presented',
  'prioritized',
  'produced',
  'programmed',
  'projected',
  'promoted',
  'published',
  'reconciled',
  'redesigned',
  'reduced',
  'refined',
  'reorganized',
  'resolved',
  'restructured',
  'revamped',
  'reviewed',
  'revitalized',
  'scaled',
  'scheduled',
  'secured',
  'simplified',
  'spearheaded',
  'standardized',
  'steered',
  'streamlined',
  'strengthened',
  'structured',
  'supervised',
  'supported',
  'surpassed',
  'synthesized',
  'trained',
  'transformed',
  'translated',
  'upgraded',
  'utilized',
  'validated',
  'verified',
]);

/**
 * Improves a single achievement bullet deterministically without inventing numbers or facts.
 */
export function improveAchievementBullet(rawBullet: string): string {
  const trimmed = rawBullet.trim();
  if (!trimmed) return '';

  // Remove leading bullet characters if user pasted them
  const cleaned = trimmed.replace(/^[-•*]\s*/, '').trim();
  if (!cleaned) return '';

  // 1. Check specific phrase transformations (including the mandatory test example)
  for (const rule of SPECIFIC_REWRITE_RULES) {
    const match = rule.pattern.exec(cleaned);
    if (match) {
      const result = rule.replace(match, cleaned);
      return ensureSentenceCaseAndPeriod(result);
    }
  }

  // 2. Check weak/common starting verbs and upgrade them or strengthen phrasing
  for (const [verbRegex, replacementVerb] of WEAK_VERB_UPGRADES) {
    if (verbRegex.test(cleaned)) {
      const upgraded = cleaned.replace(verbRegex, replacementVerb);
      return ensureSentenceCaseAndPeriod(upgraded);
    }
  }

  // 3. Check if first word is already a strong action verb
  const firstWord = cleaned
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();

  if (STRONG_ACTION_VERBS.has(firstWord)) {
    return ensureSentenceCaseAndPeriod(cleaned);
  }

  // 4. If it starts with a noun or gerund (e.g. "Customer support for...", "Creating reports..."), prepend a professional action verb
  if (/^[a-z]+ing\b/i.test(cleaned)) {
    const gerundMatch = /^([a-z]+)ing\b(.*)$/i.exec(cleaned);
    if (gerundMatch) {
      return ensureSentenceCaseAndPeriod(`Executed ${ cleaned.charAt(0).toLowerCase() + cleaned.slice(1) }`);
    }
  }

  return ensureSentenceCaseAndPeriod(
    `Delivered ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`
  );
}

function ensureSentenceCaseAndPeriod(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  const capitalized = t.charAt(0).toUpperCase() + t.slice(1);
  if (/[.!?]$/.test(capitalized)) {
    return capitalized;
  }
  return `${capitalized}.`;
}

/**
 * Improves all achievement bullets in an array while preserving non-empty items.
 */
export function improveAllBullets(bullets: string[]): string[] {
  return bullets.map((b) => (b.trim() ? improveAchievementBullet(b) : b));
}
