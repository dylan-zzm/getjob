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
import { getResumes, parseResumeAnalysis, parseResumeContent } from '@/shared/models/resume';
import { getUserInfo } from '@/shared/models/user';
import { ResumeTailoringClient } from '@/shared/resume/components/resume-tailoring-client';

export default async function TailoringPage({
  searchParams,
}: {
  searchParams: Promise<{ resumeId?: string }>;
}) {
  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.tailoring');
  const params = await searchParams;
  const resumes = await getResumes({ userId: user.id });
  const engineItems = t.raw('engine.items') as { title: string; value: string }[];
  const rules = t.raw('rules.items') as { title: string; description: string }[];
  const steps = t.raw('workflow.items') as { title: string; description: string }[];
  const resumeItems = resumes.map((item) => {
    const base = parseResumeContent(item.baseContent);
    const analysis = parseResumeAnalysis(item.analysis);

    return {
      id: item.id,
      title: item.title,
      status: item.status,
      sourceFileName: item.sourceFileName,
      summary: base?.summary || '',
      targetRole: item.targetRole,
      jobDescription: item.jobDescription,
      basicsName: base?.basics.name || '',
      headline: base?.basics.headline || '',
      matchScore: analysis?.matchScore || 0,
      fitHighlights: analysis?.fitHighlights || [],
      changes: analysis?.changes || [],
      warnings: analysis?.warnings || [],
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <Badge className="w-fit rounded-full px-2.5 py-1">
              {t('hero.badge')}
            </Badge>
            <CardTitle className="text-3xl">{t('hero.title')}</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7">
              {t('hero.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-[1.5rem] border border-border/80 p-5"
              >
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full text-sm font-semibold">
                  {idx + 1}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {step.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('engine.title')}</CardTitle>
            <CardDescription>{t('engine.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {engineItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm"
              >
                <span>{item.title}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('rules.title')}</CardTitle>
          <CardDescription>{t('rules.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-[1.5rem] border border-border/80 p-5"
            >
              <h3 className="font-semibold">{rule.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {rule.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('deliverables.title')}</CardTitle>
          <CardDescription>{t('deliverables.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {(t.raw('deliverables.items') as { title: string; description: string }[]).map(
            (item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] bg-secondary/60 p-5"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <ResumeTailoringClient
        initialResumeId={params.resumeId}
        initialResumes={resumeItems}
      />
    </div>
  );
}
