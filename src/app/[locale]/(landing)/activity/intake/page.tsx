import { getLocale, getTranslations } from 'next-intl/server';

import { Empty } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { getResumes } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { ResumeIntakeClient } from '@/shared/resume/components/resume-intake-client';
import { defaultResumeTemplate } from '@/shared/resume/templates';
import {
  getSupportedJobDescriptionAccept,
  getSupportedResumeAccept,
} from '@/shared/services/resume';

export default async function IntakePage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const locale = await getLocale();
  const t = await getTranslations('activity.intake');
  const resumes = await getResumes({ userId: user.id, limit: 5 });
  const template = defaultResumeTemplate;

  const recentResumes = resumes.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    targetRole: item.targetRole,
    sourceFileName: item.sourceFileName,
    updatedAt: item.updatedAt.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US'),
  }));

  const templateName = locale === 'zh' ? template.nameZh : template.name;
  const templateDescription =
    locale === 'zh' ? template.descriptionZh : template.description;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80 pt-0">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <Badge className="w-fit rounded-full px-2.5 py-1">
              {t('hero.badge')}
            </Badge>
            <CardTitle className="text-3xl">{t('hero.title')}</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7">
              {t('hero.description')}
            </CardDescription>
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
              <span>{t('cards.template.output')}</span>
              <span className="font-medium">
                {template.outputFormats.join(' / ')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.resume.title')}</CardTitle>
            <CardDescription>{t('cards.resume.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(t.raw('cards.resume.items') as string[]).map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/80 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cards.jd.title')}</CardTitle>
            <CardDescription>{t('cards.jd.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(t.raw('cards.jd.items') as string[]).map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-dashed border-border/80 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ResumeIntakeClient
        acceptedJobDescriptionFormats={getSupportedJobDescriptionAccept()}
        acceptedResumeFormats={getSupportedResumeAccept()}
        recentResumes={recentResumes}
        templateId={template.id}
      />
    </div>
  );
}
