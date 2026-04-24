import {
  buildAttachmentContentDisposition,
  extractFilenameFromContentDisposition,
  sanitizeDownloadBasename,
} from '@/shared/lib/content-disposition';

describe('content disposition helpers', () => {
  it('builds a UTF-8 content disposition with an ASCII fallback', () => {
    const header = buildAttachmentContentDisposition('小明 产品经理.docx');

    expect(header).toContain('attachment;');
    expect(header).toContain('filename="resume-export.docx"');
    expect(header).toContain("filename*=UTF-8''");
    expect(extractFilenameFromContentDisposition(header)).toBe(
      '小明 产品经理.docx'
    );
  });

  it('sanitizes invalid basename characters for export files', () => {
    expect(sanitizeDownloadBasename('  小明/产品经理:?  ')).toBe('小明-产品经理');
    expect(sanitizeDownloadBasename('   ')).toBe('resume-export');
  });
});
