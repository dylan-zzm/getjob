'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/core/i18n/navigation';
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
import { StructuredResume } from '@/shared/resume/schema';

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ResumeEditorClient({
  resumeId,
  initialTitle,
  initialContent,
}: {
  resumeId: string;
  initialTitle: string;
  initialContent: StructuredResume;
}) {
  const t = useTranslations('activity.resumes.editor');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialTitle);
  const [name, setName] = useState(initialContent.basics.name);
  const [headline, setHeadline] = useState(initialContent.basics.headline);
  const [email, setEmail] = useState(initialContent.basics.email);
  const [phone, setPhone] = useState(initialContent.basics.phone);
  const [wechat, setWechat] = useState(initialContent.basics.wechat);
  const [location, setLocation] = useState(initialContent.basics.location);
  const [availability, setAvailability] = useState(
    initialContent.basics.availability
  );
  const [summary, setSummary] = useState(initialContent.summary);
  const [skillsText, setSkillsText] = useState(
    initialContent.skills
      .map((item) => `${item.group}: ${item.summary}${item.items.length ? ` (${item.items.join(' / ')})` : ''}`)
      .join('\n')
  );
  const [strengthsText, setStrengthsText] = useState(
    initialContent.strengths
      .map((item) => `${item.title}: ${item.description}`)
      .join('\n')
  );
  const [experienceText, setExperienceText] = useState(
    initialContent.experiences
      .map((item) =>
        [
          `${item.company} | ${item.team} | ${item.role} | ${item.dateRange.start} - ${item.dateRange.end}`,
          item.responsibilityMix,
          ...item.bullets,
        ]
          .filter(Boolean)
          .join('\n')
      )
      .join('\n\n')
  );
  const [educationText, setEducationText] = useState(
    initialContent.education
      .map((item) =>
        [
          `${item.school} | ${item.degree} | ${item.major} | ${item.dateRange.start} - ${item.dateRange.end}`,
          item.ranking,
          ...item.honors,
          ...item.bullets,
        ]
          .filter(Boolean)
          .join('\n')
      )
      .join('\n\n')
  );

  const handleSave = async () => {
    const content: StructuredResume = {
      ...initialContent,
      basics: {
        ...initialContent.basics,
        name,
        headline,
        email,
        phone,
        wechat,
        location,
        availability,
      },
      summary,
      skills: splitLines(skillsText).map((line) => {
        const [groupPart, rest = ''] = line.split(':');
        const match = rest.match(/^(.*?)(?:\((.*)\))?$/);
        const summaryText = match?.[1]?.trim() || rest.trim();
        const itemsText = match?.[2]
          ? match[2]
              .split('/')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
        return {
          group: groupPart.trim(),
          summary: summaryText,
          items: itemsText,
        };
      }),
      strengths: splitLines(strengthsText).map((line) => {
        const [titlePart, ...desc] = line.split(':');
        return {
          title: titlePart.trim(),
          description: desc.join(':').trim(),
        };
      }),
      education: educationText
        .split('\n\n')
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
          const lines = splitLines(block);
          const [header = '', rankingLine = '', ...rest] = lines;
          const [school = '', degree = '', major = '', dates = ''] = header
            .split('|')
            .map((item) => item.trim());
          const [start = '', end = ''] = dates.split('-').map((item) => item.trim());
          return {
            school,
            degree,
            major,
            dateRange: { start, end },
            ranking: rankingLine,
            honors: rest,
            bullets: [],
          };
        }),
      experiences: experienceText
        .split('\n\n')
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block, index) => {
          const lines = splitLines(block);
          const [header = '', mix = '', ...bullets] = lines;
          const [company = '', team = '', role = '', dates = ''] = header
            .split('|')
            .map((item) => item.trim());
          const [start = '', end = ''] = dates.split('-').map((item) => item.trim());
          return {
            type: initialContent.experiences[index]?.type || 'other',
            company,
            team,
            role,
            location: initialContent.experiences[index]?.location || '',
            dateRange: { start, end },
            responsibilityMix: mix,
            bullets,
            keywords: initialContent.experiences[index]?.keywords || [],
          };
        }),
    };

    startTransition(async () => {
      const resp = await fetch('/api/resume/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          title,
          content,
        }),
      });
      const payload = await resp.json();

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || t('error'));
        return;
      }

      toast.success(t('success'));
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('fields.resume_title')}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Field label={t('fields.name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t('fields.headline')}>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </Field>
          <Field label={t('fields.email')}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t('fields.phone')}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label={t('fields.wechat')}>
            <Input value={wechat} onChange={(e) => setWechat(e.target.value)} />
          </Field>
          <Field label={t('fields.location')}>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label={t('fields.availability')}>
            <Input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('fields.summary')}</label>
            <Textarea
              className="min-h-28"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.skills')}</CardTitle>
          <CardDescription>{t('sections.skills_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-36"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.strengths')}</CardTitle>
          <CardDescription>{t('sections.strengths_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-36"
            value={strengthsText}
            onChange={(e) => setStrengthsText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.education')}</CardTitle>
          <CardDescription>{t('sections.education_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-52"
            value={educationText}
            onChange={(e) => setEducationText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.experience')}</CardTitle>
          <CardDescription>{t('sections.experience_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-80"
            value={experienceText}
            onChange={(e) => setExperienceText(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isPending} onClick={() => void handleSave()}>
          {isPending ? t('saving') : t('save')}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
