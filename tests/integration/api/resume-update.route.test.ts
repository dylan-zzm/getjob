import { POST } from '@/app/api/resume/update/route';

import { sampleStructuredResume } from '../../fixtures/resume.fixture';

const mocks = vi.hoisted(() => ({
  findResumeById: vi.fn(),
  getUserInfo: vi.fn(),
  updateResumeById: vi.fn(),
}));

vi.mock('@/shared/models/user', () => ({
  getUserInfo: mocks.getUserInfo,
}));

vi.mock('@/shared/models/resume', () => ({
  ResumeStatus: {
    PARSED: 'parsed',
  },
  findResumeById: mocks.findResumeById,
  updateResumeById: mocks.updateResumeById,
}));

describe('POST /api/resume/update', () => {
  beforeEach(() => {
    mocks.getUserInfo.mockReset();
    mocks.findResumeById.mockReset();
    mocks.updateResumeById.mockReset();
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getUserInfo.mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost/api/resume/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
    );

    expect(await response.json()).toEqual({
      code: -1,
      message: 'no auth, please sign in',
    });
  });

  it('rejects requests for resumes owned by another user', async () => {
    mocks.getUserInfo.mockResolvedValue({ id: 'user-1' });
    mocks.findResumeById.mockResolvedValue({
      id: 'resume-1',
      userId: 'user-2',
    });

    const response = await POST(
      new Request('http://localhost/api/resume/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: 'resume-1',
          title: 'Tailored Resume',
          content: sampleStructuredResume,
          targetRole: 'AI Product Manager',
          jobDescription:
            'Need a product manager who can design resume workflows.',
        }),
      })
    );

    expect(await response.json()).toEqual({
      code: -1,
      message: 'no permission',
    });
    expect(mocks.updateResumeById).not.toHaveBeenCalled();
  });

  it('normalizes and persists a valid update payload', async () => {
    mocks.getUserInfo.mockResolvedValue({ id: 'user-1' });
    mocks.findResumeById.mockResolvedValue({
      id: 'resume-1',
      userId: 'user-1',
    });
    mocks.updateResumeById.mockResolvedValue({
      id: 'resume-1',
      status: 'parsed',
      title: 'Tailored Resume',
    });

    const response = await POST(
      new Request('http://localhost/api/resume/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: 'resume-1',
          title: 'Tailored Resume',
          targetRole: 'AI Product Manager',
          jobDescription:
            'Need a product manager who can design resume workflows.',
          content: sampleStructuredResume,
        }),
      })
    );

    const payload = await response.json();

    expect(mocks.updateResumeById).toHaveBeenCalledTimes(1);
    expect(mocks.updateResumeById).toHaveBeenCalledWith(
      'resume-1',
      expect.objectContaining({
        title: 'Tailored Resume',
        status: 'parsed',
        analysis: null,
        targetRole: 'AI Product Manager',
        jobDescription:
          'Need a product manager who can design resume workflows.',
        baseContent: JSON.stringify(sampleStructuredResume),
        tailoredContent: JSON.stringify(sampleStructuredResume),
        updatedAt: expect.any(Date),
      })
    );
    expect(payload).toEqual({
      code: 0,
      message: 'ok',
      data: {
        id: 'resume-1',
        status: 'parsed',
        title: 'Tailored Resume',
        content: sampleStructuredResume,
      },
    });
  });
});
