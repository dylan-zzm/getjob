// @vitest-environment jsdom

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResumeEditorClient } from '@/shared/resume/components/resume-editor-client';
import { getResumeTemplateById } from '@/shared/resume/templates';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const translationMap: Record<string, string> = {
  'activity.resumes.editor.page_title': 'Resume Workbench',
  'activity.resumes.editor.saving': 'Saving...',
  'activity.resumes.editor.success': 'Resume updated',
  'activity.resumes.editor.error': 'Failed to save',
  'activity.resumes.editor.actions.save': 'SAVE BASIC INFO',
  'activity.resumes.editor.actions.tailor': 'AI TAILOR',
  'activity.resumes.editor.actions.docx': 'DOWNLOAD WORD',
  'activity.resumes.editor.actions.pdf': 'DOWNLOAD PDF',
  'activity.resumes.editor.tabs.contact': 'CONTACT',
  'activity.resumes.editor.tabs.experience': 'EXPERIENCE',
  'activity.resumes.editor.tabs.education': 'EDUCATION',
  'activity.resumes.editor.tabs.involvement': 'INVOLVEMENT',
  'activity.resumes.editor.tabs.skills': 'SKILLS',
  'activity.resumes.editor.tabs.summary': 'SUMMARY',
  'activity.resumes.editor.tabs.preview': 'FINISH UP & PREVIEW',
  'activity.resumes.editor.tabs.cover_letter': 'AI COVER LETTER',
  'activity.resumes.editor.tailoring.role_label': 'JOB TITLE *',
  'activity.resumes.editor.tailoring.jd_label': 'JOB DESCRIPTION *',
  'activity.resumes.editor.tailoring.role_required': 'Role required',
  'activity.resumes.editor.tailoring.jd_required': 'JD required',
  'activity.resumes.editor.tailoring.pending': 'Tailoring...',
  'activity.resumes.editor.tailoring.success': 'Tailored',
  'activity.resumes.editor.tailoring.error': 'Tailoring failed',
  'activity.resumes.editor.tailoring.match_score': 'Match 88%',
  'activity.resumes.editor.tailoring.warnings': 'Warnings',
  'activity.resumes.editor.preview.sidebar_title': 'AI KEYWORD TARGETING',
  'activity.resumes.editor.preview.score_label': 'Needs improvement',
  'activity.resumes.editor.preview.score_cta': 'EXPLORE MY REZI SCORE',
  'activity.resumes.editor.preview.auto_adjust': 'AUTO-ADJUST',
  'activity.resumes.editor.preview.adjustments': 'ADJUSTMENTS',
  'activity.resumes.editor.preview.template': 'TEMPLATE',
  'activity.resumes.editor.preview.share': 'SHARE',
  'activity.resumes.editor.preview.save_job': 'SAVE JOB DESCRIPTION',
  'activity.resumes.editor.preview.save_document': 'SAVE DOCUMENT',
  'activity.resumes.editor.preview_settings.accent_color': 'ACCENT COLOR',
  'activity.resumes.editor.preview_settings.avatar': 'AVATAR',
  'activity.resumes.editor.preview_settings.decrease_font':
    'DECREASE FONT SIZE',
  'activity.resumes.editor.preview_settings.divider': 'DIVIDER',
  'activity.resumes.editor.preview_settings.font': 'FONT',
  'activity.resumes.editor.preview_settings.icons': 'ICONS',
  'activity.resumes.editor.preview_settings.increase_font':
    'INCREASE FONT SIZE',
  'activity.resumes.editor.preview_settings.indent': 'INDENT',
  'activity.resumes.editor.preview_settings.line_height': 'LINE HEIGHT',
  'activity.resumes.editor.preview_settings.page_size': 'PAGE SIZE',
  'activity.resumes.editor.preview_settings.paged_view': 'PAGED VIEW',
  'activity.resumes.editor.preview_settings.section_spacing': 'SECTION SPACING',
  'activity.resumes.editor.preview_settings.text_color': 'TEXT COLOR',
  'activity.resumes.editor.preview_settings.zoom': 'ZOOM',
  'activity.resumes.editor.document.add_section': 'ADD SECTION',
  'activity.resumes.editor.document.contact': 'CONTACT',
  'activity.resumes.editor.document.move_up': 'Move up',
  'activity.resumes.editor.document.move_down': 'Move down',
  'activity.resumes.editor.document.remove': 'Remove',
  'activity.resumes.editor.document.custom_section': 'CUSTOM SECTION',
  'activity.resumes.editor.document.custom_title_placeholder': 'Section title',
  'activity.resumes.editor.document.custom_content_placeholder':
    'Section content',
  'activity.resumes.editor.cover_letter.title': 'AI Cover Letter',
  'activity.resumes.editor.cover_letter.description':
    'Generate a cover letter from the current resume.',
  'activity.resumes.editor.workspace.upload_resume': 'UPLOAD RESUME',
  'activity.resumes.editor.workspace.upload_title': 'Upload a new resume',
  'activity.resumes.editor.workspace.upload_description':
    'Add another resume without leaving the workbench.',
  'activity.resumes.editor.workspace.resume_file': 'RESUME FILE',
  'activity.resumes.editor.workspace.resume_helper': 'Resume helper',
  'activity.resumes.editor.workspace.job_file': 'JOB DESCRIPTION FILE',
  'activity.resumes.editor.workspace.job_file_helper': 'Job file helper',
  'activity.resumes.editor.workspace.switcher_label': 'Saved resumes',
  'activity.resumes.editor.workspace.switcher_current': 'CURRENT',
  'activity.resumes.editor.workspace.switcher_open': 'OPEN',
  'activity.resumes.editor.workspace.switcher_create': 'Upload another resume',
  'activity.resumes.editor.workspace.submit_resume': 'PARSE AND OPEN',
  'activity.resumes.editor.fields.name': 'FULL NAME',
  'activity.resumes.editor.fields.email': 'EMAIL ADDRESS',
  'activity.resumes.editor.fields.phone': 'PHONE NUMBER',
  'activity.resumes.editor.fields.headline': 'PROFESSIONAL HEADLINE',
  'activity.resumes.editor.fields.location': 'CITY',
  'activity.resumes.editor.fields.availability': 'AVAILABILITY',
  'activity.resumes.editor.fields.summary': 'SUMMARY',
  'activity.resumes.editor.fields.primary_link':
    'PERSONAL WEBSITE OR RELEVANT LINK',
  'activity.resumes.editor.structured.add_education': 'ADD EDUCATION',
  'activity.resumes.editor.structured.add_experience': 'ADD EXPERIENCE',
  'activity.resumes.editor.structured.add_involvement': 'ADD INVOLVEMENT',
  'activity.resumes.editor.structured.add_skill': 'ADD SKILL',
  'activity.resumes.editor.structured.education_title': 'Education',
  'activity.resumes.editor.structured.experience_title': 'Experience',
  'activity.resumes.editor.structured.involvement_title': 'Involvement',
  'activity.resumes.editor.structured.remove_item': 'REMOVE ITEM',
  'activity.resumes.editor.structured.skills_title': 'Skills',
  'activity.resumes.editor.structured.summary_title': 'Summary',
  'activity.resumes.editor.structured.actions.save_contact': 'SAVE BASIC INFO',
  'activity.resumes.editor.structured.actions.save_education':
    'SAVE EDUCATION LIST',
  'activity.resumes.editor.structured.actions.save_experience':
    'SAVE EXPERIENCE LIST',
  'activity.resumes.editor.structured.actions.save_involvement':
    'SAVE INVOLVEMENT LIST',
  'activity.resumes.editor.structured.actions.save_skills': 'SAVE SKILL LIST',
  'activity.resumes.editor.structured.actions.save_summary': 'SAVE SUMMARY',
  'activity.resumes.editor.structured.fields.bullets': 'BULLET POINTS',
  'activity.resumes.editor.structured.fields.company': 'COMPANY',
  'activity.resumes.editor.structured.fields.degree': 'DEGREE',
  'activity.resumes.editor.structured.fields.end_date': 'END DATE',
  'activity.resumes.editor.structured.fields.honors': 'HONORS',
  'activity.resumes.editor.structured.fields.items': 'ITEMS',
  'activity.resumes.editor.structured.fields.location': 'LOCATION',
  'activity.resumes.editor.structured.fields.major': 'MAJOR',
  'activity.resumes.editor.structured.fields.ranking': 'RANKING',
  'activity.resumes.editor.structured.fields.responsibility_mix':
    'RESPONSIBILITY MIX',
  'activity.resumes.editor.structured.fields.role': 'ROLE',
  'activity.resumes.editor.structured.fields.school': 'SCHOOL',
  'activity.resumes.editor.structured.fields.skill_group': 'SKILL GROUP',
  'activity.resumes.editor.structured.fields.skill_summary': 'SKILL SUMMARY',
  'activity.resumes.editor.structured.fields.start_date': 'START DATE',
  'activity.resumes.editor.structured.fields.strength_description':
    'DESCRIPTION',
  'activity.resumes.editor.structured.fields.strength_title': 'TITLE',
  'activity.resumes.editor.structured.fields.team': 'TEAM',
  'activity.resumes.editor.sections.education': 'EDUCATION',
  'activity.resumes.editor.sections.experience': 'EXPERIENCE',
  'activity.resumes.editor.sections.involvement': 'INVOLVEMENT',
  'activity.resumes.editor.sections.skills': 'SKILLS',
  'activity.resumes.editor.sections.strengths': 'STRENGTHS',
};

vi.mock('next-intl', () => ({
  useTranslations:
    (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const value = translationMap[fullKey] ?? fullKey;

      if (!values) {
        return value;
      }

      return Object.entries(values).reduce((acc, [token, tokenValue]) => {
        return acc.replace(`{${token}}`, String(tokenValue));
      }, value);
    },
}));

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => routerMocks,
}));

vi.mock('sonner', () => ({
  toast: toastMocks,
}));

describe('ResumeEditorClient', () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    routerMocks.refresh.mockReset();
    toastMocks.error.mockReset();
    toastMocks.success.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the preview workspace by default', () => {
    render(
      <ResumeEditorClient
        initialAnalysis={sampleTailoredResumeAnalysis}
        initialContent={sampleStructuredResume}
        initialJobDescription="Need a product manager with AI workflow experience."
        initialTargetRole="AI Product Manager"
        initialTitle="Xiaoming Resume"
        locale="en"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt"
        acceptedResumeFormats=".pdf,.docx"
        resumeId="resume-1"
        resumeOptions={[
          { id: 'resume-1', title: 'Xiaoming Resume' },
          { id: 'resume-2', title: 'Growth Resume' },
        ]}
        templateId="xiaoming-classic"
        template={getResumeTemplateById('xiaoming-classic')}
      />
    );

    expect(screen.getByText('FINISH UP & PREVIEW')).toBeInTheDocument();
    expect(screen.getByText('AI COVER LETTER')).toBeInTheDocument();
    expect(screen.getByText('AUTO-ADJUST')).toBeInTheDocument();
    expect(screen.getByText('AI KEYWORD TARGETING')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'UPLOAD RESUME' })
    ).toBeInTheDocument();
    const preview = screen.getByTestId('resume-template-preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute('data-format', 'a4');
    expect(preview).toHaveClass('aspect-[210/297]');
    expect(preview).toHaveClass('max-w-[794px]');
    expect(screen.getByTestId('resume-preview-settings')).toBeInTheDocument();
    expect(screen.getByText('Merriweather')).toBeInTheDocument();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByTestId('resume-document-editor')).toBeInTheDocument();
  });

  it('applies preview settings controls to the A4 document', async () => {
    const user = userEvent.setup();

    renderResumeEditor();

    const preview = screen.getByTestId('resume-template-preview');
    expect(preview).toHaveStyle({ fontSize: '11pt' });

    await user.click(
      screen.getByRole('button', { name: 'INCREASE FONT SIZE' })
    );

    expect(preview).toHaveStyle({ fontSize: '12pt' });
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('saves document section order and custom sections from the preview editor', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            id: 'resume-1',
            status: 'parsed',
            title: 'Xiaoming Resume',
            content: sampleStructuredResume,
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

    render(
      <ResumeEditorClient
        initialAnalysis={sampleTailoredResumeAnalysis}
        initialContent={sampleStructuredResume}
        initialJobDescription="Need a product manager with AI workflow experience."
        initialTargetRole="AI Product Manager"
        initialTitle="Xiaoming Resume"
        locale="en"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt"
        acceptedResumeFormats=".pdf,.docx"
        resumeId="resume-1"
        resumeOptions={[
          { id: 'resume-1', title: 'Xiaoming Resume' },
          { id: 'resume-2', title: 'Growth Resume' },
        ]}
        templateId="xiaoming-classic"
        template={getResumeTemplateById('xiaoming-classic')}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Move down SUMMARY',
      })
    );
    await user.click(screen.getByRole('button', { name: 'ADD SECTION' }));
    await user.type(screen.getByPlaceholderText('Section title'), 'Projects');
    await user.type(
      screen.getByPlaceholderText('Section content'),
      'Built a JD-based resume tailoring prototype.'
    );
    await user.click(screen.getByRole('button', { name: 'SAVE DOCUMENT' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(body.content.sectionOrder.slice(0, 2)).toEqual([
      'experience',
      'summary',
    ]);
    expect(body.content.rawSections).toEqual([
      {
        title: 'Projects',
        content: 'Built a JD-based resume tailoring prototype.',
      },
    ]);
    expect(toastMocks.success).toHaveBeenCalledWith('Resume updated');
  });

  it('switches to the contact editor when a section tab is selected', async () => {
    const user = userEvent.setup();

    render(
      <ResumeEditorClient
        initialAnalysis={sampleTailoredResumeAnalysis}
        initialContent={sampleStructuredResume}
        initialJobDescription="Need a product manager with AI workflow experience."
        initialTargetRole="AI Product Manager"
        initialTitle="Xiaoming Resume"
        locale="en"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt"
        acceptedResumeFormats=".pdf,.docx"
        resumeId="resume-1"
        resumeOptions={[
          { id: 'resume-1', title: 'Xiaoming Resume' },
          { id: 'resume-2', title: 'Growth Resume' },
        ]}
        templateId="xiaoming-classic"
        template={getResumeTemplateById('xiaoming-classic')}
      />
    );

    await user.click(screen.getByRole('button', { name: 'CONTACT' }));

    expect(screen.getByLabelText('FULL NAME')).toBeInTheDocument();
    expect(screen.getByLabelText('EMAIL ADDRESS')).toBeInTheDocument();
    expect(
      screen.getByLabelText('PERSONAL WEBSITE OR RELEVANT LINK')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'SAVE BASIC INFO' })
    ).toBeInTheDocument();
  });

  it('edits extracted experience items as structured fields', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            id: 'resume-1',
            status: 'parsed',
            title: 'Xiaoming Resume',
            content: sampleStructuredResume,
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

    renderResumeEditor();

    await user.click(screen.getByRole('button', { name: 'EXPERIENCE' }));

    expect(screen.getByTestId('structured-section-editor')).toBeInTheDocument();
    expect(
      document.querySelector('#experience-editor')
    ).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('ROLE'));
    await user.type(screen.getByLabelText('ROLE'), 'JD Tailoring Product Lead');
    await user.clear(screen.getByLabelText('COMPANY'));
    await user.type(screen.getByLabelText('COMPANY'), 'ResumeTailor');
    await user.clear(screen.getByLabelText('BULLET POINTS'));
    await user.type(
      screen.getByLabelText('BULLET POINTS'),
      'Launched structured resume parsing.{enter}Improved JD match score.'
    );
    await user.click(
      screen.getByRole('button', { name: 'SAVE EXPERIENCE LIST' })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(body.content.experiences[0]).toMatchObject({
      company: 'ResumeTailor',
      role: 'JD Tailoring Product Lead',
      bullets: [
        'Launched structured resume parsing.',
        'Improved JD match score.',
      ],
    });
  });

  it('edits extracted education items as structured fields', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            id: 'resume-1',
            status: 'parsed',
            title: 'Xiaoming Resume',
            content: sampleStructuredResume,
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

    renderResumeEditor();

    await user.click(screen.getByRole('button', { name: 'EDUCATION' }));

    expect(screen.getByTestId('structured-section-editor')).toBeInTheDocument();
    expect(document.querySelector('#education-editor')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('DEGREE'));
    await user.type(screen.getByLabelText('DEGREE'), 'Master');
    await user.clear(screen.getByLabelText('SCHOOL'));
    await user.type(screen.getByLabelText('SCHOOL'), 'Resume University');
    await user.clear(screen.getByLabelText('MAJOR'));
    await user.type(
      screen.getByLabelText('MAJOR'),
      'Human Computer Interaction'
    );
    await user.click(
      screen.getByRole('button', { name: 'SAVE EDUCATION LIST' })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(body.content.education[0]).toMatchObject({
      degree: 'Master',
      school: 'Resume University',
      major: 'Human Computer Interaction',
    });
  });

  it('lets the user switch resumes from the workbench header', async () => {
    const user = userEvent.setup();

    render(
      <ResumeEditorClient
        initialAnalysis={sampleTailoredResumeAnalysis}
        initialContent={sampleStructuredResume}
        initialJobDescription="Need a product manager with AI workflow experience."
        initialTargetRole="AI Product Manager"
        initialTitle="Xiaoming Resume"
        locale="en"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt"
        acceptedResumeFormats=".pdf,.docx"
        resumeId="resume-1"
        resumeOptions={[
          { id: 'resume-1', title: 'Xiaoming Resume' },
          { id: 'resume-2', title: 'Growth Resume' },
        ]}
        templateId="xiaoming-classic"
        template={getResumeTemplateById('xiaoming-classic')}
      />
    );

    await user.click(screen.getByRole('button', { name: /XIAOMING RESUME/i }));
    await user.click(screen.getByRole('menuitem', { name: /Growth Resume/i }));

    expect(routerMocks.push).toHaveBeenCalledWith(
      '/activity?resumeId=resume-2'
    );
  });

  it('keeps section editors readable on the dark workspace surface', async () => {
    const user = userEvent.setup();

    render(
      <ResumeEditorClient
        initialAnalysis={sampleTailoredResumeAnalysis}
        initialContent={sampleStructuredResume}
        initialJobDescription="Need a product manager with AI workflow experience."
        initialTargetRole="AI Product Manager"
        initialTitle="Xiaoming Resume"
        locale="en"
        acceptedJobDescriptionFormats=".pdf,.docx,.txt"
        acceptedResumeFormats=".pdf,.docx"
        resumeId="resume-1"
        resumeOptions={[
          { id: 'resume-1', title: 'Xiaoming Resume' },
          { id: 'resume-2', title: 'Growth Resume' },
        ]}
        templateId="xiaoming-classic"
        template={getResumeTemplateById('xiaoming-classic')}
      />
    );

    await user.click(screen.getByRole('button', { name: 'EXPERIENCE' }));

    const editor = screen.getByLabelText('ROLE');
    expect(editor).toHaveClass('!text-white');
    expect(editor).toHaveClass('!bg-[#202b43]');
  });
});

function renderResumeEditor() {
  render(
    <ResumeEditorClient
      initialAnalysis={sampleTailoredResumeAnalysis}
      initialContent={sampleStructuredResume}
      initialJobDescription="Need a product manager with AI workflow experience."
      initialTargetRole="AI Product Manager"
      initialTitle="Xiaoming Resume"
      locale="en"
      acceptedJobDescriptionFormats=".pdf,.docx,.txt"
      acceptedResumeFormats=".pdf,.docx"
      resumeId="resume-1"
      resumeOptions={[
        { id: 'resume-1', title: 'Xiaoming Resume' },
        { id: 'resume-2', title: 'Growth Resume' },
      ]}
      templateId="xiaoming-classic"
      template={getResumeTemplateById('xiaoming-classic')}
    />
  );
}
