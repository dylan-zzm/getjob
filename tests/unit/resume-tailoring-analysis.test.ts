import { parseTailoredResumeAnalysis } from '@/shared/resume/schema';

import { sampleStructuredResume } from '../fixtures/resume.fixture';

describe('parseTailoredResumeAnalysis', () => {
  it('normalizes string-based changes and falls back to the source resume', () => {
    const analysis = parseTailoredResumeAnalysis(
      {
        matchScore: '59',
        summary: 'Needs stronger alignment.',
        fitHighlights: 'Strong education signal.',
        warnings: 'Quantified impact is not evidenced.',
        changes: 'Reworked summary and reordered experience.',
      },
      sampleStructuredResume
    );

    expect(analysis.matchScore).toBe(59);
    expect(analysis.fitHighlights).toEqual([
      {
        title: '',
        reason: 'Strong education signal.',
      },
    ]);
    expect(analysis.warnings).toEqual([
      'Quantified impact is not evidenced.',
    ]);
    expect(analysis.changes).toEqual([
      {
        section: 'General',
        before: '',
        after: '',
        reason: 'Reworked summary and reordered experience.',
      },
    ]);
    expect(analysis.rewrittenResume).toEqual(sampleStructuredResume);
  });

  it('parses JSON-string fields inside the analysis payload', () => {
    const analysis = parseTailoredResumeAnalysis(
      {
        match_score: 72,
        summary: 'Solid fit for product roles.',
        fit_highlights:
          '[{\"title\":\"Domain fit\",\"reason\":\"Relevant PM background.\"}]',
        warnings: '[]',
        changes:
          '[{\"section\":\"Summary\",\"before\":\"Old\",\"after\":\"New\",\"reason\":\"Align to JD\"}]',
        rewritten_resume: JSON.stringify(sampleStructuredResume),
      },
      sampleStructuredResume
    );

    expect(analysis.fitHighlights[0]).toEqual({
      title: 'Domain fit',
      reason: 'Relevant PM background.',
    });
    expect(analysis.changes[0]).toEqual({
      section: 'Summary',
      before: 'Old',
      after: 'New',
      reason: 'Align to JD',
    });
    expect(analysis.rewrittenResume).toEqual(sampleStructuredResume);
  });
});
