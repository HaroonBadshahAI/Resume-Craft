import test from 'node:test';
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
import {
  formatMonthYear,
  formatDateRange,
  SAMPLE_RESUME_DATA,
  READY_TO_USE_STARTER_RESUMES,
} from './sample-data';
import { TEMPLATE_DEFINITIONS } from './types';
import {
  improveAchievementBullet,
  generateProfessionalSummary,
  getSuggestedSkills,
} from './writing-assistant';
import { calculateATSScore } from './ats-score';
import { normalizeResumeData } from './storage';
import { buildCandidateFilename } from './pdf-export';
import {
  normalizeSingleDate,
  normalizeDateRange,
} from './import/date-normalizer';
import { extractTextFromPdfBuffer } from './import/pdf-extractor';
import {
  parseMammothHtmlToLines,
  extractTextFromDocxBuffer,
} from './import/docx-extractor';
import { parseExtractedResume } from './import/resume-parser';
import {
  applyReplaceResume,
  applyMergeResume,
} from './import/resume-merger';

test('formatMonthYear and formatDateRange format YYYY-MM and year-only YYYY dates accurately', () => {
  assert.equal(formatMonthYear('2022-01'), 'Jan 2022');
  assert.equal(formatMonthYear('2025-03'), 'Mar 2025');
  assert.equal(formatMonthYear('2022'), '2022');
  assert.equal(formatMonthYear(''), '');
  assert.equal(
    formatDateRange('2022-01', '2025-03', false),
    'Jan 2022 – Mar 2025'
  );
  assert.equal(formatDateRange('2022-01', '', true), 'Jan 2022 – Present');
  assert.equal(formatDateRange('2022', '', true), '2022 – Present');
});

test('improveAchievementBullet transforms weak retail wording to professional action bullet', () => {
  const input = 'worked in a shop and helped customers';
  const output = improveAchievementBullet(input);
  assert.equal(
    output,
    'Assisted retail customers with product selection, inquiries, and purchasing decisions.'
  );
});

test('improveAchievementBullet preserves numerical metrics without inventing numbers', () => {
  const input = 'managed a team of 8 engineers and increased velocity by 25%';
  const output = improveAchievementBullet(input);
  assert.ok(output.includes('8 engineers'));
  assert.ok(output.includes('25%'));
  assert.ok(output.startsWith('Directed'));
});

test('getSuggestedSkills returns non-duplicate skills for supported job categories', () => {
  const { category, suggestions } = getSuggestedSkills(
    'Senior Digital Marketing Manager',
    ['SEO & SEM', 'Google Ads']
  );
  assert.equal(category, 'Digital Marketer');
  assert.ok(suggestions.length > 0);
  assert.ok(!suggestions.includes('SEO & SEM'));
  assert.ok(!suggestions.includes('Google Ads'));
});

test('generateProfessionalSummary uses candidate job title and skills', () => {
  const summary = generateProfessionalSummary(SAMPLE_RESUME_DATA);
  assert.ok(summary.includes('Senior Digital Marketing Manager'));
  assert.ok(summary.split(/\s+/).length >= 40);
});

test('calculateATSScore evaluates Ayesha Khan sample resume at 100/100', () => {
  const report = calculateATSScore(SAMPLE_RESUME_DATA);
  assert.equal(report.totalScore, 100);
  assert.equal(report.passedCount, 6);
  assert.equal(report.ratingLabel, 'ATS Ready');
});

test('normalizeResumeData safely handles corrupted or partial input', () => {
  const normalized = normalizeResumeData({
    personal: { fullName: 'Test User' },
    selectedTemplate: 'invalid_template',
    accentColor: '#000000',
  });
  assert.equal(normalized.personal.fullName, 'Test User');
  assert.equal(normalized.selectedTemplate, 'modern');
  assert.equal(normalized.accentColor, '#4F46E5');
});

test('buildCandidateFilename formats candidate name cleanly', () => {
  assert.equal(buildCandidateFilename('Ayesha Khan'), 'Ayesha_Khan_Resume.pdf');
  assert.equal(buildCandidateFilename(''), 'Candidate_Resume.pdf');
});

test('Date Normalizer converts month names, slashes, year-only, and Present ranges without inventing months or swapping dates', () => {
  assert.equal(normalizeSingleDate('Jan 2022').value, '2022-01');
  assert.equal(normalizeSingleDate('January 2022').value, '2022-01');
  assert.equal(normalizeSingleDate('06/2018').value, '2018-06');

  const yearOnly = normalizeSingleDate('2022');
  assert.equal(yearOnly.value, '2022');
  assert.equal(yearOnly.isYearOnly, true);

  const rangePresent = normalizeDateRange('2022 - Present');
  assert.equal(rangePresent.startDate, '2022');
  assert.equal(rangePresent.endDate, '');
  assert.equal(rangePresent.isCurrent, true);

  const ambiguous = normalizeSingleDate('03/04/2020');
  assert.equal(ambiguous.isAmbiguous, true);
  assert.ok(ambiguous.warning);

  // Never swaps start and end dates
  const reversed = normalizeDateRange('2023-05 - 2021-01');
  assert.equal(reversed.startDate, '2023-05');
  assert.equal(reversed.endDate, '2021-01');
  assert.equal(reversed.isInvalidRange, true);
});

test('Smart Resume Parser extracts 2 jobs, 2022 - Present current role, English & Arabic languages, education, and skills', () => {
  const sampleLines = [
    'Omar Al-Farsi',
    'Senior Full Stack Software Engineer',
    'omar.alfarsi@techmail.io | +971 52 987 6543 | Dubai, UAE',
    'linkedin.com/in/omar-alfarsi | omaralfarsi.dev',
    'Professional Summary',
    'Results-driven Senior Full Stack Software Engineer with 8 years of experience architecting scalable cloud applications, distributed microservices, and high-performance user interfaces.',
    'Work Experience',
    'Lead Software Engineer | CloudScale Technologies | Dubai, UAE | 2022 – Present',
    '• Architected multi-tenant Kubernetes microservices handling 12M daily requests.',
    '• Reduced API p95 latency by 38% through Redis caching and query optimization.',
    'Software Engineer | Horizon Digital Labs | Abu Dhabi, UAE | 06/2018 – 12/2021',
    '• Developed customer-facing React and TypeScript dashboards for 45 enterprise clients.',
    '• Automated CI/CD deployment pipelines using GitHub Actions and Docker.',
    'Education',
    'Bachelor of Science in Computer Science | American University of Sharjah | 2014-09 – 2018-05',
    'Graduated Magna Cum Laude.',
    'Technical Skills',
    'TypeScript, React, Node.js, PostgreSQL, Docker, Kubernetes, AWS, GraphQL',
    'Languages',
    'English (Fluent), Arabic (Native)',
    'Projects',
    'OpenTrace Telemetry SDK | TypeScript, OpenTelemetry',
    'Built a lightweight distributed tracing library for Node.js serverless workloads.',
    'Certifications',
    'AWS Certified Solutions Architect | Amazon Web Services | 2023-08',
  ];

  const parsed = parseExtractedResume({
    lines: sampleLines,
    rawText: sampleLines.join('\n'),
    fileName: 'Omar_AlFarsi_Resume.pdf',
    fileType: 'pdf',
    hasComplexLayout: false,
    hasTables: false,
    extractedLinks: [],
    photoNotice: 'Profile photo not imported. You can upload one manually.',
  });

  assert.equal(parsed.data.personal.fullName, 'Omar Al-Farsi');
  assert.equal(
    parsed.data.personal.jobTitle,
    'Senior Full Stack Software Engineer'
  );
  assert.equal(parsed.data.personal.email, 'omar.alfarsi@techmail.io');
  assert.equal(parsed.data.personal.phone, '+971 52 987 6543');
  assert.equal(parsed.data.personal.location, 'Dubai, UAE');
  assert.equal(parsed.data.personal.linkedin, 'linkedin.com/in/omar-alfarsi');
  assert.equal(parsed.data.personal.website, 'omaralfarsi.dev');

  // Two experience entries
  assert.equal(parsed.data.experience.length, 2);
  assert.equal(parsed.data.experience[0].jobTitle, 'Lead Software Engineer');
  assert.equal(parsed.data.experience[0].company, 'CloudScale Technologies');
  assert.equal(parsed.data.experience[0].startDate, '2022');
  assert.equal(parsed.data.experience[0].isCurrent, true);
  assert.equal(parsed.data.experience[0].achievements.length, 2);

  assert.equal(parsed.data.experience[1].jobTitle, 'Software Engineer');
  assert.equal(parsed.data.experience[1].company, 'Horizon Digital Labs');
  assert.equal(parsed.data.experience[1].startDate, '2018-06');
  assert.equal(parsed.data.experience[1].endDate, '2021-12');
  assert.equal(parsed.data.experience[1].isCurrent, false);

  // Education
  assert.equal(parsed.data.education.length, 1);
  assert.ok(parsed.data.education[0].degree.includes('Bachelor of Science'));
  assert.equal(
    parsed.data.education[0].institution,
    'American University of Sharjah'
  );

  // Skills
  assert.ok(parsed.data.skills.includes('TypeScript'));
  assert.ok(parsed.data.skills.includes('Kubernetes'));
  assert.equal(parsed.data.skills.length, 8);

  // Languages: English and Arabic
  assert.equal(parsed.data.languages.length, 2);
  assert.equal(parsed.data.languages[0].name, 'English');
  assert.equal(parsed.data.languages[0].proficiency, 'Fluent');
  assert.equal(parsed.data.languages[1].name, 'Arabic');
  assert.equal(parsed.data.languages[1].proficiency, 'Native');

  // Projects & Certifications
  assert.equal(parsed.data.projects.length, 1);
  assert.equal(parsed.data.certifications.length, 1);
  assert.equal(
    parsed.diagnostics.photoNotice,
    'Profile photo not imported. You can upload one manually.'
  );
});

test('PDF Extractor reads text-based PDF and rejects scanned/image-only PDF without fabricating data', async () => {
  // 1. Text-based PDF generated via jsPDF
  const textPdf = new jsPDF();
  textPdf.setFontSize(16);
  textPdf.text('Sara Al-Mansoor', 20, 20);
  textPdf.setFontSize(12);
  textPdf.text('Product Designer | sara@designstudio.ae | +971 55 111 2233', 20, 30);
  textPdf.text('Experience', 20, 45);
  textPdf.text('Senior Product Designer | Studio X | 2022 - Present', 20, 55);
  textPdf.text('- Designed design system components across web and mobile.', 20, 65);
  const textBuffer = textPdf.output('arraybuffer');

  const extractedTextPdf = await extractTextFromPdfBuffer(
    textBuffer,
    'Sara_Resume.pdf'
  );
  assert.equal(extractedTextPdf.success, true);
  assert.ok(extractedTextPdf.rawText.includes('Sara Al-Mansoor'));
  assert.ok(extractedTextPdf.rawText.includes('Senior Product Designer'));

  // 2. Image-only / Scanned PDF (contains a 1x1 PNG image and zero text)
  const scannedPdf = new jsPDF();
  const onePixelPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  scannedPdf.addImage(onePixelPng, 'PNG', 10, 10, 50, 50);
  const scannedBuffer = scannedPdf.output('arraybuffer');

  const extractedScanned = await extractTextFromPdfBuffer(
    scannedBuffer,
    'Scanned_Resume.pdf'
  );
  assert.equal(extractedScanned.success, false);
  assert.equal(extractedScanned.errorCode, 'SCANNED_IMAGE_ONLY');
  assert.ok(
    extractedScanned.errorMessage?.includes('scanned or image-only document')
  );
});

test('DOCX HTML parser and legacy .doc detector work accurately', async () => {
  const sampleHtml = `
    <h1>Nadia Hassan</h1>
    <p>Data Analyst | nadia.hassan@analytics.org | +44 7700 900123 | London, UK</p>
    <h2>Work Experience</h2>
    <p>Senior Data Analyst | FinMetrics Ltd | Jan 2022 - Present</p>
    <ul>
      <li>Built executive KPI dashboards in SQL and Looker.</li>
      <li>Automated weekly cohort retention pipelines.</li>
    </ul>
    <h2>Languages</h2>
    <p>English (Fluent), Arabic (Intermediate)</p>
  `;
  const htmlParsed = parseMammothHtmlToLines(sampleHtml);
  const resumeParsed = parseExtractedResume({
    lines: htmlParsed.lines,
    rawText: htmlParsed.lines.join('\n'),
    fileName: 'Nadia_Resume.docx',
    fileType: 'docx',
    hasComplexLayout: false,
    hasTables: htmlParsed.hasTables,
    extractedLinks: htmlParsed.extractedLinks,
    photoNotice: 'Profile photo not imported. You can upload one manually.',
  });

  assert.equal(resumeParsed.data.personal.fullName, 'Nadia Hassan');
  assert.equal(resumeParsed.data.experience.length, 1);
  assert.equal(resumeParsed.data.experience[0].isCurrent, true);
  assert.equal(resumeParsed.data.languages.length, 2);

  // Legacy OLE2 .doc binary header rejection
  const legacyDocBytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  const docRes = await extractTextFromDocxBuffer(
    legacyDocBytes.buffer,
    'legacy.doc'
  );
  assert.equal(docRes.success, false);
  assert.equal(docRes.errorCode, 'UNSUPPORTED_FORMAT');
});

test('Resume Merger preserves existing non-empty fields on merge and avoids duplicates', () => {
  const imported = structuredClone(SAMPLE_RESUME_DATA);
  imported.personal.fullName = 'Imported Candidate Name';
  imported.personal.website = 'new-imported-portfolio.io';
  imported.skills = ['Digital Marketing', 'SEO', 'Python', 'SQL'];
  imported.languages = [
    { id: 'l1', name: 'English', proficiency: 'Fluent' },
    { id: 'l2', name: 'French', proficiency: 'Intermediate' },
  ];

  const current = structuredClone(SAMPLE_RESUME_DATA);
  current.personal.website = ''; // empty in current -> should be filled from imported
  current.selectedTemplate = 'executive';
  current.accentColor = '#059669';

  const merged = applyMergeResume(current, imported, {
    overwritePersonal: false,
  });

  // Non-empty fullName in current ("Ayesha Khan") is preserved
  assert.equal(merged.personal.fullName, 'Ayesha Khan');
  // Empty website in current is populated from imported
  assert.equal(merged.personal.website, 'new-imported-portfolio.io');
  // Template & accent preserved
  assert.equal(merged.selectedTemplate, 'executive');
  assert.equal(merged.accentColor, '#059669');
  // Duplicate skills avoided, new skills added
  assert.ok(merged.skills.includes('Python'));
  assert.ok(merged.skills.includes('SQL'));
  assert.equal(
    merged.skills.filter((s) => s.toLowerCase() === 'seo').length,
    1
  );
  // Duplicate experience avoided
  assert.equal(merged.experience.length, 2);
  // French language added, English not duplicated
  assert.equal(merged.languages.length, 4);

  // Replace mode replaces fullName while keeping selectedTemplate
  const replaced = applyReplaceResume(current, imported);
  assert.equal(replaced.personal.fullName, 'Imported Candidate Name');
  assert.equal(replaced.selectedTemplate, 'executive');
});

test('All 10 professional, modern, and creative templates and 5 ready-to-use starters normalize and score 100% ATS readiness', () => {
  assert.equal(TEMPLATE_DEFINITIONS.length, 10);
  const categories = new Set(TEMPLATE_DEFINITIONS.map((t) => t.category));
  assert.deepEqual(
    Array.from(categories).sort(),
    ['creative', 'modern', 'professional']
  );

  for (const tpl of TEMPLATE_DEFINITIONS) {
    const normalized = normalizeResumeData({
      ...SAMPLE_RESUME_DATA,
      selectedTemplate: tpl.id,
    });
    assert.equal(normalized.selectedTemplate, tpl.id);
  }

  assert.equal(READY_TO_USE_STARTER_RESUMES.length, 5);
  for (const preset of READY_TO_USE_STARTER_RESUMES) {
    const normalized = normalizeResumeData(preset.data);
    assert.equal(normalized.selectedTemplate, preset.data.selectedTemplate);
    const ats = calculateATSScore(normalized);
    assert.equal(ats.totalScore, 100);
  }
});
