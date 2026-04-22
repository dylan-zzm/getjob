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
import {
  defaultResumeTemplate,
  type ResumeTemplateDefinition,
} from '@/shared/resume/templates';
import { buildResumeTemplatePayload as buildTemplatePayload } from '@/shared/resume/template-engine';

const execFileAsync = promisify(execFile);

export function buildResumeTemplatePayload(
  resume: StructuredResume,
  analysis?: TailoredResumeAnalysis | null,
  template: ResumeTemplateDefinition = defaultResumeTemplate
) {
  return buildTemplatePayload({
    resume,
    analysis,
    template,
  });
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

  doc.render(buildResumeTemplatePayload(resume, analysis, template));

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
