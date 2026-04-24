import { GET } from '@/app/api/resume/export/route';
import { extractFilenameFromContentDisposition } from '@/shared/lib/content-disposition';

const mocks = vi.hoisted(() => ({
  findResumeById: vi.fn(),
  parseResumeAnalysis: vi.fn(),
  parseResumeContent: vi.fn(),
  getUserInfo: vi.fn(),
  getResumeTemplateById: vi.fn(),
  renderResumeDocx: vi.fn(),
  convertDocxBufferToPdf: vi.fn(),
}));

vi.mock('@/shared/models/user', () => ({
  getUserInfo: mocks.getUserInfo,
}));

vi.mock('@/shared/models/resume', () => ({
  findResumeById: mocks.findResumeById,
  parseResumeAnalysis: mocks.parseResumeAnalysis,
  parseResumeContent: mocks.parseResumeContent,
}));

vi.mock('@/shared/resume/templates', () => ({
  getResumeTemplateById: mocks.getResumeTemplateById,
}));

vi.mock('@/shared/services/resume-export', () => ({
  renderResumeDocx: mocks.renderResumeDocx,
  convertDocxBufferToPdf: mocks.convertDocxBufferToPdf,
}));

describe('GET /api/resume/export', () => {
  beforeEach(() => {
    mocks.findResumeById.mockReset();
    mocks.parseResumeAnalysis.mockReset();
    mocks.parseResumeContent.mockReset();
    mocks.getUserInfo.mockReset();
    mocks.getResumeTemplateById.mockReset();
    mocks.renderResumeDocx.mockReset();
    mocks.convertDocxBufferToPdf.mockReset();
  });

  it('returns a safe attachment header for Chinese DOCX filenames', async () => {
    mocks.getUserInfo.mockResolvedValue({ id: 'user-1' });
    mocks.findResumeById.mockResolvedValue({
      id: 'resume-1',
      userId: 'user-1',
      title: '小明 产品经理',
      templateId: 'xiaoming-classic',
      baseContent: '{}',
      tailoredContent: '{}',
      analysis: '{}',
    });
    mocks.getResumeTemplateById.mockReturnValue({
      id: 'xiaoming-classic',
      fileName: 'xiaoming-classic.docx',
    });
    mocks.parseResumeContent.mockReturnValue({ basics: { name: '小明' } });
    mocks.parseResumeAnalysis.mockReturnValue(null);
    mocks.renderResumeDocx.mockResolvedValue(Buffer.from('docx'));

    const response = await GET(
      new Request(
        'http://localhost/api/resume/export?resumeId=resume-1&format=docx'
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(
      extractFilenameFromContentDisposition(
        response.headers.get('Content-Disposition')
      )
    ).toBe('小明 产品经理.docx');
    expect(response.headers.get('Content-Disposition')).toContain(
      'filename="resume-export.docx"'
    );
  });
});
