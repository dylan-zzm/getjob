import { generateId } from 'ai';

import { respData, respErr } from '@/shared/lib/resp';
import { createResume, ResumeStatus } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { getResumeTemplateById } from '@/shared/resume/templates';
import {
  buildResumeTitle,
  extractStructuredResumeFromText,
  extractTextFromResumeFile,
  isSupportedResumeFile,
  uploadResumeSourceFile,
} from '@/shared/services/resume';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const templateId = String(formData.get('templateId') || '');

    if (!(file instanceof File)) {
      return respErr('file is required');
    }

    if (!isSupportedResumeFile(file.name, file.type)) {
      return respErr('only PDF and DOCX resumes are supported');
    }

    if (file.size > MAX_FILE_SIZE) {
      return respErr('resume file is too large');
    }

    const template = getResumeTemplateById(templateId);
    const buffer = Buffer.from(await file.arrayBuffer());
    const sourceText = await extractTextFromResumeFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    if (!sourceText) {
      return respErr('could not extract text from the resume file');
    }

    const structuredResume = await extractStructuredResumeFromText({
      sourceText,
      fileName: file.name,
      template,
    });

    const sourceFileUrl = await uploadResumeSourceFile({
      userId: user.id,
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    const now = new Date();
    const newResume = await createResume({
      id: generateId().toLowerCase(),
      userId: user.id,
      templateId: template.id,
      title: buildResumeTitle({
        resume: structuredResume,
        fileName: file.name,
      }),
      status: ResumeStatus.PARSED,
      sourceFileName: file.name,
      sourceMimeType: file.type || '',
      sourceFileUrl,
      sourceText,
      baseContent: JSON.stringify(structuredResume),
      tailoredContent: JSON.stringify(structuredResume),
      analysis: null,
      targetRole: '',
      jobDescription: '',
      createdAt: now,
      updatedAt: now,
    });

    return respData({
      id: newResume.id,
      title: newResume.title,
      status: newResume.status,
      templateId: newResume.templateId,
      sourceFileName: newResume.sourceFileName,
      sourceFileUrl: newResume.sourceFileUrl,
      parsed: structuredResume,
    });
  } catch (e: any) {
    console.error('parse resume failed:', e);
    return respErr(e.message || 'parse resume failed');
  }
}
