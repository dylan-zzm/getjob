// @vitest-environment jsdom

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResumeHero } from '@/themes/default/blocks/resume-hero';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
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

const heroSection = {
  id: 'hero',
  title: 'Upload a resume and tailor it to the job',
  description: 'One screen for resume upload, JD input, and editable output.',
  form: {
    template_id: 'xiaoming-classic',
    resume_label: 'Resume file',
    resume_helper: 'PDF or DOCX',
    resume_accept:
      '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    role_label: 'Target role',
    role_placeholder: 'AI Product Manager',
    jd_label: 'Job description',
    jd_placeholder: 'Paste the full JD',
    submit: 'Start tailoring',
    pending: 'Working...',
    success: 'Resume ready',
    error: 'Upload failed',
    auth_error: 'Sign in to continue',
  },
  preview: {
    title: 'Live resume workspace',
    sections: ['Profile', 'Experience', 'Education', 'Skills'],
    score_label: 'Match score',
    score: '86%',
  },
};

describe('ResumeHero', () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    toastMocks.error.mockReset();
    toastMocks.success.mockReset();
    vi.restoreAllMocks();
  });

  it('submits the hero intake form and opens the created resume', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            id: 'resume-hero-1',
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

    const { container } = render(<ResumeHero section={heroSection} />);

    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      new File(['resume'], 'resume.pdf', {
        type: 'application/pdf',
      })
    );
    await user.type(screen.getByLabelText('Target role'), 'AI Product Manager');
    await user.type(
      screen.getByLabelText('Job description'),
      'Need a product manager who can build AI workflow products and ship data-heavy tools.'
    );
    await user.click(screen.getByRole('button', { name: 'Start tailoring' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = requestInit?.body as FormData;

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/resume/intake',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(body.get('templateId')).toBe('xiaoming-classic');
    expect(body.get('targetRole')).toBe('AI Product Manager');
    expect(body.get('jobDescription')).toContain('AI workflow products');
    expect(toastMocks.success).toHaveBeenCalledWith('Resume ready');
    expect(routerMocks.push).toHaveBeenCalledWith(
      '/activity?resumeId=resume-hero-1'
    );
  });

  it('prompts for a resume before calling the intake API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    render(<ResumeHero section={heroSection} />);

    await user.click(screen.getByRole('button', { name: 'Start tailoring' }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(toastMocks.error).toHaveBeenCalledWith('Resume file');
  });

  it('renders only the focused intake surface, without preview panels', () => {
    render(<ResumeHero section={heroSection} />);

    expect(screen.getByTestId('resume-hero-form')).toBeInTheDocument();
    expect(screen.queryByText('Match score')).not.toBeInTheDocument();
    expect(screen.queryByText('Live resume workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('Extract fields')).not.toBeInTheDocument();
  });
});
