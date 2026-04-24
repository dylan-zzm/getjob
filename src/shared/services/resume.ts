import 'server-only';

import { createRequire } from 'node:module';

import { md5 } from '@/shared/lib/hash';
import {
  parseStructuredResume,
  parseTailoredResumeAnalysis,
  structuredResumeJsonSchema,
  tailoredResumeAnalysisJsonSchema,
  type StructuredResume,
  type TailoredResumeAnalysis,
} from '@/shared/resume/schema';
import {
  type ResumeTemplateDefinition,
  defaultResumeTemplate,
} from '@/shared/resume/templates';

import { callEvolinkTool } from './evolink';
import { getStorageService } from './storage';

const require = createRequire(import.meta.url);

const supportedResumeMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const supportedResumeExtensions = ['pdf', 'docx'];
const supportedJobDescriptionMimeTypes = [
  ...supportedResumeMimeTypes,
  'text/plain',
  'text/markdown',
];
const supportedJobDescriptionExtensions = ['pdf', 'docx', 'txt', 'md'];

export function isSupportedResumeFile(fileName: string, mimeType?: string) {
  const extension = getFileExtension(fileName);
  return (
    supportedResumeExtensions.includes(extension) ||
    Boolean(mimeType && supportedResumeMimeTypes.includes(mimeType))
  );
}

export function getSupportedResumeAccept() {
  return '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

export function isSupportedJobDescriptionFile(
  fileName: string,
  mimeType?: string
) {
  const extension = getFileExtension(fileName);
  return (
    supportedJobDescriptionExtensions.includes(extension) ||
    Boolean(
      mimeType && supportedJobDescriptionMimeTypes.includes(mimeType)
    ) ||
    Boolean(mimeType && mimeType.startsWith('text/'))
  );
}

export function getSupportedJobDescriptionAccept() {
  return '.pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';
}

export async function extractTextFromResumeFile({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
}) {
  const extension = getFileExtension(fileName);

  if (extension === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return normalizeDocumentText(result.value);
  }

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    const { PDFParse } = getPdfParseModule();
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return normalizeDocumentText(result.text);
  }

  throw new Error('Only PDF and DOCX resumes are supported for parsing');
}

export async function extractTextFromJobDescriptionFile({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
}) {
  const extension = getFileExtension(fileName);

  if (extension === 'txt' || extension === 'md' || mimeType?.startsWith('text/')) {
    return normalizeDocumentText(buffer.toString('utf8'));
  }

  if (extension === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return normalizeDocumentText(result.value);
  }

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    const { PDFParse } = getPdfParseModule();
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return normalizeDocumentText(result.text);
  }

  throw new Error('Only PDF, DOCX, TXT, and MD JD files are supported');
}

export async function uploadResumeSourceFile({
  userId,
  buffer,
  fileName,
  mimeType,
}: {
  userId: string;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
}) {
  try {
    const storage = await getStorageService();
    const digest = md5(buffer);
    const extension = getFileExtension(fileName) || 'bin';
    const key = `resumes/${userId}/${digest}.${extension}`;

    const exists = await storage.exists({ key });
    if (exists) {
      return storage.getPublicUrl({ key }) || '';
    }

    const result = await storage.uploadFile({
      body: buffer,
      key,
      contentType: mimeType || undefined,
      disposition: 'attachment',
    });

    return result.url || '';
  } catch {
    return '';
  }
}

export async function extractStructuredResumeFromText({
  sourceText,
  fileName,
  template = defaultResumeTemplate,
}: {
  sourceText: string;
  fileName: string;
  template?: ResumeTemplateDefinition;
}): Promise<StructuredResume> {
  const templateOutline = template.sections
    .map((section) => `- ${section.titleZh} / ${section.title}: ${section.fieldsZh.join('、')}`)
    .join('\n');

  const result = await callEvolinkTool<StructuredResume>({
    useDirectUrl: true,
    maxTokens: 5000,
    temperature: 0.1,
    system: [
      'You extract resume content into structured JSON for a fixed resume template.',
      'Do not fabricate facts, roles, metrics, dates, companies, or education details.',
      'Preserve the resume language as-is when possible.',
      'If a value is missing, return an empty string or an empty array.',
      'Normalize content into concise sections that can be edited online and rendered back into the fixed template.',
    ].join('\n'),
    prompt: [
      `Source file: ${fileName}`,
      `Fixed template: ${template.nameZh} (${template.id})`,
      'Template outline:',
      templateOutline,
      '',
      'Resume text:',
      sourceText,
    ].join('\n'),
    tool: {
      name: 'extract_resume_json',
      description:
        'Extract structured resume data from the provided resume text for a fixed template workflow.',
      inputSchema: structuredResumeJsonSchema,
    },
  });

  return parseStructuredResume(result);
}

export async function tailorStructuredResumeToJob({
  resume,
  targetRole,
  jobDescription,
  template = defaultResumeTemplate,
}: {
  resume: StructuredResume;
  targetRole: string;
  jobDescription: string;
  template?: ResumeTemplateDefinition;
}): Promise<TailoredResumeAnalysis> {
  const result = await callEvolinkTool<TailoredResumeAnalysis>({
    useDirectUrl: true,
    maxTokens: 6500,
    temperature: 0.3,
    system: [
      'You tailor a structured resume to a target job description while preserving facts.',
      'You may reorder emphasis, improve wording, and sharpen relevance.',
      'You must not invent new experiences, results, numbers, employers, schools, titles, or dates.',
      'Return a match score between 0 and 100, fit highlights, warnings, tracked changes, and the rewritten structured resume.',
      'The rewritten resume must remain compatible with a fixed template and structured section editing.',
      'changes must be an array of objects with section, before, after, and reason.',
      'rewrittenResume is required and must be a complete structured resume object.',
    ].join('\n'),
    prompt: [
      `Target role: ${targetRole}`,
      `Fixed template: ${template.nameZh} (${template.id})`,
      '',
      'Job description:',
      jobDescription,
      '',
      'Source structured resume JSON:',
      JSON.stringify(resume, null, 2),
    ].join('\n'),
    tool: {
      name: 'tailor_resume_json',
      description:
        'Rewrite structured resume content for a target job while preserving facts and producing auditable change reasons.',
      inputSchema: tailoredResumeAnalysisJsonSchema,
    },
  });

  return parseTailoredResumeAnalysis(result, resume);
}

export function buildResumeTitle({
  resume,
  fileName,
}: {
  resume: StructuredResume;
  fileName: string;
}) {
  const title = [resume.basics.name, resume.basics.headline].filter(Boolean).join(' · ');
  if (title) {
    return title;
  }

  return fileName.replace(/\.[^.]+$/, '');
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function normalizeDocumentText(text: string) {
  return text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

type PdfParseModule = {
  PDFParse: new (options: { data: Buffer | Uint8Array }) => {
    getText(): Promise<{ text: string }>;
    destroy(): Promise<void>;
  };
};

let cachedPdfParseModule: PdfParseModule | null = null;

function getPdfParseModule(): PdfParseModule {
  if (cachedPdfParseModule) {
    return cachedPdfParseModule;
  }

  cachedPdfParseModule = require('pdf-parse') as PdfParseModule;
  return cachedPdfParseModule;
}
