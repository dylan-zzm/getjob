import type {
  StructuredResume,
  TailoredResumeAnalysis,
} from '@/shared/resume/schema';
import type { ResumeTemplateDefinition } from '@/shared/resume/templates';

type ExperienceItem = StructuredResume['experiences'][number];
type EducationItem = StructuredResume['education'][number];

interface XiaomingTemplateSnapshot {
  templateId: string;
  profile: {
    name: string;
    headline: string;
    contactLine: string;
    locationLine: string;
    linkLines: string[];
    manualLink: string;
    learningLink: string;
  };
  education: Array<{
    header: string;
    detail: string;
  }>;
  fulltime: Array<{
    header: string;
    mix: string;
    bullets: string[];
  }>;
  internships: Array<{
    header: string;
    bullets: string[];
  }>;
  venture: {
    header: string;
    bullets: string[];
  } | null;
  skills: string[];
  strengths: string[];
}

export interface ResumeTemplatePreviewEntry {
  title: string;
  lines: string[];
  bullets: string[];
}

export type ResumeTemplatePreviewSection =
  | {
      id: string;
      title: string;
      kind: 'entry-list';
      entries: ResumeTemplatePreviewEntry[];
    }
  | {
      id: string;
      title: string;
      kind: 'text-list';
      lines: string[];
    };

export interface ResumeTemplatePreviewModel {
  templateId: string;
  templateName: string;
  name: string;
  headline: string;
  contactLine: string;
  locationLine: string;
  linkLines: string[];
  sections: ResumeTemplatePreviewSection[];
  notes: string[];
}

export function buildResumeTemplatePayload({
  resume,
  analysis,
  template,
}: {
  resume: StructuredResume;
  analysis?: TailoredResumeAnalysis | null;
  template: ResumeTemplateDefinition;
}) {
  switch (template.id) {
    case 'xiaoming-classic':
      return buildXiaomingClassicPayload(
        buildXiaomingClassicSnapshot(resume, analysis)
      );
    default:
      throw new Error(`Unsupported resume template: ${template.id}`);
  }
}

export function buildResumeTemplatePreviewModel({
  resume,
  analysis,
  template,
  locale = 'zh',
}: {
  resume: StructuredResume;
  analysis?: TailoredResumeAnalysis | null;
  template: ResumeTemplateDefinition;
  locale?: string;
}): ResumeTemplatePreviewModel {
  switch (template.id) {
    case 'xiaoming-classic':
      return buildXiaomingClassicPreviewModel({
        snapshot: buildXiaomingClassicSnapshot(resume, analysis),
        template,
        locale,
      });
    default:
      throw new Error(`Unsupported resume template: ${template.id}`);
  }
}

function buildXiaomingClassicSnapshot(
  resume: StructuredResume,
  analysis?: TailoredResumeAnalysis | null
): XiaomingTemplateSnapshot {
  const education = (resume.education || []).slice(0, 2);
  const fulltime = resume.experiences
    .filter((item) => item.type === 'full_time')
    .slice(0, 2);
  const internships = resume.experiences
    .filter((item) => item.type === 'internship')
    .slice(0, 2);
  const venture = resume.experiences.find((item) => item.type === 'venture') || null;
  const skills = (resume.skills || []).slice(0, 3);
  const strengths = (resume.strengths || []).slice(0, 3);
  const links = resume.basics.links || [];
  const warnings = analysis?.warnings || [];

  return {
    templateId: 'xiaoming-classic',
    profile: {
      name: resume.basics.name || '',
      headline: resume.basics.headline || '',
      contactLine: compactJoin(
        [
          resume.basics.phone && `电话：${resume.basics.phone}`,
          resume.basics.email && `邮箱：${resume.basics.email}`,
          resume.basics.wechat && `微信：${resume.basics.wechat}`,
        ],
        '    '
      ),
      locationLine: compactJoin(
        [
          resume.basics.location && `Base：${resume.basics.location}`,
          resume.basics.availability && `到岗：${resume.basics.availability}`,
        ],
        '    '
      ),
      linkLines: links
        .map((item) => compactJoin([item.label, item.url], '：'))
        .filter(Boolean),
      manualLink: links[0]?.url || '',
      learningLink: links[1]?.url || warnings.join('；'),
    },
    education: education.map((item) => ({
      header: buildEducationHeader(item),
      detail: buildEducationDetail(item),
    })),
    fulltime: fulltime.map((item) => ({
      header: buildExperienceHeader(item),
      mix: buildResponsibilityMix(item),
      bullets: item.bullets.slice(0, 6),
    })),
    internships: internships.map((item) => ({
      header: buildExperienceHeader(item),
      bullets: item.bullets.slice(
        0,
        item.company === internships[0]?.company ? 3 : 4
      ),
    })),
    venture: venture
      ? {
          header: buildExperienceHeader(venture),
          bullets: venture.bullets.slice(0, 4),
        }
      : null,
    skills: skills.map(buildSkillLine).filter(Boolean),
    strengths: strengths.map(buildStrengthLine).filter(Boolean),
  };
}

function buildXiaomingClassicPayload(snapshot: XiaomingTemplateSnapshot) {
  const payload: Record<string, string> = {
    profile_name: snapshot.profile.name,
    profile_headline: snapshot.profile.headline,
    profile_contact: snapshot.profile.contactLine,
    profile_location: snapshot.profile.locationLine,
    profile_links: snapshot.profile.linkLines.join('\n'),
    profile_manual: snapshot.profile.manualLink,
    profile_learning: snapshot.profile.learningLink,
    education_1_header: snapshot.education[0]?.header || '',
    education_1_detail: snapshot.education[0]?.detail || '',
    education_2_header: snapshot.education[1]?.header || '',
    education_2_detail: snapshot.education[1]?.detail || '',
    fulltime_1_header: snapshot.fulltime[0]?.header || '',
    fulltime_1_mix: snapshot.fulltime[0]?.mix || '',
    fulltime_2_header: snapshot.fulltime[1]?.header || '',
    fulltime_2_mix: snapshot.fulltime[1]?.mix || '',
    intern_1_header: snapshot.internships[0]?.header || '',
    intern_2_header: snapshot.internships[1]?.header || '',
    venture_header: snapshot.venture?.header || '',
    skill_1: snapshot.skills[0] || '',
    skill_2: snapshot.skills[1] || '',
    skill_3: snapshot.skills[2] || '',
    strength_1: snapshot.strengths[0] || '',
    strength_2: snapshot.strengths[1] || '',
    strength_3: snapshot.strengths[2] || '',
    en_strength_1: '',
    en_strength_2: '',
    en_strength_3: '',
    en_strength_4: '',
    en_fulltime_1_header: '',
    en_fulltime_2_header: '',
    en_intern_1_header: '',
    en_intern_2_header: '',
    en_intern_3_header: '',
    en_venture_header: '',
    en_skill_1: '',
    en_skill_2: '',
    en_education_1_header: '',
    en_education_1_detail: '',
    en_education_2_header: '',
  };

  Object.assign(
    payload,
    buildIndexedFields('fulltime_1_bullet_', 6, snapshot.fulltime[0]?.bullets),
    buildIndexedFields('fulltime_2_bullet_', 6, snapshot.fulltime[1]?.bullets),
    buildIndexedFields('intern_1_bullet_', 3, snapshot.internships[0]?.bullets),
    buildIndexedFields('intern_2_bullet_', 4, snapshot.internships[1]?.bullets),
    buildIndexedFields('venture_bullet_', 4, snapshot.venture?.bullets),
    buildIndexedFields('en_fulltime_1_bullet_', 3),
    buildIndexedFields('en_fulltime_2_bullet_', 3),
    buildIndexedFields('en_intern_1_bullet_', 2),
    buildIndexedFields('en_intern_2_bullet_', 2),
    buildIndexedFields('en_intern_3_bullet_', 2),
    buildIndexedFields('en_venture_bullet_', 3)
  );

  return payload;
}

function buildXiaomingClassicPreviewModel({
  snapshot,
  template,
  locale,
}: {
  snapshot: XiaomingTemplateSnapshot;
  template: ResumeTemplateDefinition;
  locale: string;
}): ResumeTemplatePreviewModel {
  return {
    templateId: template.id,
    templateName: isChineseLocale(locale) ? template.nameZh : template.name,
    name: snapshot.profile.name,
    headline: snapshot.profile.headline,
    contactLine: snapshot.profile.contactLine,
    locationLine: snapshot.profile.locationLine,
    linkLines: snapshot.profile.linkLines,
    notes: [snapshot.profile.manualLink, snapshot.profile.learningLink].filter(
      Boolean
    ),
    sections: [
      {
        id: 'education',
        title: getSectionTitle(template, 'education', locale, 'Education'),
        kind: 'entry-list',
        entries: snapshot.education.map((item) => ({
          title: item.header,
          lines: item.detail ? [item.detail] : [],
          bullets: [],
        })),
      },
      {
        id: 'fulltime',
        title: getSectionTitle(template, 'fulltime', locale, 'Experience'),
        kind: 'entry-list',
        entries: snapshot.fulltime.map((item) => ({
          title: item.header,
          lines: item.mix ? [item.mix] : [],
          bullets: item.bullets.filter(Boolean),
        })),
      },
      {
        id: 'internships',
        title: getSectionTitle(template, 'internships', locale, 'Internships'),
        kind: 'entry-list',
        entries: snapshot.internships.map((item) => ({
          title: item.header,
          lines: [],
          bullets: item.bullets.filter(Boolean),
        })),
      },
      {
        id: 'venture',
        title: getSectionTitle(template, 'venture', locale, 'Venture Project'),
        kind: 'entry-list',
        entries: snapshot.venture
          ? [
              {
                title: snapshot.venture.header,
                lines: [],
                bullets: snapshot.venture.bullets.filter(Boolean),
              },
            ]
          : [],
      },
      {
        id: 'skills',
        title: getSectionTitle(template, 'skills', locale, 'Skills'),
        kind: 'text-list',
        lines: snapshot.skills.filter(Boolean),
      },
      {
        id: 'strengths',
        title: getSectionTitle(template, 'strengths', locale, 'Strengths'),
        kind: 'text-list',
        lines: snapshot.strengths.filter(Boolean),
      },
    ],
  };
}

function buildIndexedFields(
  prefix: string,
  size: number,
  values: string[] = []
) {
  const fields: Record<string, string> = {};

  for (let index = 0; index < size; index += 1) {
    fields[`${prefix}${index + 1}`] = values[index] || '';
  }

  return fields;
}

function getSectionTitle(
  template: ResumeTemplateDefinition,
  sectionId: string,
  locale: string,
  fallback: string
) {
  const section = template.sections.find((item) => item.id === sectionId);
  if (!section) {
    return fallback;
  }

  return isChineseLocale(locale) ? section.titleZh : section.title;
}

function isChineseLocale(locale: string) {
  return locale.toLowerCase().startsWith('zh');
}

function buildEducationHeader(item: EducationItem | undefined) {
  if (!item) {
    return '';
  }

  return compactJoin(
    [
      compactJoin([item.school, item.degree], '-'),
      buildDateRange(item.dateRange.start, item.dateRange.end),
    ],
    '    '
  );
}

function buildEducationDetail(item: EducationItem | undefined) {
  if (!item) {
    return '';
  }

  return compactJoin(
    [
      compactJoin([item.major, item.ranking], '  '),
      item.honors.join('  '),
      item.bullets.join('  '),
    ],
    '  '
  );
}

function buildExperienceHeader(item: ExperienceItem | undefined) {
  if (!item) {
    return '';
  }

  return compactJoin(
    [
      item.company,
      item.team,
      item.role,
      buildDateRange(item.dateRange.start, item.dateRange.end),
    ],
    '    '
  );
}

function buildResponsibilityMix(item: ExperienceItem | undefined) {
  if (!item?.responsibilityMix) {
    return '';
  }

  return compactJoin(['工作内容', item.responsibilityMix], '  ');
}

function buildSkillLine(item: StructuredResume['skills'][number] | undefined) {
  if (!item) {
    return '';
  }

  return compactJoin(
    [
      item.group && `${item.group}：${item.summary}`,
      item.items.length ? item.items.join('、') : '',
    ],
    '  '
  );
}

function buildStrengthLine(
  item: StructuredResume['strengths'][number] | undefined
) {
  if (!item) {
    return '';
  }

  return compactJoin([item.title, item.description], '  ');
}

function buildDateRange(start?: string, end?: string) {
  return compactJoin([start, end], ' - ');
}

function compactJoin(
  items: Array<string | undefined | null | false>,
  delimiter: string
) {
  return items.filter(Boolean).join(delimiter).trim();
}
