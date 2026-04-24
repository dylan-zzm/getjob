import { getLocale } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import {
  getResumes,
  parseResumeAnalysis,
  parseResumeContent,
} from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { ResumeEditorClient } from '@/shared/resume/components/resume-editor-client';
import { ResumeIntakeClient } from '@/shared/resume/components/resume-intake-client';
import {
  defaultResumeTemplate,
  getResumeTemplateById,
} from '@/shared/resume/templates';
import {
  getSupportedJobDescriptionAccept,
  getSupportedResumeAccept,
} from '@/shared/services/resume';

type ParsedResumeEntry = {
  analysis: ReturnType<typeof parseResumeAnalysis>;
  content: NonNullable<ReturnType<typeof parseResumeContent>>;
  record: Awaited<ReturnType<typeof getResumes>>[number];
};

export async function renderActivityWorkspace({
  requestedResumeId,
}: {
  requestedResumeId?: string;
}) {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const locale = await getLocale();
  const resumes = await getResumes({ userId: user.id });

  if (resumes.length === 0) {
    return (
      <ResumeIntakeClient
        acceptedJobDescriptionFormats={getSupportedJobDescriptionAccept()}
        acceptedResumeFormats={getSupportedResumeAccept()}
        recentResumes={[]}
        templateId={defaultResumeTemplate.id}
      />
    );
  }

  const parsedResumes = resumes
    .map((item) => ({
      analysis: parseResumeAnalysis(item.analysis),
      content:
        parseResumeContent(item.tailoredContent) ||
        parseResumeContent(item.baseContent),
      record: item,
    }))
    .filter((item): item is ParsedResumeEntry => item.content !== null);

  if (parsedResumes.length === 0) {
    return (
      <ResumeIntakeClient
        acceptedJobDescriptionFormats={getSupportedJobDescriptionAccept()}
        acceptedResumeFormats={getSupportedResumeAccept()}
        recentResumes={resumes.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          targetRole: item.targetRole,
          sourceFileName: item.sourceFileName,
          updatedAt: item.updatedAt.toLocaleString(
            locale === 'zh' ? 'zh-CN' : 'en-US'
          ),
        }))}
        templateId={defaultResumeTemplate.id}
      />
    );
  }

  const selectedResume =
    parsedResumes.find((item) => item.record.id === requestedResumeId) ||
    parsedResumes[0];
  const template =
    getResumeTemplateById(selectedResume.record.templateId) ||
    defaultResumeTemplate;

  return (
    <ResumeEditorClient
      acceptedJobDescriptionFormats={getSupportedJobDescriptionAccept()}
      acceptedResumeFormats={getSupportedResumeAccept()}
      initialAnalysis={selectedResume.analysis}
      initialContent={selectedResume.content}
      initialJobDescription={selectedResume.record.jobDescription}
      initialTargetRole={selectedResume.record.targetRole}
      initialTitle={selectedResume.record.title}
      locale={locale}
      resumeId={selectedResume.record.id}
      resumeOptions={parsedResumes.map((item) => ({
        id: item.record.id,
        targetRole: item.record.targetRole,
        title: item.record.title,
      }))}
      template={template}
      templateId={template.id}
    />
  );
}
