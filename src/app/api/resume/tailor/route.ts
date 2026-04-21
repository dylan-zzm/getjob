import { z } from 'zod';

import { respData, respErr } from '@/shared/lib/resp';
import {
  findResumeById,
  parseResumeContent,
  ResumeStatus,
  updateResumeById,
} from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { getResumeTemplateById } from '@/shared/resume/templates';
import { tailorStructuredResumeToJob } from '@/shared/services/resume';

const tailorPayloadSchema = z.object({
  resumeId: z.string().min(1),
  targetRole: z.string().min(2),
  jobDescription: z.string().min(20),
});

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const payload = tailorPayloadSchema.safeParse(await req.json());
    if (!payload.success) {
      return respErr('invalid params');
    }

    const currentResume = await findResumeById(payload.data.resumeId);
    if (!currentResume) {
      return respErr('resume not found');
    }

    if (currentResume.userId !== user.id) {
      return respErr('no permission');
    }

    const baseResume = parseResumeContent(currentResume.baseContent);
    if (!baseResume) {
      return respErr('resume content is invalid');
    }

    const analysis = await tailorStructuredResumeToJob({
      resume: baseResume,
      targetRole: payload.data.targetRole,
      jobDescription: payload.data.jobDescription,
      template: getResumeTemplateById(currentResume.templateId),
    });

    const updatedResume = await updateResumeById(currentResume.id, {
      status: ResumeStatus.TAILORED,
      targetRole: payload.data.targetRole,
      jobDescription: payload.data.jobDescription,
      analysis: JSON.stringify(analysis),
      tailoredContent: JSON.stringify(analysis.rewrittenResume),
      updatedAt: new Date(),
    });

    return respData({
      id: updatedResume.id,
      status: updatedResume.status,
      targetRole: updatedResume.targetRole,
      analysis,
    });
  } catch (e: any) {
    console.error('tailor resume failed:', e);
    return respErr(e.message || 'tailor resume failed');
  }
}
