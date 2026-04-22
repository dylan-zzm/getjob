import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type {
  StructuredResume,
  TailoredResumeAnalysis,
} from '@/shared/resume/schema';
import type { ResumeTemplateDefinition } from '@/shared/resume/templates';
import { buildResumeTemplatePreviewModel } from '@/shared/resume/template-engine';

export function ResumeTemplatePreview({
  title,
  description,
  content,
  analysis,
  template,
  locale,
}: {
  title: string;
  description: string;
  content: StructuredResume;
  analysis?: TailoredResumeAnalysis | null;
  template: ResumeTemplateDefinition;
  locale: string;
}) {
  const preview = buildResumeTemplatePreviewModel({
    resume: content,
    analysis,
    template,
    locale,
  });

  return (
    <Card className="overflow-hidden border-border/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-[1.5rem] bg-slate-950/[0.04] p-4">
          <div
            data-testid="resume-template-preview"
            className="mx-auto max-w-[760px] bg-white px-8 py-10 font-serif text-slate-700 shadow-sm md:px-12"
          >
            <header className="border-b border-slate-200 pb-6 text-center">
              <h2 className="text-3xl font-semibold tracking-[0.08em] text-slate-900">
                {preview.name || preview.templateName}
              </h2>
              {preview.headline ? (
                <p className="mt-3 text-base text-slate-600">{preview.headline}</p>
              ) : null}
              {preview.contactLine ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {preview.contactLine}
                </p>
              ) : null}
              {preview.locationLine ? (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {preview.locationLine}
                </p>
              ) : null}
              {preview.linkLines.length > 0 ? (
                <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                  {preview.linkLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="space-y-8 pt-8">
              {preview.sections.map((section) => (
                <section key={section.id} className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-slate-900">
                    {section.title}
                  </h3>

                  {section.kind === 'entry-list' ? (
                    <div className="space-y-5 pt-4">
                      {section.entries.map((entry) => (
                        <article key={`${section.id}-${entry.title}`} className="space-y-2">
                          <h4 className="text-base font-semibold leading-6 text-slate-900">
                            {entry.title}
                          </h4>
                          {entry.lines.map((line) => (
                            <p
                              key={`${entry.title}-${line}`}
                              className="whitespace-pre-wrap text-sm leading-6 text-slate-600"
                            >
                              {line}
                            </p>
                          ))}
                          {entry.bullets.length > 0 ? (
                            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700 marker:text-slate-400">
                              {entry.bullets.map((bullet) => (
                                <li key={`${entry.title}-${bullet}`}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2 pt-4 text-sm leading-6 text-slate-700">
                      {section.lines.map((line) => (
                        <li key={`${section.id}-${line}`} className="whitespace-pre-wrap">
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {preview.notes.length > 0 ? (
              <footer className="mt-10 border-t border-slate-200 pt-4">
                <div className="space-y-2 text-xs leading-5 text-slate-500">
                  {preview.notes.map((note) => (
                    <p key={note} className="whitespace-pre-wrap">
                      {note}
                    </p>
                  ))}
                </div>
              </footer>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
