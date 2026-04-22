// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import { ResumeTemplatePreview } from '@/shared/resume/components/resume-template-preview';
import { getResumeTemplateById } from '@/shared/resume/templates';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

describe('ResumeTemplatePreview', () => {
  it('renders the first template preview from structured resume content', () => {
    render(
      <ResumeTemplatePreview
        analysis={sampleTailoredResumeAnalysis}
        content={sampleStructuredResume}
        description="The exported Word file uses the same template snapshot."
        locale="zh"
        template={getResumeTemplateById('xiaoming-classic')}
        title="模板预览"
      />
    );

    expect(screen.getByTestId('resume-template-preview')).toBeInTheDocument();
    expect(screen.getByText('小明')).toBeInTheDocument();
    expect(screen.getByText('工作经历')).toBeInTheDocument();
    expect(
      screen.getByText('Built resume intake workflow from zero to one.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The exported Word file uses the same template snapshot.'
      )
    ).toBeInTheDocument();
  });
});
