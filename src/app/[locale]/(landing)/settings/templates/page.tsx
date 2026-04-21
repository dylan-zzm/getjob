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
import { getUserInfo } from '@/shared/models/user';
import { defaultResumeTemplate } from '@/shared/resume/templates';

export default async function TemplatesPage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const locale = await getLocale();
  const t = await getTranslations('settings.templates');
  const template = defaultResumeTemplate;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit rounded-full px-2.5 py-1">
            {t('hero.badge')}
          </Badge>
          <CardTitle className="text-3xl">
            {locale === 'zh' ? template.nameZh : template.name}
          </CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-7">
            {locale === 'zh' ? template.descriptionZh : template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('hero.file')}</p>
            <p className="mt-2 font-semibold">{template.fileName}</p>
          </div>
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('hero.languages')}</p>
            <p className="mt-2 font-semibold">{template.languages.join(' / ')}</p>
          </div>
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('hero.outputs')}</p>
            <p className="mt-2 font-semibold">
              {template.outputFormats.join(' / ')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.title')}</CardTitle>
          <CardDescription>{t('sections.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {template.sections.map((section) => (
            <div
              key={section.id}
              className="rounded-[1.5rem] border border-border/80 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {locale === 'zh' ? section.titleZh : section.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {locale === 'zh' ? section.descriptionZh : section.description}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {(locale === 'zh' ? section.fieldsZh : section.fields).length}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notes.title')}</CardTitle>
          <CardDescription>{t('notes.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(locale === 'zh' ? template.notesZh : template.notes).map((note) => (
            <div
              key={note}
              className="rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6"
            >
              {note}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
