import { z } from 'zod';

import { respData, respErr } from '@/shared/lib/resp';
import { findResumeById, ResumeStatus, updateResumeById } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { parseStructuredResume, structuredResumeSchema } from '@/shared/resume/schema';

const payloadSchema = z.object({
  resumeId: z.string().min(1),
  title: z.string().min(1),
  content: structuredResumeSchema,
  targetRole: z.string().optional().default(''),
  jobDescription: z.string().optional().default(''),
});

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const payload = payloadSchema.safeParse(await req.json());
    if (!payload.success) {
      return respErr('invalid params');
    }

    const record = await findResumeById(payload.data.resumeId);
    if (!record) {
      return respErr('resume not found');
    }

    if (record.userId !== user.id) {
      return respErr('no permission');
    }

    const normalized = parseStructuredResume(payload.data.content);
    const updated = await updateResumeById(record.id, {
      title: payload.data.title,
      status: ResumeStatus.PARSED,
      targetRole: payload.data.targetRole,
      jobDescription: payload.data.jobDescription,
      baseContent: JSON.stringify(normalized),
      tailoredContent: JSON.stringify(normalized),
      analysis: null,
      updatedAt: new Date(),
    });

    return respData({
      id: updated.id,
      status: updated.status,
      title: updated.title,
      content: normalized,
    });
  } catch (e: any) {
    console.error('update resume failed:', e);
    return respErr(e.message || 'update resume failed');
  }
}
