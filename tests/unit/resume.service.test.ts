import {
  buildResumeTitle,
  getSupportedJobDescriptionAccept,
  getSupportedResumeAccept,
  isSupportedJobDescriptionFile,
  isSupportedResumeFile,
} from '@/shared/services/resume';

import { sampleStructuredResume } from '../fixtures/resume.fixture';

describe('resume service helpers', () => {
  it('accepts supported resume files by extension and mime type', () => {
    expect(isSupportedResumeFile('resume.PDF')).toBe(true);
    expect(
      isSupportedResumeFile(
        'resume.unknown',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ).toBe(true);
    expect(isSupportedResumeFile('resume.txt', 'text/plain')).toBe(false);
  });

  it('accepts supported job description files and text mime types', () => {
    expect(isSupportedJobDescriptionFile('jd.md')).toBe(true);
    expect(isSupportedJobDescriptionFile('jd.txt', 'text/plain')).toBe(true);
    expect(isSupportedJobDescriptionFile('jd.csv', 'text/csv')).toBe(true);
    expect(isSupportedJobDescriptionFile('jd.zip')).toBe(false);
  });

  it('returns stable accept strings for upload controls', () => {
    expect(getSupportedResumeAccept()).toContain('.pdf');
    expect(getSupportedResumeAccept()).toContain('.docx');
    expect(getSupportedJobDescriptionAccept()).toContain('.txt');
    expect(getSupportedJobDescriptionAccept()).toContain('text/markdown');
  });

  it('builds resume titles from structured basics first', () => {
    expect(
      buildResumeTitle({
        resume: sampleStructuredResume,
        fileName: 'resume-source.docx',
      })
    ).toBe('小明 · AI Product Manager');
  });

  it('falls back to the source filename when structured basics are empty', () => {
    expect(
      buildResumeTitle({
        resume: {
          ...sampleStructuredResume,
          basics: {
            ...sampleStructuredResume.basics,
            name: '',
            headline: '',
          },
        },
        fileName: 'resume-source.docx',
      })
    ).toBe('resume-source');
  });
});
