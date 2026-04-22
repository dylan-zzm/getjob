'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
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
import { Textarea } from '@/shared/components/ui/textarea';

export interface ResumeIntakeRecentItem {
  id: string;
  title: string;
  status: string;
  targetRole: string;
  sourceFileName: string;
  updatedAt: string;
}

export function ResumeIntakeClient({
  templateId,
  acceptedResumeFormats,
  acceptedJobDescriptionFormats,
  recentResumes,
}: {
  templateId: string;
  acceptedResumeFormats: string;
  acceptedJobDescriptionFormats: string;
  recentResumes: ResumeIntakeRecentItem[];
}) {
  const t = useTranslations('activity.intake');
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeFile) {
      toast.error(t('form.errors.resume_required'));
      return;
    }

    if (!targetRole.trim()) {
      toast.error(t('form.errors.role_required'));
      return;
    }

    if (!jobDescription.trim() && !jdFile) {
      toast.error(t('form.errors.jd_required'));
      return;
    }

    const formData = new FormData();
    formData.append('templateId', templateId);
    formData.append('resumeFile', resumeFile);
    formData.append('targetRole', targetRole.trim());
    formData.append('jobDescription', jobDescription.trim());
    if (jdFile) {
      formData.append('jdFile', jdFile);
    }

    startTransition(async () => {
      const resp = await fetch('/api/resume/intake', {
        method: 'POST',
        body: formData,
      });
      const payload = await resp.json();

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || t('form.error'));
        return;
      }

      const resumeId = payload.data?.id;
      if (!resumeId) {
        toast.error(t('form.error'));
        return;
      }

      if (payload.data?.parsedOnly) {
        toast.warning(t('form.partial_success'));
      } else {
        toast.success(t('form.success'));
      }

      router.push(`/activity/tailoring?resumeId=${resumeId}`);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="border-border/80">
        <CardHeader>
          <Badge className="w-fit rounded-full px-2.5 py-1">
            {t('form.badge')}
          </Badge>
          <CardTitle>{t('form.title')}</CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('form.resume_label')}
              </label>
              <Input
                accept={acceptedResumeFormats}
                type="file"
                onChange={(event) =>
                  setResumeFile(event.target.files?.[0] || null)
                }
              />
              <p className="text-muted-foreground text-xs leading-6">
                {t('form.resume_helper')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.role_label')}</label>
              <Input
                placeholder={t('form.role_placeholder')}
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.jd_label')}</label>
              <Textarea
                className="min-h-52"
                placeholder={t('form.jd_placeholder')}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
              <p className="text-muted-foreground text-xs leading-6">
                {t('form.jd_helper')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('form.jd_file_label')}
              </label>
              <Input
                accept={acceptedJobDescriptionFormats}
                type="file"
                onChange={(event) => setJdFile(event.target.files?.[0] || null)}
              />
              <p className="text-muted-foreground text-xs leading-6">
                {t('form.jd_file_helper')}
              </p>
            </div>

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? t('form.pending') : t('form.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t('workflow.title')}</CardTitle>
            <CardDescription>{t('workflow.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              t.raw('workflow.items') as { title: string; description: string }[]
            ).map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-border/80 p-5"
              >
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>{t('recent.title')}</CardTitle>
            <CardDescription>{t('recent.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResumes.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border/80 px-5 py-8 text-sm leading-7">
                {t('recent.empty')}
              </div>
            ) : (
              recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="rounded-[1.5rem] border border-border/80 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{resume.title}</h3>
                        <Badge variant="outline" className="rounded-full">
                          {t(`recent.status.${resume.status}`)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-6">
                        {[resume.targetRole, resume.sourceFileName]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {resume.updatedAt}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/activity/tailoring?resumeId=${resume.id}`}>
                        {t('recent.open')}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
