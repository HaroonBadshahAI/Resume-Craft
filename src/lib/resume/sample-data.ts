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

export interface StarterResumePreset {
  id: string;
  roleTitle: string;
  categoryLabel: string;
  description: string;
  recommendedTemplateName: string;
  data: ResumeData;
}

export const READY_TO_USE_STARTER_RESUMES: StarterResumePreset[] = [
  {
    id: 'starter-marketing',
    roleTitle: 'Senior Digital Marketing Manager',
    categoryLabel: 'Marketing & Growth',
    description:
      'Full-funnel performance marketing, SEO, attribution modeling, and regional team leadership.',
    recommendedTemplateName: 'Modern Professional',
    data: SAMPLE_RESUME_DATA,
  },
  {
    id: 'starter-software-engineer',
    roleTitle: 'Senior Full-Stack Software Engineer',
    categoryLabel: 'Engineering & Tech',
    description:
      'Distributed systems, TypeScript/React/Go architecture, cloud infrastructure, and open-source projects.',
    recommendedTemplateName: 'Tech Minimal (LaTeX)',
    data: {
      personal: {
        fullName: 'Omar Al-Farsi',
        jobTitle: 'Senior Full-Stack & Distributed Systems Engineer',
        email: 'omar.alfarsi@devmail.io',
        phone: '+1 (415) 890-3412',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/omar-alfarsi-dev',
        website: 'github.com/omar-alfarsi',
        photo: '',
      },
      summary:
        'Staff-track Full-Stack Engineer with over eight years of experience architecting low-latency distributed systems, multi-region cloud platforms, and high-throughput developer tools for global SaaS products. Proven track record of reducing cloud infrastructure costs by 38%, scaling APIs to 45,000+ requests per second, and mentoring high-performing engineering teams.',
      experience: [
        {
          id: 'exp-tech-1',
          jobTitle: 'Senior Software Engineer — Core Platform',
          company: 'Veloce Cloud Systems',
          location: 'San Francisco, CA',
          startDate: '2021-09',
          endDate: '',
          isCurrent: true,
          achievements: [
            'Architected an event-driven billing and telemetry pipeline in Go, Kafka, and PostgreSQL handling 3.8B daily events with 99.995% uptime.',
            'Led migration of monolithic React dashboard to micro-frontends with TypeScript and Next.js, cutting P95 page load times by 54%.',
            'Designed automated Kubernetes autoscaling policies on AWS EKS that reduced monthly compute spend by $42K (38%).',
          ],
        },
        {
          id: 'exp-tech-2',
          jobTitle: 'Software Engineer II',
          company: 'FinLedger Technologies',
          location: 'Seattle, WA',
          startDate: '2018-07',
          endDate: '2021-08',
          isCurrent: false,
          achievements: [
            'Built real-time fraud scoring microservices using Node.js, Redis Cluster, and gRPC with sub-18ms p99 latency.',
            'Implemented zero-downtime schema migration tooling and CI/CD pipelines across 24 production services.',
            'Mentored 6 junior engineers and established engineering-wide RFC and code review standards.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-tech-1',
          degree: 'M.S. in Computer Science (Distributed Systems)',
          institution: 'University of Washington',
          location: 'Seattle, WA',
          startDate: '2016-09',
          endDate: '2018-06',
          description: 'Graduate Research Assistant in Cloud Consensus Protocols. GPA: 3.92/4.0.',
        },
      ],
      skills: [
        'TypeScript',
        'Go (Golang)',
        'React & Next.js',
        'Node.js',
        'PostgreSQL',
        'Apache Kafka',
        'Kubernetes & Docker',
        'AWS & Terraform',
        'Redis',
        'GraphQL & gRPC',
      ],
      languages: [
        { id: 'lang-tech-1', name: 'English', proficiency: 'Fluent' },
        { id: 'lang-tech-2', name: 'Arabic', proficiency: 'Native' },
      ],
      projects: [
        {
          id: 'proj-tech-1',
          title: 'PulseTrace — Open-Source OpenTelemetry Visualizer',
          description:
            'Lightweight distributed trace flamegraph viewer with 2.4k+ GitHub stars and zero-config Docker deployment.',
          technologies: 'Rust, TypeScript, WebGL, OpenTelemetry',
          url: 'github.com/omar-alfarsi/pulsetrace',
        },
        {
          id: 'proj-tech-2',
          title: 'EdgeCache KV',
          description:
            'In-memory Raft-replicated key-value store supporting automatic shard rebalancing and Prometheus metrics.',
          technologies: 'Go, Raft, gRPC, Prometheus',
          url: 'github.com/omar-alfarsi/edgecache-kv',
        },
      ],
      certifications: [
        {
          id: 'cert-tech-1',
          name: 'AWS Certified Solutions Architect – Professional',
          issuer: 'Amazon Web Services',
          issueDate: '2024-02',
        },
        {
          id: 'cert-tech-2',
          name: 'Certified Kubernetes Application Developer (CKAD)',
          issuer: 'Cloud Native Computing Foundation',
          issueDate: '2023-05',
        },
      ],
      selectedTemplate: 'tech',
      accentColor: '#334155',
      photoSettings: {
        visible: false,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        shape: 'rounded',
      },
    },
  },
  {
    id: 'starter-finance-consultant',
    roleTitle: 'Management Consultant & Strategy Lead',
    categoryLabel: 'Finance & Consulting',
    description:
      'M&A due diligence, corporate turnarounds, operating model design, and board-level advisory.',
    recommendedTemplateName: 'Harvard Ivy',
    data: {
      personal: {
        fullName: 'Elena Rostova, CFA',
        jobTitle: 'Engagement Manager — Corporate Strategy & M&A',
        email: 'elena.rostova@strategy-advisory.com',
        phone: '+44 20 7946 0821',
        location: 'London, United Kingdom',
        linkedin: 'linkedin.com/in/elena-rostova-cfa',
        website: 'elenarostova.com',
        photo: '',
      },
      summary:
        'Strategy Engagement Manager and CFA Charterholder with over seven years of experience advising FTSE 100 and Fortune 500 executives on commercial due diligence, post-merger integration, and EBITDA margin expansion. Directed 18+ cross-border engagements representing $4.2B in transaction value across enterprise SaaS, fintech, and industrial sectors.',
      experience: [
        {
          id: 'exp-fin-1',
          jobTitle: 'Engagement Manager',
          company: 'Sterling & Vance Strategy Partners',
          location: 'London, UK',
          startDate: '2022-03',
          endDate: '',
          isCurrent: true,
          achievements: [
            'Spearheaded commercial due diligence for a $1.4B European B2B payments acquisition, validating $85M in run-rate revenue synergies.',
            'Designed a global pricing and packaging transformation for a £600M ARR enterprise software provider, lifting net dollar retention from 106% to 118%.',
            'Managed 4–6 consultants per workstream and presented weekly steering committee deliverables to C-suite and private equity sponsors.',
          ],
        },
        {
          id: 'exp-fin-2',
          jobTitle: 'Senior Strategy Associate',
          company: 'Kensington Capital Advisory',
          location: 'London, UK',
          startDate: '2019-01',
          endDate: '2022-02',
          isCurrent: false,
          achievements: [
            'Built dynamic 3-statement LBO and DCF valuation models for 12 mid-market buyout transactions ranging from £120M to £750M.',
            'Identified £34M in supply-chain and SG&A cost efficiencies during a 16-week operational turnaround for a pan-European logistics group.',
            'Delivered executive board presentations and market entry roadmaps for institutional investors across 5 European markets.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-fin-1',
          degree: 'MSc in Financial Economics (Distinction)',
          institution: 'London School of Economics and Political Science (LSE)',
          location: 'London, UK',
          startDate: '2017-09',
          endDate: '2018-07',
          description: 'Thesis on Cross-Border SaaS M&A Multiples & Capital Structure.',
        },
        {
          id: 'edu-fin-2',
          degree: 'BSc (Hons) in Economics & Mathematics',
          institution: 'University of Warwick',
          location: 'Coventry, UK',
          startDate: '2014-09',
          endDate: '2017-06',
          description: 'First Class Honours (Top 5% of graduating cohort).',
        },
      ],
      skills: [
        'Corporate Strategy',
        'M&A Due Diligence',
        'Financial Modeling (LBO / DCF)',
        'Post-Merger Integration',
        'Pricing & Monetization',
        'EBITDA Optimization',
        'Board Presentations',
        'Private Equity Advisory',
      ],
      languages: [
        { id: 'lang-fin-1', name: 'English', proficiency: 'Fluent' },
        { id: 'lang-fin-2', name: 'French', proficiency: 'Advanced' },
        { id: 'lang-fin-3', name: 'Russian', proficiency: 'Native' },
      ],
      projects: [
        {
          id: 'proj-fin-1',
          title: 'European Fintech Operating Benchmark Report 2025',
          description:
            'Co-authored flagship industry benchmark analyzing unit economics, CAC payback, and rule-of-40 performance across 85 European fintechs.',
          technologies: 'Capital IQ, Tableau, Python (Pandas)',
          url: 'elenarostova.com/fintech-benchmark',
        },
      ],
      certifications: [
        {
          id: 'cert-fin-1',
          name: 'Chartered Financial Analyst (CFA) Charterholder',
          issuer: 'CFA Institute',
          issueDate: '2022-09',
        },
      ],
      selectedTemplate: 'harvard',
      accentColor: '#9F1239',
      photoSettings: {
        visible: false,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        shape: 'square',
      },
    },
  },
  {
    id: 'starter-product-design',
    roleTitle: 'Principal Product & UX Director',
    categoryLabel: 'Design & Product',
    description:
      'Design systems, multi-platform UX strategy, AI-native workflows, and creative direction.',
    recommendedTemplateName: 'Swiss Editorial Grid',
    data: {
      personal: {
        fullName: 'Marcus Vance',
        jobTitle: 'Principal Product Designer & Design Systems Lead',
        email: 'marcus@vancedesign.studio',
        phone: '+1 (212) 645-9980',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/marcus-vance-ux',
        website: 'vancedesign.studio',
        photo: '',
      },
      summary:
        'Award-winning Principal Product Designer with over nine years of experience shaping category-defining B2B SaaS products, multi-brand design systems, and high-conversion consumer interfaces. Bridges Swiss editorial craft with quantitative product experimentation to elevate usability, accessibility standards, and sustainable product-led revenue growth.',
      experience: [
        {
          id: 'exp-ux-1',
          jobTitle: 'Principal Product Designer',
          company: 'Linearity Labs',
          location: 'New York, NY',
          startDate: '2022-05',
          endDate: '',
          isCurrent: true,
          achievements: [
            'Spearheaded the end-to-end redesign of the core collaborative canvas used by 1.4M monthly active designers and product managers.',
            'Architected "Prism", a multi-platform token-driven design system across Figma, React, and iOS that accelerated feature delivery by 40%.',
            'Partnered with Growth PMs on onboarding flow experiments that increased trial-to-paid conversion by 27% within two quarters.',
          ],
        },
        {
          id: 'exp-ux-2',
          jobTitle: 'Senior UX / UI Designer',
          company: 'Atelier Digital Studio',
          location: 'Brooklyn, NY',
          startDate: '2018-09',
          endDate: '2022-04',
          isCurrent: false,
          achievements: [
            'Directed product design and interactive prototyping for 14 flagship fintech, editorial, and e-commerce launches.',
            'Established mixed-methods user research practices combining moderated usability testing with Amplitude behavioral cohorts.',
            'Improved checkout completion rates by 22% across flagship retail client portfolios through iterative usability testing.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-ux-1',
          degree: 'B.F.A. in Communication Design & Human-Computer Interaction',
          institution: 'Parsons School of Design',
          location: 'New York, NY',
          startDate: '2014-09',
          endDate: '2018-05',
          description: "Dean's Merit Scholar. Senior Thesis in Generative Typography.",
        },
      ],
      skills: [
        'Product Strategy',
        'Design Systems (Tokens)',
        'Figma & Prototyping',
        'User Research & Testing',
        'Interaction Design',
        'WCAG Accessibility',
        'React & Tailwind CSS',
        'Design Leadership',
      ],
      languages: [
        { id: 'lang-ux-1', name: 'English', proficiency: 'Native' },
        { id: 'lang-ux-2', name: 'German', proficiency: 'Intermediate' },
      ],
      projects: [
        {
          id: 'proj-ux-1',
          title: 'Prism Open Design Tokens Specification',
          description:
            'Open-source W3C design token pipeline automating Figma-to-CSS variable synchronization for enterprise teams.',
          technologies: 'Figma API, Style Dictionary, TypeScript',
          url: 'vancedesign.studio/prism',
        },
        {
          id: 'proj-ux-2',
          title: 'Chronicle Editorial Reader App',
          description:
            'Minimalist long-form reading experience honored with a Webby Award Nomination for Best Visual Design.',
          technologies: 'SwiftUI, Variable Fonts, Motion Design',
          url: 'vancedesign.studio/chronicle',
        },
      ],
      certifications: [
        {
          id: 'cert-ux-1',
          name: 'NN/g UX Master Certification',
          issuer: 'Nielsen Norman Group',
          issueDate: '2023-11',
        },
      ],
      selectedTemplate: 'swiss',
      accentColor: '#4F46E5',
      photoSettings: {
        visible: true,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        shape: 'square',
      },
    },
  },
  {
    id: 'starter-operations-lead',
    roleTitle: 'Head of Operations & Sustainability',
    categoryLabel: 'Operations & Leadership',
    description:
      'Global supply chain resilience, ESG strategy, cross-functional OKRs, and Scandinavian operational excellence.',
    recommendedTemplateName: 'Nordic Split',
    data: {
      personal: {
        fullName: 'Freja Lindqvist',
        jobTitle: 'VP of Operations & Supply Chain Sustainability',
        email: 'freja.lindqvist@nordicops.se',
        phone: '+46 70 412 88 90',
        location: 'Stockholm, Sweden',
        linkedin: 'linkedin.com/in/freja-lindqvist',
        website: 'frejalindqvist.se',
        photo: '',
      },
      summary:
        'Operations executive with over nine years of experience scaling circular supply chains, omnichannel fulfillment networks, and net-zero operational roadmaps across Europe and North America. Skilled at uniting lean six-sigma rigor with sustainable vendor partnerships to expand gross margins while cutting Scope 3 emissions.',
      experience: [
        {
          id: 'exp-ops-1',
          jobTitle: 'VP of Global Operations',
          company: 'Aether Mobility AB',
          location: 'Stockholm, Sweden',
          startDate: '2021-11',
          endDate: '',
          isCurrent: true,
          achievements: [
            'Scaled European hardware assembly and 3PL fulfillment across 9 markets, improving on-time delivery from 84% to 98.4%.',
            'Negotiated tier-1 battery and aluminum supplier contracts, reducing unit BOM cost by 19% while certifying 100% renewable smelting.',
            'Implemented company-wide OKR cadence and ERP inventory forecasting across a 65-person operations organization.',
          ],
        },
        {
          id: 'exp-ops-2',
          jobTitle: 'Senior Operations & ESG Manager',
          company: 'Klara Home & Living',
          location: 'Copenhagen, Denmark',
          startDate: '2018-04',
          endDate: '2021-10',
          isCurrent: false,
          achievements: [
            'Reduced warehouse fulfillment lead times by 36% through automated WMS slotting and regional carrier diversification.',
            'Launched the company’s inaugural CSRD-aligned Sustainability Report and cut packaging plastics by 78%.',
            'Streamlined cross-border customs and freight auditing workflows to save €1.2M in annual logistics overhead.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-ops-1',
          degree: 'M.Sc. in Industrial Engineering & Management',
          institution: 'KTH Royal Institute of Technology',
          location: 'Stockholm, Sweden',
          startDate: '2013-09',
          endDate: '2018-06',
          description: 'Specialization in Sustainable Supply Chain Optimization.',
        },
      ],
      skills: [
        'Global Supply Chain',
        'S&OP & Demand Planning',
        'Lean Six Sigma',
        'ESG & CSRD Compliance',
        '3PL & Warehouse Ops',
        'Vendor Negotiations',
        'NetSuite & SAP ERP',
        'OKR Execution',
      ],
      languages: [
        { id: 'lang-ops-1', name: 'Swedish', proficiency: 'Native' },
        { id: 'lang-ops-2', name: 'English', proficiency: 'Fluent' },
        { id: 'lang-ops-3', name: 'Danish', proficiency: 'Advanced' },
        { id: 'lang-ops-4', name: 'German', proficiency: 'Intermediate' },
      ],
      projects: [
        {
          id: 'proj-ops-1',
          title: 'Nordic Circular Battery Reverse-Logistics Network',
          description:
            'Established a closed-loop battery refurbishment and recycling program recovering 94% of critical minerals across 5 Nordic countries.',
          technologies: 'SAP S/4HANA, Power BI, ISO 14001',
          url: 'frejalindqvist.se/circular-logistics',
        },
      ],
      certifications: [
        {
          id: 'cert-ops-1',
          name: 'Lean Six Sigma Black Belt (CSSBB)',
          issuer: 'ASQ',
          issueDate: '2023-04',
        },
        {
          id: 'cert-ops-2',
          name: 'APICS Certified Supply Chain Professional (CSCP)',
          issuer: 'ASCM',
          issueDate: '2021-08',
        },
      ],
      selectedTemplate: 'nordic',
      accentColor: '#059669',
      photoSettings: {
        visible: true,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        shape: 'circle',
      },
    },
  },
];
