import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMonthYear, formatDateRange, SAMPLE_RESUME_DATA } from './sample-data';
import {
  improveAchievementBullet,
  generateProfessionalSummary,
  getSuggestedSkills,
} from './writing-assistant';
import { calculateATSScore } from './ats-score';
import { normalizeResumeData } from './storage';
import { buildCandidateFilename } from './pdf-export';

test('formatMonthYear and formatDateRange format YYYY-MM dates accurately', () => {
  assert.equal(formatMonthYear('2022-01'), 'Jan 2022');
  assert.equal(formatMonthYear('2025-03'), 'Mar 2025');
  assert.equal(formatMonthYear(''), '');
  assert.equal(formatDateRange('2022-01', '2025-03', false), 'Jan 2022 – Mar 2025');
  assert.equal(formatDateRange('2022-01', '', true), 'Jan 2022 – Present');
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
  const { category, suggestions } = getSuggestedSkills('Senior Digital Marketing Manager', [
    'SEO & SEM',
    'Google Ads',
  ]);
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
