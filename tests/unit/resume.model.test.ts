import {
  parseResumeAnalysis,
  parseResumeContent,
} from '@/shared/models/resume';

import {
  sampleStructuredResume,
  sampleTailoredResumeAnalysis,
} from '../fixtures/resume.fixture';

describe('resume model parsing helpers', () => {
  it('parses structured resume JSON safely', () => {
    expect(parseResumeContent(JSON.stringify(sampleStructuredResume))).toEqual(
      sampleStructuredResume
    );
  });

  it('returns null for invalid structured resume JSON', () => {
    expect(parseResumeContent('{bad json')).toBeNull();
    expect(parseResumeContent(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });

  it('parses tailored analysis JSON safely', () => {
    expect(
      parseResumeAnalysis(JSON.stringify(sampleTailoredResumeAnalysis))
    ).toEqual(sampleTailoredResumeAnalysis);
  });

  it('returns null for invalid tailored analysis JSON', () => {
    expect(parseResumeAnalysis(undefined)).toBeNull();
    expect(parseResumeAnalysis(JSON.stringify({ matchScore: 999 }))).toBeNull();
  });
});
