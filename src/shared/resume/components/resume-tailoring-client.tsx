'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

export interface TailoringHighlight {
  title: string;
  reason: string;
}

export interface TailoringChange {
  section: string;
  before: string;
  after: string;
  reason: string;
}

export interface TailoringResumeItem {
  id: string;
  title: string;
  status: string;
  sourceFileName: string;
  summary: string;
  targetRole: string;
  jobDescription: string;
  basicsName: string;
  headline: string;
  matchScore: number;
  fitHighlights: TailoringHighlight[];
  changes: TailoringChange[];
  warnings: string[];
}

export function ResumeTailoringClient({
  initialResumes,
  initialResumeId,
}: {
  initialResumes: TailoringResumeItem[];
  initialResumeId?: string;
}) {
  const t = useTranslations('activity.tailoring');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedResumeId, setSelectedResumeId] = useState(
    initialResumeId || initialResumes[0]?.id || ''
  );
  const selectedResume = useMemo(
    () => initialResumes.find((item) => item.id === selectedResumeId) || null,
    [initialResumes, selectedResumeId]
  );
  const [targetRole, setTargetRole] = useState(selectedResume?.targetRole || '');
  const [jobDescription, setJobDescription] = useState(
    selectedResume?.jobDescription || ''
  );

  useEffect(() => {
    setTargetRole(selectedResume?.targetRole || '');
    setJobDescription(selectedResume?.jobDescription || '');
  }, [selectedResumeId, selectedResume]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedResumeId) {
      toast.error(t('composer.no_resume'));
      return;
    }

    startTransition(async () => {
      const resp = await fetch('/api/resume/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          targetRole,
          jobDescription,
        }),
      });
      const payload = await resp.json();

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || t('composer.error'));
        return;
      }

      toast.success(t('composer.success'));
      router.refresh();
    });
  };

  if (initialResumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('composer.empty_title')}</CardTitle>
          <CardDescription>{t('composer.empty_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/activity/resumes">{t('composer.empty_button')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t('composer.title')}</CardTitle>
          <CardDescription>{t('composer.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('composer.resume_label')}
              </label>
              <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('composer.resume_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {initialResumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('composer.role_label')}</label>
              <Input
                placeholder={t('composer.role_placeholder')}
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('composer.jd_label')}</label>
              <Textarea
                className="min-h-52"
                placeholder={t('composer.jd_placeholder')}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </div>

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? t('composer.pending') : t('composer.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/80">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{t('preview.title')}</CardTitle>
              {selectedResume?.matchScore ? (
                <Badge className="rounded-full">
                  {t('preview.score', {
                    score: Math.round(selectedResume.matchScore),
                  })}
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              {[selectedResume?.basicsName, selectedResume?.headline]
                .filter(Boolean)
                .join(' / ') || selectedResume?.sourceFileName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[1.5rem] bg-muted/60 p-5">
              <p className="text-sm font-medium">{t('preview.base_summary')}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-7">
                {selectedResume?.summary || t('preview.base_summary_empty')}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/80 p-5">
                <p className="text-sm font-medium">{t('preview.highlights')}</p>
                <div className="mt-3 space-y-3">
                  {selectedResume?.fitHighlights.length ? (
                    selectedResume.fitHighlights.map((item) => (
                      <div key={`${item.title}-${item.reason}`}>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                          {item.reason}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm leading-6">
                      {t('preview.highlights_empty')}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/80 p-5">
                <p className="text-sm font-medium">{t('preview.warnings')}</p>
                <div className="mt-3 space-y-3">
                  {selectedResume?.warnings.length ? (
                    selectedResume.warnings.map((item) => (
                      <p key={item} className="text-muted-foreground text-sm leading-6">
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm leading-6">
                      {t('preview.warnings_empty')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/80 p-5">
              <p className="text-sm font-medium">{t('preview.changes')}</p>
              <div className="mt-3 space-y-4">
                {selectedResume?.changes.length ? (
                  selectedResume.changes.map((item, index) => (
                    <div
                      key={`${item.section}-${index}`}
                      className="rounded-2xl bg-muted/60 p-4"
                    >
                      <p className="font-medium">
                        {item.section || t('preview.unnamed_change')}
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {item.reason}
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase">
                            {t('preview.before')}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm leading-6">
                            {item.before || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase">
                            {t('preview.after')}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm leading-6">
                            {item.after || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm leading-6">
                    {t('preview.changes_empty')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
