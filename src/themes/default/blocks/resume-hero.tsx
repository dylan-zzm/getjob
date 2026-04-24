'use client';

import { FormEvent, useState, useTransition } from 'react';
import { ArrowRight, Loader2, UploadCloud, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type HeroFormConfig = {
  template_id?: string;
  resume_label?: string;
  resume_helper?: string;
  resume_accept?: string;
  resume_required?: string;
  role_label?: string;
  role_placeholder?: string;
  role_required?: string;
  jd_label?: string;
  jd_placeholder?: string;
  jd_required?: string;
  submit?: string;
  pending?: string;
  success?: string;
  error?: string;
  auth_error?: string;
};

export function ResumeHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const form = (section.form || {}) as HeroFormConfig;
  const templateId = form.template_id || 'xiaoming-classic';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeFile) {
      toast.error(form.resume_required || form.resume_label || 'Resume file');
      return;
    }

    if (!targetRole.trim()) {
      toast.error(form.role_required || form.role_label || 'Target role');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error(form.jd_required || form.jd_label || 'Job description');
      return;
    }

    const formData = new FormData();
    formData.append('templateId', templateId);
    formData.append('resumeFile', resumeFile);
    formData.append('targetRole', targetRole.trim());
    formData.append('jobDescription', jobDescription.trim());

    startTransition(async () => {
      try {
        const resp = await fetch('/api/resume/intake', {
          method: 'POST',
          body: formData,
        });
        const payload = await resp.json();

        if (!resp.ok || payload.code !== 0) {
          const message = payload.message || form.error || 'Upload failed';
          toast.error(
            String(message).includes('no auth')
              ? form.auth_error || message
              : message
          );
          return;
        }

        const resumeId = payload.data?.id;
        if (!resumeId) {
          toast.error(form.error || 'Upload failed');
          return;
        }

        toast.success(form.success || 'Resume ready');
        router.push(`/activity?resumeId=${resumeId}`);
      } catch (error) {
        toast.error(form.error || 'Upload failed');
      }
    });
  };

  return (
    <section
      id={section.id}
      className={cn(
        'bg-background border-b py-12 md:py-18',
        section.className,
        className
      )}
    >
      <div className="container">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            {section.label ? (
              <p className="text-primary text-sm font-semibold tracking-[0.14em] uppercase">
                {section.label}
              </p>
            ) : null}
            <h1 className="text-4xl leading-tight font-semibold tracking-[-0.01em] text-balance md:text-6xl md:leading-[1.04]">
              {section.title}
            </h1>
            {section.description ? (
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-8">
                {section.description}
              </p>
            ) : null}
          </div>

          <form
            data-testid="resume-hero-form"
            className="border-border bg-card mx-auto rounded-2xl border p-4 shadow-sm md:p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="hero-resume">
                  {form.resume_label}
                </label>
                <label
                  className="border-border bg-background hover:border-primary/60 flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-5 text-center transition"
                  htmlFor="hero-resume"
                >
                  <UploadCloud className="text-primary size-5 shrink-0" />
                  <span className="min-w-0 truncate text-sm font-medium">
                    {resumeFile?.name || form.resume_helper}
                  </span>
                </label>
                <Input
                  id="hero-resume"
                  accept={form.resume_accept}
                  className="sr-only"
                  type="file"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[0.56fr_1fr]">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hero-role">
                    {form.role_label}
                  </label>
                  <Input
                    id="hero-role"
                    className="h-12"
                    placeholder={form.role_placeholder}
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="hero-jd">
                    {form.jd_label}
                  </label>
                  <Textarea
                    id="hero-jd"
                    className="min-h-28"
                    placeholder={form.jd_placeholder}
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 px-5 sm:min-w-40"
                  disabled={isPending}
                  size="lg"
                  type="submit"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <WandSparkles className="size-4" />
                  )}
                  {isPending ? form.pending : form.submit}
                </Button>
                {section.buttons?.[0] ? (
                  <Button
                    asChild
                    className="h-12 px-5"
                    size="lg"
                    variant="outline"
                  >
                    <Link
                      href={section.buttons[0].url || '/activity'}
                      target={section.buttons[0].target || '_self'}
                    >
                      {section.buttons[0].title}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
