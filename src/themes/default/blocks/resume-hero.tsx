import { ArrowRight, CheckCircle2, FileText, ScanSearch, WandSparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ResumeHero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const highlightText = section.highlight_text ?? '';
  const titleParts = highlightText
    ? section.title?.split(highlightText, 2)
    : null;

  const chips = section.items ?? [];
  const templatePreview = section.template_preview ?? {};
  const jdPreview = section.jd_preview ?? {};
  const resultPreview = section.result_preview ?? {};

  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden py-20 md:py-28',
        section.className,
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(25,127,143,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(209,162,68,0.14),_transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(18,59,72,0.05),transparent)]" />

      <div className="container relative z-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          {section.announcement && (
            <Link
              href={section.announcement.url || ''}
              target={section.announcement.target || '_self'}
              className="bg-background/85 border-border/80 text-foreground inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm backdrop-blur"
            >
              <Badge className="rounded-full px-2.5 py-0.5">
                {section.announcement.badge || 'New'}
              </Badge>
              <span>{section.announcement.title}</span>
              <ArrowRight className="size-4" />
            </Link>
          )}

          <div className="mt-8 space-y-6">
            <h1 className="max-w-4xl text-4xl font-semibold text-balance md:text-6xl md:leading-[1.05]">
              {titleParts ? (
                <>
                  {titleParts[0]}
                  <span className="text-primary">{highlightText}</span>
                  {titleParts[1]}
                </>
              ) : (
                section.title
              )}
            </h1>

            <p
              className="text-muted-foreground max-w-2xl text-lg leading-8"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />

            {section.buttons && (
              <div className="flex flex-wrap gap-3">
                {section.buttons.map((button, idx) => (
                  <Button
                    asChild
                    key={idx}
                    size={button.size || 'default'}
                    variant={button.variant || 'default'}
                    className="h-11 px-5"
                  >
                    <Link href={button.url || ''} target={button.target || '_self'}>
                      {button.icon && <SmartIcon name={button.icon as string} size={18} />}
                      <span>{button.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {section.tip && (
              <p className="text-muted-foreground text-sm">{section.tip}</p>
            )}
          </div>

          {chips.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {chips.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-background/86 border-border/70 rounded-2xl border p-4 shadow-sm backdrop-blur"
                >
                  <div className="text-primary mb-3 flex size-9 items-center justify-center rounded-full bg-primary/10">
                    {item.icon ? (
                      <SmartIcon name={item.icon as string} size={18} />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                  </div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="from-primary/10 via-background/0 to-primary/5 absolute inset-0 rounded-[2rem] bg-gradient-to-br" />
          <div className="relative grid gap-4">
            <div className="bg-background/94 border-border/80 rounded-[1.75rem] border p-6 shadow-[0_24px_80px_rgba(18,59,72,0.12)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{templatePreview.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {templatePreview.description}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                  <FileText className="size-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(templatePreview.sections ?? []).map((row: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl bg-muted/70 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{row}</span>
                    <span className="text-muted-foreground text-xs">
                      {(templatePreview.tags ?? [])[idx] || 'ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-card border-border/80 rounded-[1.5rem] border p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
                    <ScanSearch className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{jdPreview.title}</p>
                    <p className="text-muted-foreground text-sm">{jdPreview.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(jdPreview.keywords ?? []).map((keyword: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  {jdPreview.note}
                </p>
              </div>

              <div className="bg-primary text-primary-foreground rounded-[1.5rem] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{resultPreview.title}</p>
                    <p className="text-primary-foreground/70 mt-1 text-sm">
                      {resultPreview.description}
                    </p>
                  </div>
                  <div className="bg-primary-foreground/12 flex size-10 items-center justify-center rounded-2xl">
                    <WandSparkles className="size-5" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Match score
                  </p>
                  <p className="mt-2 text-4xl font-semibold">{resultPreview.match}</p>
                </div>

                <div className="mt-4 space-y-3">
                  {(resultPreview.changes ?? []).map((change: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <span className="text-sm">{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
