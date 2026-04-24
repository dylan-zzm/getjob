// @vitest-environment jsdom

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResumeIntakeClient } from '@/shared/resume/components/resume-intake-client';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}));

const translationMap: Record<string, string> = {
  'form.errors.resume_required': 'Upload a resume file first',
  'form.errors.role_required': 'Target role is required',
  'form.errors.jd_required': 'Job description is required',
  'form.error': 'Request failed',
  'form.partial_success': 'Parsed only',
  'form.success': 'Resume parsed and tailored successfully',
  'form.badge': 'Badge',
  'form.title': 'Upload a resume and start tailoring',
  'form.description': 'Description',
  'form.resume_label': 'Resume file',
  'form.resume_helper': 'Resume helper',
  'form.role_label': 'Target role',
  'form.role_placeholder': 'Target role placeholder',
  'form.jd_label': 'Job description',
  'form.jd_placeholder': 'Paste the full job description',
  'form.jd_helper': 'JD helper',
  'form.jd_file_label': 'Job description file',
  'form.jd_file_helper': 'JD file helper',
  'form.pending': 'Submitting...',
  'form.submit': 'Parse and tailor',
  'workflow.title': 'Workflow',
  'workflow.description': 'Workflow description',
  'recent.title': 'Recent resume runs',
  'recent.description': 'Recent description',
  'recent.empty': 'No records yet.',
  'recent.open': 'Open',
  'recent.status.parsed': 'Parsed',
};

const rawTranslationMap: Record<string, unknown> = {
  'workflow.items': [
    {
      title: 'Parse',
      description: 'Parse the uploaded resume.',
    },
  ],
};

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = ((key: string) => translationMap[key] ?? key) as ((
      key: string
    ) => string) & { raw: (key: string) => unknown };
    t.raw = (key: string) => rawTranslationMap[key] ?? [];
    return t;
  },
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) =>
    React.createElement('a', { href, ...props }, children),
  useRouter: () => routerMocks,
}));

vi.mock('sonner', () => ({
  toast: toastMocks,
}));

describe('ResumeIntakeClient', () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    routerMocks.refresh.mockReset();
    toastMocks.error.mockReset();
    toastMocks.success.mockReset();
    toastMocks.warning.mockReset();
    vi.restoreAllMocks();
  });

  it('shows validation feedback before submitting when required inputs are missing', async () => {
    const user = userEvent.setup();

    render(
      <ResumeIntakeClient
        templateId="xiaoming-classic"
        acceptedResumeFormats=".pdf,.docx"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt,.md"
        recentResumes={[]}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Parse and tailor',
      })
    );

    expect(toastMocks.error).toHaveBeenCalledWith('Upload a resume file first');
  });

  it('submits the form and redirects to the resume workbench after success', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            id: 'resume-123',
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const { container } = render(
      <ResumeIntakeClient
        templateId="xiaoming-classic"
        acceptedResumeFormats=".pdf,.docx"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt,.md"
        recentResumes={[]}
      />
    );

    const fileInputs = container.querySelectorAll('input[type="file"]');
    const roleInput = screen.getByPlaceholderText('Target role placeholder');
    const jobDescriptionInput = screen.getByPlaceholderText(
      'Paste the full job description'
    );

    await user.upload(
      fileInputs[0] as HTMLInputElement,
      new File(['resume content'], 'resume.pdf', {
        type: 'application/pdf',
      })
    );
    await user.type(roleInput, 'AI Product Manager');
    await user.type(
      jobDescriptionInput,
      'Looking for an AI PM who can design resume workflows and export systems.'
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Parse and tailor',
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/resume/intake',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(toastMocks.success).toHaveBeenCalledWith(
      'Resume parsed and tailored successfully'
    );
    expect(routerMocks.push).toHaveBeenCalledWith('/activity?resumeId=resume-123');
    expect(routerMocks.refresh).toHaveBeenCalledTimes(1);
  });
});
