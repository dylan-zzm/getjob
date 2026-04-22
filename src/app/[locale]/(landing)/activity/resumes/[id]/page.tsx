import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import {
  findResumeById,
  parseResumeContent,
} from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { ResumeEditorClient } from '@/shared/resume/components/resume-editor-client';
import { getResumeTemplateById } from '@/shared/resume/templates';

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const { id } = await params;
  const resume = await findResumeById(id);
  if (!resume) {
    notFound();
  }

  if (resume.userId !== user.id) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.resumes.editor');
  const locale = await getLocale();
  const content = parseResumeContent(resume.baseContent);
  if (!content) {
    notFound();
  }

  const template = getResumeTemplateById(resume.templateId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t('page_title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-7">
          {t('page_description')}
        </p>
      </div>

      <ResumeEditorClient
        initialContent={content}
        initialTitle={resume.title}
        locale={locale}
        resumeId={resume.id}
        template={template}
      />
    </div>
  );
}
