// @vitest-environment jsdom

import * as React from 'react';
import ExportsPage from '@/app/[locale]/(landing)/activity/exports/page';
import IntakePage from '@/app/[locale]/(landing)/activity/intake/page';
import ActivityLayout from '@/app/[locale]/(landing)/activity/layout';
import ActivityPage from '@/app/[locale]/(landing)/activity/page';
import ResumeCanonicalPage from '@/app/[locale]/(landing)/activity/resumes/[id]/page';
import ResumesPage from '@/app/[locale]/(landing)/activity/resumes/page';
import TailoringPage from '@/app/[locale]/(landing)/activity/tailoring/page';
import { render, screen } from '@testing-library/react';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

const mocks = vi.hoisted(() => ({
  getUserInfo: vi.fn(),
  getResumes: vi.fn(),
  parseResumeContent: vi.fn(),
  parseResumeAnalysis: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/shared/models/user', () => ({
  getUserInfo: mocks.getUserInfo,
}));

vi.mock('@/shared/models/resume', () => ({
  getResumes: mocks.getResumes,
  parseResumeContent: mocks.parseResumeContent,
  parseResumeAnalysis: mocks.parseResumeAnalysis,
}));

vi.mock('@/core/i18n/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
  getTranslations: vi.fn().mockResolvedValue(
    Object.assign((key: string) => key, {
      raw: (key: string) => key,
    })
  ),
}));

vi.mock('@/shared/blocks/console/layout', () => ({
  ConsoleLayout: (props: { children: React.ReactNode; title?: string }) => (
    <section data-testid="console-layout">
      {props.title}
      {props.children}
    </section>
  ),
}));

vi.mock('@/shared/resume/templates', () => ({
  defaultResumeTemplate: {
    id: 'xiaoming-classic',
  },
  getResumeTemplateById: vi.fn().mockReturnValue({
    id: 'xiaoming-classic',
  }),
}));

vi.mock('@/shared/services/resume', () => ({
  getSupportedResumeAccept: vi.fn().mockReturnValue('.pdf,.docx'),
  getSupportedJobDescriptionAccept: vi
    .fn()
    .mockReturnValue('.pdf,.docx,.txt,.md'),
}));

vi.mock('@/shared/resume/components/resume-intake-client', () => ({
  ResumeIntakeClient: (props: { templateId: string }) => (
    <div data-testid="resume-intake">{props.templateId}</div>
  ),
}));

vi.mock('@/shared/resume/components/resume-editor-client', () => ({
  ResumeEditorClient: (props: {
    resumeId: string;
    resumeOptions: Array<{ id: string }>;
  }) => (
    <div data-testid="resume-editor">
      {props.resumeId}:{props.resumeOptions.length}
    </div>
  ),
}));

describe('Activity workspace routing', () => {
  beforeEach(() => {
    mocks.getUserInfo.mockReset();
    mocks.getResumes.mockReset();
    mocks.parseResumeContent.mockReset();
    mocks.parseResumeAnalysis.mockReset();
    mocks.redirect.mockReset();
    mocks.parseResumeContent.mockReturnValue(sampleStructuredResume);
    mocks.parseResumeAnalysis.mockReturnValue(sampleTailoredResumeAnalysis);
  });

  it('renders the workspace directly without the account console shell', async () => {
    render(
      await ActivityLayout({
        children: <div data-testid="activity-workspace">Workbench</div>,
      })
    );

    expect(screen.getByTestId('activity-workspace')).toBeInTheDocument();
    expect(screen.queryByTestId('console-layout')).not.toBeInTheDocument();
  });

  it('renders the integrated intake screen when no resumes exist', async () => {
    mocks.getUserInfo.mockResolvedValue({ id: 'user-1' });
    mocks.getResumes.mockResolvedValue([]);

    render(
      await ActivityPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId('resume-intake')).toHaveTextContent(
      'xiaoming-classic'
    );
  });

  it('renders the integrated workbench for the selected resume', async () => {
    mocks.getUserInfo.mockResolvedValue({ id: 'user-1' });
    mocks.getResumes.mockResolvedValue([
      {
        id: 'resume-1',
        title: 'Resume One',
        targetRole: 'AI Product Manager',
        jobDescription: 'JD 1',
        templateId: 'xiaoming-classic',
        tailoredContent: JSON.stringify(sampleStructuredResume),
        baseContent: JSON.stringify(sampleStructuredResume),
        analysis: JSON.stringify(sampleTailoredResumeAnalysis),
      },
      {
        id: 'resume-2',
        title: 'Resume Two',
        targetRole: 'Growth PM',
        jobDescription: 'JD 2',
        templateId: 'xiaoming-classic',
        tailoredContent: JSON.stringify(sampleStructuredResume),
        baseContent: JSON.stringify(sampleStructuredResume),
        analysis: JSON.stringify(sampleTailoredResumeAnalysis),
      },
    ]);

    render(
      await ActivityPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ resumeId: 'resume-2' }),
      })
    );

    expect(screen.getByTestId('resume-editor')).toHaveTextContent('resume-2:2');
  });

  it('redirects legacy activity pages back to the unified workspace', async () => {
    await IntakePage({
      params: Promise.resolve({ locale: 'en' }),
    });
    await ResumesPage({
      params: Promise.resolve({ locale: 'en' }),
    });
    await TailoringPage({
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({ resumeId: 'resume-2' }),
    });
    await ExportsPage({
      params: Promise.resolve({ locale: 'en' }),
    });
    await ResumeCanonicalPage({
      params: Promise.resolve({ locale: 'en', id: 'resume-9' }),
    });

    expect(mocks.redirect).toHaveBeenNthCalledWith(1, {
      href: '/activity',
      locale: 'en',
    });
    expect(mocks.redirect).toHaveBeenNthCalledWith(2, {
      href: '/activity',
      locale: 'en',
    });
    expect(mocks.redirect).toHaveBeenNthCalledWith(3, {
      href: '/activity?resumeId=resume-2',
      locale: 'en',
    });
    expect(mocks.redirect).toHaveBeenNthCalledWith(4, {
      href: '/activity',
      locale: 'en',
    });
    expect(mocks.redirect).toHaveBeenNthCalledWith(5, {
      href: '/activity?resumeId=resume-9',
      locale: 'en',
    });
  });
});
