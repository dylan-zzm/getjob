import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/core/i18n/navigation';
import { Empty } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { getResumes, parseResumeAnalysis, parseResumeContent } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { ResumeStudioClient } from '@/shared/resume/components/resume-studio-client';
import { defaultResumeTemplate } from '@/shared/resume/templates';
import { getSupportedResumeAccept } from '@/shared/services/resume';

export default async function ResumesPage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const locale = await getLocale();
  const t = await getTranslations('activity.resumes');
  const template = defaultResumeTemplate;
  const resumes = await getResumes({ userId: user.id });

  const templateName = locale === 'zh' ? template.nameZh : template.name;
  const templateDescription =
    locale === 'zh' ? template.descriptionZh : template.description;
  const notes = locale === 'zh' ? template.notesZh : template.notes;
  const resumeItems = resumes.map((item) => {
    const base = parseResumeContent(item.baseContent);
    const analysis = parseResumeAnalysis(item.analysis);

    return {
      id: item.id,
      title: item.title,
      status: item.status,
      sourceFileName: item.sourceFileName,
      sourceFileUrl: item.sourceFileUrl,
      basicsName: base?.basics.name || '',
      headline: base?.basics.headline || '',
      targetRole: item.targetRole,
      experienceCount: base?.experiences.length || 0,
      educationCount: base?.education.length || 0,
      matchScore: analysis?.matchScore || 0,
      updatedAt: item.updatedAt.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US'),
    };
  });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80 pt-0">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit rounded-full px-2.5 py-1">
                {t('hero.badge')}
              </Badge>
              <CardTitle className="text-3xl">{t('hero.title')}</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7">
                {t('hero.description')}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/activity/intake">{t('hero.primary_button')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings/templates">{t('hero.secondary_button')}</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('cards.template.title')}</CardTitle>
            <CardDescription>{templateDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
              <span>{t('cards.template.name')}</span>
              <span className="font-medium">{templateName}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
              <span>{t('cards.template.file')}</span>
              <span className="font-medium">{template.fileName}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
              <span>{t('cards.template.outputs')}</span>
              <span className="font-medium">{template.outputFormats.join(' / ')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.intake.title')}</CardTitle>
            <CardDescription>{t('cards.intake.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(t.raw('cards.intake.items') as string[]).map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.guardrail.title')}</CardTitle>
            <CardDescription>{t('cards.guardrail.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(t.raw('cards.guardrail.items') as string[]).map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-dashed border-border/80 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.title')}</CardTitle>
          <CardDescription>{t('sections.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {template.sections.map((section) => {
            const title = locale === 'zh' ? section.titleZh : section.title;
            const description =
              locale === 'zh' ? section.descriptionZh : section.description;
            const fields = locale === 'zh' ? section.fieldsZh : section.fields;

            return (
              <div
                key={section.id}
                className="rounded-[1.5rem] border border-border/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {description}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {fields.length}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notes.title')}</CardTitle>
          <CardDescription>{t('notes.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.map((note) => (
            <div
              key={note}
              className="rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6"
            >
              {note}
            </div>
          ))}
        </CardContent>
      </Card>

      <ResumeStudioClient
        acceptedFormats={getSupportedResumeAccept()}
        initialResumes={resumeItems}
        templateId={template.id}
      />
    </div>
  );
}
