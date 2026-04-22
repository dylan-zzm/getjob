import { generateId } from 'ai';

import { respData, respErr } from '@/shared/lib/resp';
import {
  createResume,
  ResumeStatus,
  updateResumeById,
} from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { getResumeTemplateById } from '@/shared/resume/templates';
import {
  buildResumeTitle,
  extractStructuredResumeFromText,
  extractTextFromJobDescriptionFile,
  extractTextFromResumeFile,
  isSupportedJobDescriptionFile,
  isSupportedResumeFile,
  tailorStructuredResumeToJob,
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
    const resumeFile = formData.get('resumeFile');
    const jdFile = formData.get('jdFile');
    const templateId = String(formData.get('templateId') || '');
    const targetRole = String(formData.get('targetRole') || '').trim();
    const rawJobDescription = String(formData.get('jobDescription') || '').trim();

    if (!(resumeFile instanceof File)) {
      return respErr('resume file is required');
    }

    if (!isSupportedResumeFile(resumeFile.name, resumeFile.type)) {
      return respErr('only PDF and DOCX resumes are supported');
    }

    if (resumeFile.size > MAX_FILE_SIZE) {
      return respErr('resume file is too large');
    }

    if (targetRole.length < 2) {
      return respErr('target role is required');
    }

    let extractedJobDescription = '';
    if (jdFile instanceof File && jdFile.size > 0) {
      if (!isSupportedJobDescriptionFile(jdFile.name, jdFile.type)) {
        return respErr('only PDF, DOCX, TXT, and MD JD files are supported');
      }

      if (jdFile.size > MAX_FILE_SIZE) {
        return respErr('JD file is too large');
      }

      extractedJobDescription = await extractTextFromJobDescriptionFile({
        buffer: Buffer.from(await jdFile.arrayBuffer()),
        fileName: jdFile.name,
        mimeType: jdFile.type,
      });
    }

    const jobDescription = [rawJobDescription, extractedJobDescription]
      .filter(Boolean)
      .join('\n\n')
      .trim();

    if (jobDescription.length < 20) {
      return respErr('job description is required');
    }

    const template = getResumeTemplateById(templateId);
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const sourceText = await extractTextFromResumeFile({
      buffer: resumeBuffer,
      fileName: resumeFile.name,
      mimeType: resumeFile.type,
    });

    if (!sourceText) {
      return respErr('could not extract text from the resume file');
    }

    const structuredResume = await extractStructuredResumeFromText({
      sourceText,
      fileName: resumeFile.name,
      template,
    });

    const sourceFileUrl = await uploadResumeSourceFile({
      userId: user.id,
      buffer: resumeBuffer,
      fileName: resumeFile.name,
      mimeType: resumeFile.type,
    });

    const now = new Date();
    const createdResume = await createResume({
      id: generateId().toLowerCase(),
      userId: user.id,
      templateId: template.id,
      title: buildResumeTitle({
        resume: structuredResume,
        fileName: resumeFile.name,
      }),
      status: ResumeStatus.PARSED,
      sourceFileName: resumeFile.name,
      sourceMimeType: resumeFile.type || '',
      sourceFileUrl,
      sourceText,
      baseContent: JSON.stringify(structuredResume),
      tailoredContent: JSON.stringify(structuredResume),
      analysis: null,
      targetRole,
      jobDescription,
      createdAt: now,
      updatedAt: now,
    });

    try {
      const analysis = await tailorStructuredResumeToJob({
        resume: structuredResume,
        targetRole,
        jobDescription,
        template,
      });

      const updatedResume = await updateResumeById(createdResume.id, {
        status: ResumeStatus.TAILORED,
        targetRole,
        jobDescription,
        analysis: JSON.stringify(analysis),
        tailoredContent: JSON.stringify(analysis.rewrittenResume),
        updatedAt: new Date(),
      });

      return respData({
        id: updatedResume.id,
        title: updatedResume.title,
        status: updatedResume.status,
        targetRole,
        jobDescription,
        parsedOnly: false,
        analysis,
      });
    } catch (error: any) {
      console.error('resume intake tailor failed:', error);

      return Response.json({
        code: 0,
        message: 'resume parsed, but tailoring failed',
        data: {
          id: createdResume.id,
          title: createdResume.title,
          status: createdResume.status,
          targetRole,
          jobDescription,
          parsedOnly: true,
        },
      });
    }
  } catch (e: any) {
    console.error('resume intake failed:', e);
    return respErr(e.message || 'resume intake failed');
  }
}
