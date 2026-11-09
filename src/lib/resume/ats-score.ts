import { ResumeData } from './types';
import { STRONG_ACTION_VERBS } from './writing-assistant';

export interface ATSCriterionResult {
  id: string;
  label: string;
  maxPoints: number;
  earnedPoints: number;
  passed: boolean;
  suggestion: string;
}

export interface ATSScoreReport {
  totalScore: number; // 0 to 100
  passedCount: number;
  totalCount: number;
  ratingLabel: 'Needs Work' | 'Good Progress' | 'Strong' | 'ATS Ready';
  criteria: ATSCriterionResult[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

function countWords(text: string): number {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function startsWithStrongVerb(bullet: string): boolean {
  const cleaned = (bullet || '').trim().replace(/^[-•*]\s*/, '');
  if (!cleaned) return false;
  const firstWord = cleaned
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  return STRONG_ACTION_VERBS.has(firstWord);
}

/**
 * Calculates the ATS Readiness Estimate out of 100 based on the 6 required criteria:
 * - Valid email and phone: 15
 * - Professional summary over 40 words: 15
 * - Five or more skills: 15
 * - Experience entries contain at least three bullets each: 20
 * - Achievement bullets begin with strong action verbs: 20
 * - Complete education information: 15
 */
export function calculateATSScore(resume: ResumeData): ATSScoreReport {
  const criteria: ATSCriterionResult[] = [];

  // 1. Valid email and phone (15 pts)
  const hasValidEmail = EMAIL_REGEX.test((resume.personal.email || '').trim());
  const hasValidPhone = PHONE_REGEX.test((resume.personal.phone || '').trim());
  const contactPassed = hasValidEmail && hasValidPhone;
  const contactPoints = contactPassed ? 15 : hasValidEmail || hasValidPhone ? 8 : 0;

  criteria.push({
    id: 'contact',
    label: 'Valid email & phone number',
    maxPoints: 15,
    earnedPoints: contactPoints,
    passed: contactPassed,
    suggestion: contactPassed
      ? 'Contact information is complete and properly formatted.'
      : !hasValidEmail && !hasValidPhone
        ? 'Add a valid email address and phone number in Personal Information.'
        : !hasValidEmail
          ? 'Enter a valid email address (e.g. name@example.com).'
          : 'Enter a valid phone number with country or area code.',
  });

  // 2. Professional summary over 40 words (15 pts)
  const summaryWordCount = countWords(resume.summary);
  const summaryPassed = summaryWordCount >= 40;
  const summaryPoints = summaryPassed
    ? 15
    : summaryWordCount >= 20
      ? 8
      : summaryWordCount > 0
        ? 4
        : 0;

  criteria.push({
    id: 'summary',
    label: 'Professional summary over 40 words',
    maxPoints: 15,
    earnedPoints: summaryPoints,
    passed: summaryPassed,
    suggestion: summaryPassed
      ? `Summary length is strong (${summaryWordCount} words).`
      : `Expand your summary to at least 40 words (currently ${summaryWordCount} ${summaryWordCount === 1 ? 'word' : 'words'}) or click "Write it for me".`,
  });

  // 3. Five or more skills (15 pts)
  const validSkills = resume.skills.map((s) => s.trim()).filter(Boolean);
  const skillsCount = validSkills.length;
  const skillsPassed = skillsCount >= 5;
  const skillsPoints = skillsPassed ? 15 : Math.min(12, skillsCount * 3);

  criteria.push({
    id: 'skills',
    label: 'Five or more relevant skills',
    maxPoints: 15,
    earnedPoints: skillsPoints,
    passed: skillsPassed,
    suggestion: skillsPassed
      ? `${skillsCount} core skills listed.`
      : `Add ${5 - skillsCount} more ${5 - skillsCount === 1 ? 'skill' : 'skills'} (or use Suggest Skills).`,
  });

  // 4. Experience entries contain at least three bullets each (20 pts)
  const meaningfulExperiences = resume.experience.filter(
    (exp) => exp.jobTitle.trim() || exp.company.trim() || exp.achievements.some((a) => a.trim())
  );
  const allExpHave3Bullets =
    meaningfulExperiences.length > 0 &&
    meaningfulExperiences.every(
      (exp) => exp.achievements.filter((a) => a.trim().length > 0).length >= 3
    );

  let expBulletsPoints = 0;
  if (allExpHave3Bullets) {
    expBulletsPoints = 20;
  } else if (meaningfulExperiences.length > 0) {
    const qualifyingCount = meaningfulExperiences.filter(
      (exp) => exp.achievements.filter((a) => a.trim().length > 0).length >= 3
    ).length;
    expBulletsPoints = Math.round((qualifyingCount / meaningfulExperiences.length) * 15);
  }

  criteria.push({
    id: 'experience-bullets',
    label: '3+ achievement bullets per role',
    maxPoints: 20,
    earnedPoints: expBulletsPoints,
    passed: allExpHave3Bullets,
    suggestion: allExpHave3Bullets
      ? 'All work experience entries include 3 or more achievement bullets.'
      : meaningfulExperiences.length === 0
        ? 'Add at least one work experience entry with 3+ achievement bullets.'
        : 'Include at least 3 achievement bullet points for each work experience role.',
  });

  // 5. Achievement bullets begin with strong action verbs (20 pts)
  const allNonEmptyBullets = meaningfulExperiences.flatMap((exp) =>
    exp.achievements.map((a) => a.trim()).filter(Boolean)
  );
  const strongBulletCount = allNonEmptyBullets.filter(startsWithStrongVerb).length;
  const actionVerbRatio =
    allNonEmptyBullets.length > 0 ? strongBulletCount / allNonEmptyBullets.length : 0;
  const verbsPassed = allNonEmptyBullets.length >= 3 && actionVerbRatio >= 0.8;
  const verbsPoints = verbsPassed
    ? 20
    : allNonEmptyBullets.length > 0
      ? Math.round(actionVerbRatio * 18)
      : 0;

  criteria.push({
    id: 'action-verbs',
    label: 'Bullets start with strong action verbs',
    maxPoints: 20,
    earnedPoints: verbsPoints,
    passed: verbsPassed,
    suggestion: verbsPassed
      ? `${strongBulletCount} of ${allNonEmptyBullets.length} bullets start with strong action verbs.`
      : allNonEmptyBullets.length === 0
        ? 'Add achievement bullets beginning with action verbs (e.g., Led, Engineered, Improved).'
        : 'Click "Improve Bullets" in Work Experience to strengthen weak opening verbs.',
  });

  // 6. Complete education information (15 pts)
  const meaningfulEducation = resume.education.filter(
    (edu) => edu.degree.trim() || edu.institution.trim()
  );
  const eduPassed =
    meaningfulEducation.length > 0 &&
    meaningfulEducation.every(
      (edu) =>
        edu.degree.trim().length > 0 &&
        edu.institution.trim().length > 0 &&
        (edu.startDate.trim().length > 0 || edu.endDate.trim().length > 0)
    );
  const eduPoints = eduPassed
    ? 15
    : meaningfulEducation.some((edu) => edu.degree.trim() && edu.institution.trim())
      ? 10
      : meaningfulEducation.length > 0
        ? 5
        : 0;

  criteria.push({
    id: 'education',
    label: 'Complete education information',
    maxPoints: 15,
    earnedPoints: eduPoints,
    passed: eduPassed,
    suggestion: eduPassed
      ? 'Education degree, institution, and dates are complete.'
      : 'Fill in degree, institution name, and graduation date in the Education section.',
  });

  const totalScore = Math.min(
    100,
    criteria.reduce((sum, item) => sum + item.earnedPoints, 0)
  );
  const passedCount = criteria.filter((c) => c.passed).length;

  let ratingLabel: ATSScoreReport['ratingLabel'] = 'Needs Work';
  if (totalScore >= 90) {
    ratingLabel = 'ATS Ready';
  } else if (totalScore >= 75) {
    ratingLabel = 'Strong';
  } else if (totalScore >= 50) {
    ratingLabel = 'Good Progress';
  }

  return {
    totalScore,
    passedCount,
    totalCount: criteria.length,
    ratingLabel,
    criteria,
  };
}
