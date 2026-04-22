import { basename } from 'node:path';

import {
  findResumeById,
  parseResumeAnalysis,
  parseResumeContent,
} from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { getResumeTemplateById } from '@/shared/resume/templates';
import {
  convertDocxBufferToPdf,
  renderResumeDocx,
} from '@/shared/services/resume-export';

export async function GET(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return errorResponse('no auth, please sign in', 401);
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');
    const format = searchParams.get('format') || 'docx';

    if (!resumeId) {
      return errorResponse('resumeId is required', 400);
    }

    if (!['docx', 'pdf'].includes(format)) {
      return errorResponse('invalid export format', 400);
    }

    const record = await findResumeById(resumeId);
    if (!record) {
      return errorResponse('resume not found', 404);
    }

    if (record.userId !== user.id) {
      return errorResponse('no permission', 403);
    }

    const template = getResumeTemplateById(record.templateId);
    const renderableResume =
      parseResumeContent(record.tailoredContent) ||
      parseResumeContent(record.baseContent);

    if (!renderableResume) {
      return errorResponse('resume content is invalid', 400);
    }

    const analysis = parseResumeAnalysis(record.analysis);
    const docxBuffer = await renderResumeDocx({
      resume: renderableResume,
      analysis,
      template,
    });

    const fileStem = sanitizeFilename(record.title || basename(template.fileName, '.docx'));

    if (format === 'pdf') {
      const pdfBuffer = await convertDocxBufferToPdf(docxBuffer, fileStem);
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileStem}.pdf"`,
        },
      });
    }

    return new Response(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileStem}.docx"`,
      },
    });
  } catch (e: any) {
    console.error('resume export failed:', e);
    return errorResponse(e.message || 'resume export failed', 500);
  }
}

function sanitizeFilename(value: string) {
  return value.replace(/[^\w\u4e00-\u9fa5.-]+/g, '-').replace(/-+/g, '-');
}

function errorResponse(message: string, status: number) {
  return Response.json(
    {
      code: -1,
      message,
    },
    { status }
  );
}
