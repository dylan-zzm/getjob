import { respData, respErr } from '@/shared/lib/resp';
import { getResumes, parseResumeAnalysis, parseResumeContent } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';

export async function GET() {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const resumes = await getResumes({ userId: user.id });
    const result = resumes.map((item) => {
      const base = parseResumeContent(item.baseContent);
      const analysis = parseResumeAnalysis(item.analysis);

      return {
        id: item.id,
        title: item.title,
        templateId: item.templateId,
        status: item.status,
        sourceFileName: item.sourceFileName,
        sourceFileUrl: item.sourceFileUrl,
        targetRole: item.targetRole,
        updatedAt: item.updatedAt,
        basics: base?.basics || null,
        summary: base?.summary || '',
        experienceCount: base?.experiences.length || 0,
        educationCount: base?.education.length || 0,
        matchScore: analysis?.matchScore || 0,
      };
    });

    return respData(result);
  } catch (e: any) {
    return respErr(e.message || 'failed to load resumes');
  }
}
