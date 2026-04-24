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
  showNotes = false,
}: {
  title?: string;
  description?: string;
  content: StructuredResume;
  analysis?: TailoredResumeAnalysis | null;
  template: ResumeTemplateDefinition;
  locale: string;
  showNotes?: boolean;
}) {
  const preview = buildResumeTemplatePreviewModel({
    resume: content,
    analysis,
    template,
    locale,
  });

  return (
    <div className="space-y-4">
      {title || description ? (
        <div className="space-y-1 px-1">
          {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
          {description ? (
            <p className="text-muted-foreground text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        data-testid="resume-template-preview"
        className="mx-auto max-w-[860px] rounded-[1.5rem] bg-white px-8 py-10 text-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.12)] md:px-14 md:py-14"
      >
        <header className="border-b border-slate-300 pb-7 text-center">
          <h2 className="text-[2.3rem] font-semibold text-slate-950">
            {preview.name || preview.templateName}
          </h2>
          {preview.headline ? (
            <p className="mt-3 text-[1.05rem] font-medium text-slate-900">
              {preview.headline}
            </p>
          ) : null}
          {preview.contactLine ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {preview.contactLine}
            </p>
          ) : null}
          {preview.locationLine ? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {preview.locationLine}
            </p>
          ) : null}
          {preview.linkLines.length > 0 ? (
            <div className="mt-3 space-y-1 text-sm leading-7 text-slate-700">
              {preview.linkLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </header>

        <div className="space-y-7 pt-7">
          {preview.sections
            .filter((section) =>
              section.kind === 'entry-list'
                ? section.entries.length > 0
                : section.lines.length > 0
            )
            .map((section) => (
              <section key={section.id} className="space-y-3">
                <div className="border-b border-slate-900 pb-1">
                  <h3 className="text-[1.05rem] font-semibold uppercase tracking-[0.04em] text-slate-900">
                    {section.title}
                  </h3>
                </div>

                {section.kind === 'entry-list' ? (
                  <div className="space-y-5">
                    {section.entries.map((entry) => (
                      <article key={`${section.id}-${entry.title}`} className="space-y-2.5">
                        <h4 className="text-[1rem] font-semibold leading-7 text-slate-900">
                          {entry.title}
                        </h4>
                        {entry.lines.map((line) => (
                          <p
                            key={`${entry.title}-${line}`}
                            className="whitespace-pre-wrap text-[0.98rem] leading-7 text-slate-800"
                          >
                            {line}
                          </p>
                        ))}
                        {entry.bullets.length > 0 ? (
                          <ul className="space-y-1 text-[0.98rem] leading-7 text-slate-800">
                            {entry.bullets.map((bullet) => (
                              <li
                                key={`${entry.title}-${bullet}`}
                                className="whitespace-pre-wrap pl-4"
                              >
                                <span className="-ml-4 inline-block w-4 text-slate-600">
                                  •
                                </span>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-[0.98rem] leading-7 text-slate-800">
                    {section.lines.map((line) => (
                      <p key={`${section.id}-${line}`} className="whitespace-pre-wrap">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
        </div>

        {showNotes && preview.notes.length > 0 ? (
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
  );
}
