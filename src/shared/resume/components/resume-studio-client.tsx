'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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
import { useTranslations } from 'next-intl';

export interface ResumeStudioItem {
  id: string;
  title: string;
  status: string;
  sourceFileName: string;
  sourceFileUrl: string;
  basicsName: string;
  headline: string;
  targetRole: string;
  experienceCount: number;
  educationCount: number;
  matchScore: number;
  updatedAt: string;
}

export function ResumeStudioClient({
  initialResumes,
  templateId,
  acceptedFormats,
}: {
  initialResumes: ResumeStudioItem[];
  templateId: string;
  acceptedFormats: string;
}) {
  const t = useTranslations('activity.resumes');
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error(t('studio.no_file'));
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('templateId', templateId);

    startTransition(async () => {
      const resp = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });
      const payload = await resp.json();

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || t('studio.error'));
        return;
      }

      toast.success(t('studio.success'));
      setSelectedFile(null);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t('studio.upload_title')}</CardTitle>
          <CardDescription>{t('studio.upload_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('studio.file_label')}</label>
              <Input
                accept={acceptedFormats}
                type="file"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
              <p className="text-muted-foreground text-xs leading-6">
                {t('studio.helper')}
              </p>
            </div>
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? t('studio.pending') : t('studio.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{t('studio.library_title')}</CardTitle>
          <CardDescription>{t('studio.library_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialResumes.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/80 px-5 py-8 text-sm leading-7">
              {t('studio.empty')}
            </div>
          ) : (
            initialResumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-[1.5rem] border border-border/80 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{resume.title}</h3>
                      <Badge variant="outline" className="rounded-full">
                        {t(`studio.status.${resume.status}`)}
                      </Badge>
                      {resume.matchScore > 0 ? (
                        <Badge className="rounded-full">
                          {t('studio.match_score', {
                            score: Math.round(resume.matchScore),
                          })}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-sm leading-6">
                      {[resume.basicsName, resume.headline, resume.targetRole]
                        .filter(Boolean)
                        .join(' / ') || resume.sourceFileName}
                    </p>
                    <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-xs">
                      <span>
                        {t('studio.education_count', {
                          count: resume.educationCount,
                        })}
                      </span>
                      <span>
                        {t('studio.experience_count', {
                          count: resume.experienceCount,
                        })}
                      </span>
                      <span>{resume.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/activity/resumes/${resume.id}`}>
                        {t('studio.edit_resume')}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/activity/tailoring?resumeId=${resume.id}`}>
                        {t('studio.open_tailoring')}
                      </Link>
                    </Button>
                    {resume.sourceFileUrl ? (
                      <Button asChild size="sm" variant="ghost">
                        <a href={resume.sourceFileUrl} rel="noreferrer" target="_blank">
                          {t('studio.download_source')}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
