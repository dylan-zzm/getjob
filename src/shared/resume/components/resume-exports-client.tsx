'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { extractFilenameFromContentDisposition } from '@/shared/lib/content-disposition';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export interface ExportResumeItem {
  id: string;
  title: string;
  status: string;
  targetRole: string;
  sourceFileName: string;
  matchScore: number;
  updatedAt: string;
}

export function ResumeExportsClient({
  resumes,
}: {
  resumes: ExportResumeItem[];
}) {
  const t = useTranslations('activity.exports');

  const handleDownload = async (resumeId: string, format: 'docx' | 'pdf') => {
    const resp = await fetch(`/api/resume/export?resumeId=${resumeId}&format=${format}`);

    if (!resp.ok) {
      let message = t('downloads.error');
      try {
        const payload = await resp.json();
        message = payload.message || message;
      } catch {
        // ignore
      }
      toast.error(message);
      return;
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download =
      extractFilenameFromContentDisposition(
        resp.headers.get('Content-Disposition')
      ) || `resume-export.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>{t('downloads.title')}</CardTitle>
        <CardDescription>{t('downloads.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumes.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/80 px-5 py-8 text-sm leading-7">
            {t('downloads.empty')}
          </div>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className="rounded-[1.5rem] border border-border/80 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{resume.title}</h3>
                    <Badge variant="outline" className="rounded-full">
                      {t(`downloads.status.${resume.status}`)}
                    </Badge>
                    {resume.matchScore > 0 ? (
                      <Badge className="rounded-full">
                        {t('downloads.score', {
                          score: Math.round(resume.matchScore),
                        })}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm leading-6">
                    {[resume.targetRole, resume.sourceFileName].filter(Boolean).join(' / ')}
                  </p>
                  <p className="text-muted-foreground text-xs">{resume.updatedAt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => void handleDownload(resume.id, 'docx')}
                  >
                    {t('downloads.docx')}
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDownload(resume.id, 'pdf')}
                  >
                    {t('downloads.pdf')}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
