import { buildResumeTemplatePreviewModel } from '@/shared/resume/template-engine';
import { getResumeTemplateById } from '@/shared/resume/templates';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

describe('resume template engine', () => {
  it('builds the first template preview model in template order', () => {
    const template = getResumeTemplateById('xiaoming-classic');
    const preview = buildResumeTemplatePreviewModel({
      resume: sampleStructuredResume,
      analysis: sampleTailoredResumeAnalysis,
      template,
      locale: 'zh',
    });

    expect(preview.name).toBe('小明');
    expect(preview.headline).toBe('AI Product Manager');
    expect(preview.contactLine).toContain('邮箱：xiaoming@example.com');
    expect(preview.sections.map((section) => section.id)).toEqual([
      'summary',
      'education',
      'fulltime',
      'internships',
      'venture',
      'skills',
      'strengths',
    ]);
    expect(preview.sections[0]).toMatchObject({
      id: 'summary',
      title: '个人摘要',
    });
    expect(preview.sections[1]).toMatchObject({
      id: 'education',
      title: '教育背景',
    });
    expect(preview.sections[2]).toMatchObject({
      id: 'fulltime',
      title: '工作经历',
    });
  });

  it('reuses warning text in preview notes when a secondary learning link is missing', () => {
    const template = getResumeTemplateById('xiaoming-classic');
    const preview = buildResumeTemplatePreviewModel({
      resume: {
        ...sampleStructuredResume,
        basics: {
          ...sampleStructuredResume.basics,
          links: [sampleStructuredResume.basics.links[0]],
        },
      },
      analysis: sampleTailoredResumeAnalysis,
      template,
      locale: 'zh',
    });

    expect(preview.notes).toContain(
      'Do not overstate quantified impact without source evidence.'
    );
  });
});
