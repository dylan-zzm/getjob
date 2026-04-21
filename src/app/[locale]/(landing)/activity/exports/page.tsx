import { getTranslations } from 'next-intl/server';

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

export default async function ExportsPage() {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.exports');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
        {(t.raw('formats.items') as { title: string; description: string; badge: string }[]).map(
          (item) => (
            <Card key={item.title}>
              <CardHeader>
                <Badge className="w-fit rounded-full px-2.5 py-1">
                  {item.badge}
                </Badge>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pipeline.title')}</CardTitle>
          <CardDescription>{t('pipeline.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          {(t.raw('pipeline.items') as { title: string; description: string }[]).map(
            (item, idx) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-border/80 p-5"
              >
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full text-sm font-semibold">
                  {idx + 1}
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('template.title')}</CardTitle>
          <CardDescription>{t('template.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('template.file')}</p>
            <p className="mt-2 font-semibold">{defaultResumeTemplate.fileName}</p>
          </div>
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('template.path')}</p>
            <p className="mt-2 font-semibold">{defaultResumeTemplate.filePath}</p>
          </div>
          <div className="rounded-[1.5rem] bg-muted/60 p-5">
            <p className="text-muted-foreground text-sm">{t('template.outputs')}</p>
            <p className="mt-2 font-semibold">
              {defaultResumeTemplate.outputFormats.join(' / ')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notes.title')}</CardTitle>
          <CardDescription>{t('notes.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(t.raw('notes.items') as string[]).map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-dashed border-border/80 px-4 py-3 text-sm leading-6"
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
