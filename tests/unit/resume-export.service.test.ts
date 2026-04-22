import { buildResumeTemplatePayload } from '@/shared/services/resume-export';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

describe('buildResumeTemplatePayload', () => {
  it('maps structured resume fields into template tokens', () => {
    const payload = buildResumeTemplatePayload(
      sampleStructuredResume,
      sampleTailoredResumeAnalysis
    );

    expect(payload.profile_name).toBe('小明');
    expect(payload.profile_headline).toBe('AI Product Manager');
    expect(payload.profile_contact).toContain('邮箱：xiaoming@example.com');
    expect(payload.profile_links).toContain(
      'Portfolio：https://example.com/portfolio'
    );
    expect(payload.education_1_header).toContain('成都大学-本科');
    expect(payload.fulltime_1_header).toContain('OpenResume');
    expect(payload.fulltime_1_bullet_1).toBe(
      'Built resume intake workflow from zero to one.'
    );
    expect(payload.intern_2_header).toContain('Tencent');
    expect(payload.venture_header).toContain('LaunchLab');
    expect(payload.skill_1).toContain('AI：LLM workflow design');
    expect(payload.strength_1).toContain('Structured thinking');
  });

  it('uses warnings as a fallback when no learning link is present', () => {
    const payload = buildResumeTemplatePayload(
      {
        ...sampleStructuredResume,
        basics: {
          ...sampleStructuredResume.basics,
          links: [
            {
              label: 'Portfolio',
              url: 'https://example.com/portfolio',
            },
          ],
        },
      },
      sampleTailoredResumeAnalysis
    );

    expect(payload.profile_learning).toBe(
      'Do not overstate quantified impact without source evidence.'
    );
  });
});
