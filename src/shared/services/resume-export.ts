import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

import {
  type StructuredResume,
  type TailoredResumeAnalysis,
} from '@/shared/resume/schema';
import { type ResumeTemplateDefinition } from '@/shared/resume/templates';

const execFileAsync = promisify(execFile);

export function buildResumeTemplatePayload(
  resume: StructuredResume,
  analysis?: TailoredResumeAnalysis | null
) {
  const education = resume.education || [];
  const fulltime = resume.experiences.filter((item) => item.type === 'full_time');
  const internships = resume.experiences.filter((item) => item.type === 'internship');
  const ventures = resume.experiences.filter((item) => item.type === 'venture');
  const skills = resume.skills || [];
  const strengths = resume.strengths || [];
  const links = resume.basics.links || [];
  const warnings = analysis?.warnings || [];

  const data: Record<string, string> = {
    profile_name: resume.basics.name || '',
    profile_headline: resume.basics.headline || '',
    profile_contact: compactJoin(
      [
        resume.basics.phone && `电话：${resume.basics.phone}`,
        resume.basics.email && `邮箱：${resume.basics.email}`,
        resume.basics.wechat && `微信：${resume.basics.wechat}`,
      ],
      '    '
    ),
    profile_location: compactJoin(
      [
        resume.basics.location && `Base：${resume.basics.location}`,
        resume.basics.availability && `到岗：${resume.basics.availability}`,
      ],
      '    '
    ),
    profile_links: links
      .map((item) => compactJoin([item.label, item.url], '：'))
      .filter(Boolean)
      .join('\n'),
    profile_manual: links[0]?.url || '',
    profile_learning: links[1]?.url || '',
    education_1_header: buildEducationHeader(education[0], '成都大学-本科'),
    education_1_detail: buildEducationDetail(education[0]),
    education_2_header: buildEducationHeader(education[1], '牛津大学-公费交流'),
    education_2_detail: buildEducationDetail(education[1]),
    fulltime_1_header: buildExperienceHeader(fulltime[0]),
    fulltime_1_mix: buildResponsibilityMix(fulltime[0]),
    fulltime_2_header: buildExperienceHeader(fulltime[1]),
    fulltime_2_mix: buildResponsibilityMix(fulltime[1]),
    intern_1_header: buildExperienceHeader(internships[0]),
    intern_2_header: buildExperienceHeader(internships[1]),
    venture_header: buildExperienceHeader(ventures[0]),
    skill_1: buildSkillLine(skills[0]),
    skill_2: buildSkillLine(skills[1]),
    skill_3: buildSkillLine(skills[2]),
    strength_1: buildStrengthLine(strengths[0]),
    strength_2: buildStrengthLine(strengths[1]),
    strength_3: buildStrengthLine(strengths[2]),
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

  for (let index = 0; index < 6; index += 1) {
    data[`fulltime_1_bullet_${index + 1}`] = buildBullet(fulltime[0], index);
    data[`fulltime_2_bullet_${index + 1}`] = buildBullet(fulltime[1], index);
  }

  for (let index = 0; index < 3; index += 1) {
    data[`intern_1_bullet_${index + 1}`] = buildBullet(internships[0], index);
    data[`en_fulltime_1_bullet_${index + 1}`] = '';
    data[`en_fulltime_2_bullet_${index + 1}`] = '';
  }

  for (let index = 0; index < 4; index += 1) {
    data[`intern_2_bullet_${index + 1}`] = buildBullet(internships[1], index);
    data[`venture_bullet_${index + 1}`] = buildBullet(ventures[0], index);
    data[`en_intern_2_bullet_${index + 1}`] = '';
    if (index < 2) {
      data[`en_intern_1_bullet_${index + 1}`] = '';
      data[`en_intern_3_bullet_${index + 1}`] = '';
    }
    if (index < 3) {
      data[`en_venture_bullet_${index + 1}`] = '';
    }
  }

  if (warnings.length > 0 && !data.profile_learning) {
    data.profile_learning = warnings.join('；');
  }

  return data;
}

export async function renderResumeDocx({
  resume,
  analysis,
  template,
}: {
  resume: StructuredResume;
  analysis?: TailoredResumeAnalysis | null;
  template: ResumeTemplateDefinition;
}) {
  const templateBuffer = await fs.readFile(template.renderTemplatePath);
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    linebreaks: true,
    paragraphLoop: true,
    delimiters: {
      start: '{{',
      end: '}}',
    },
  });

  doc.render(buildResumeTemplatePayload(resume, analysis));

  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

export async function convertDocxBufferToPdf(docxBuffer: Buffer, fileStem: string) {
  const tempBase = await fs.mkdtemp(join(tmpdir(), 'resume-export-'));
  const docxPath = join(tempBase, `${fileStem}.docx`);
  const pdfPath = join(tempBase, `${fileStem}.pdf`);

  await fs.writeFile(docxPath, docxBuffer);

  try {
    await execFileAsync('soffice', [
      `-env:UserInstallation=file://${join(tempBase, 'lo-profile')}`,
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      tempBase,
      docxPath,
    ]);
  } catch (error) {
    throw new Error('PDF export is not available in this environment');
  }

  const pdfBuffer = await fs.readFile(pdfPath);
  await fs.rm(tempBase, { recursive: true, force: true });
  return pdfBuffer;
}

function buildEducationHeader(
  item: StructuredResume['education'][number] | undefined,
  fallback: string
) {
  if (!item) {
    return '';
  }

  return compactJoin(
    [
      compactJoin([item.school, item.degree], '-'),
      buildDateRange(item.dateRange.start, item.dateRange.end),
    ],
    '    '
  ) || fallback;
}

function buildEducationDetail(item: StructuredResume['education'][number] | undefined) {
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

function buildExperienceHeader(
  item: StructuredResume['experiences'][number] | undefined
) {
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

function buildResponsibilityMix(
  item: StructuredResume['experiences'][number] | undefined
) {
  if (!item) {
    return '';
  }

  return compactJoin(['工作内容', item.responsibilityMix], '  ');
}

function buildBullet(
  item: StructuredResume['experiences'][number] | undefined,
  index: number
) {
  return item?.bullets[index] || '';
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

function compactJoin(items: Array<string | undefined | null | false>, delimiter: string) {
  return items.filter(Boolean).join(delimiter).trim();
}
