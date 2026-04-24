import { z } from 'zod';

export const resumeLinkSchema = z.object({
  label: z.string().default(''),
  url: z.string().default(''),
});

export const resumeDateRangeSchema = z.object({
  start: z.string().default(''),
  end: z.string().default(''),
});

export const resumeEducationItemSchema = z.object({
  school: z.string().default(''),
  degree: z.string().default(''),
  major: z.string().default(''),
  dateRange: resumeDateRangeSchema,
  ranking: z.string().default(''),
  honors: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export const resumeExperienceItemSchema = z.object({
  type: z
    .enum(['full_time', 'internship', 'venture', 'project', 'other'])
    .default('other'),
  company: z.string().default(''),
  team: z.string().default(''),
  role: z.string().default(''),
  location: z.string().default(''),
  dateRange: resumeDateRangeSchema,
  responsibilityMix: z.string().default(''),
  bullets: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const resumeSkillGroupSchema = z.object({
  group: z.string().default(''),
  summary: z.string().default(''),
  items: z.array(z.string()).default([]),
});

export const resumeStrengthSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
});

export const resumeExtraFieldSchema = z.object({
  label: z.string().default(''),
  value: z.string().default(''),
});

export const resumeRawSectionSchema = z.object({
  title: z.string().default(''),
  content: z.string().default(''),
});

export const defaultResumeSectionOrder = [
  'summary',
  'experience',
  'education',
  'involvement',
  'skills',
  'rawSections',
];

export const structuredResumeSchema = z.object({
  basics: z.object({
    name: z.string().default(''),
    headline: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().default(''),
    wechat: z.string().default(''),
    location: z.string().default(''),
    availability: z.string().default(''),
    links: z.array(resumeLinkSchema).default([]),
  }),
  summary: z.string().default(''),
  education: z.array(resumeEducationItemSchema).default([]),
  experiences: z.array(resumeExperienceItemSchema).default([]),
  skills: z.array(resumeSkillGroupSchema).default([]),
  strengths: z.array(resumeStrengthSchema).default([]),
  extras: z.array(resumeExtraFieldSchema).default([]),
  rawSections: z.array(resumeRawSectionSchema).default([]),
  sectionOrder: z.array(z.string()).default(defaultResumeSectionOrder),
});

export const tailoredResumeAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100).default(0),
  summary: z.string().default(''),
  fitHighlights: z
    .array(
      z.object({
        title: z.string().default(''),
        reason: z.string().default(''),
      })
    )
    .default([]),
  warnings: z.array(z.string()).default([]),
  changes: z
    .array(
      z.object({
        section: z.string().default(''),
        before: z.string().default(''),
        after: z.string().default(''),
        reason: z.string().default(''),
      })
    )
    .default([]),
  rewrittenResume: structuredResumeSchema,
});

export type StructuredResume = z.infer<typeof structuredResumeSchema>;
export type TailoredResumeAnalysis = z.infer<
  typeof tailoredResumeAnalysisSchema
>;

function createStringArraySchema() {
  return {
    type: 'array',
    items: {
      type: 'string',
    },
  };
}

function createDateRangeJsonSchema() {
  return {
    type: 'object',
    properties: {
      start: { type: 'string' },
      end: { type: 'string' },
    },
    required: ['start', 'end'],
  };
}

function createStructuredResumeJsonSchema() {
  return {
    type: 'object',
    properties: {
      basics: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          headline: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          wechat: { type: 'string' },
          location: { type: 'string' },
          availability: { type: 'string' },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['label', 'url'],
            },
          },
        },
        required: [
          'name',
          'headline',
          'email',
          'phone',
          'wechat',
          'location',
          'availability',
          'links',
        ],
      },
      summary: { type: 'string' },
      education: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            school: { type: 'string' },
            degree: { type: 'string' },
            major: { type: 'string' },
            dateRange: createDateRangeJsonSchema(),
            ranking: { type: 'string' },
            honors: createStringArraySchema(),
            bullets: createStringArraySchema(),
          },
          required: [
            'school',
            'degree',
            'major',
            'dateRange',
            'ranking',
            'honors',
            'bullets',
          ],
        },
      },
      experiences: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            company: { type: 'string' },
            team: { type: 'string' },
            role: { type: 'string' },
            location: { type: 'string' },
            dateRange: createDateRangeJsonSchema(),
            responsibilityMix: { type: 'string' },
            bullets: createStringArraySchema(),
            keywords: createStringArraySchema(),
          },
          required: [
            'type',
            'company',
            'team',
            'role',
            'location',
            'dateRange',
            'responsibilityMix',
            'bullets',
            'keywords',
          ],
        },
      },
      skills: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            group: { type: 'string' },
            summary: { type: 'string' },
            items: createStringArraySchema(),
          },
          required: ['group', 'summary', 'items'],
        },
      },
      strengths: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['title', 'description'],
        },
      },
      extras: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            value: { type: 'string' },
          },
          required: ['label', 'value'],
        },
      },
      rawSections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['title', 'content'],
        },
      },
      sectionOrder: createStringArraySchema(),
    },
    required: [
      'basics',
      'summary',
      'education',
      'experiences',
      'skills',
      'strengths',
      'extras',
      'rawSections',
    ],
  };
}

export const structuredResumeJsonSchema = createStructuredResumeJsonSchema();

export const tailoredResumeAnalysisJsonSchema = {
  type: 'object',
  properties: {
    matchScore: { type: 'number' },
    summary: { type: 'string' },
    fitHighlights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['title', 'reason'],
      },
    },
    warnings: createStringArraySchema(),
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section: { type: 'string' },
          before: { type: 'string' },
          after: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['section', 'before', 'after', 'reason'],
      },
    },
    rewrittenResume: createStructuredResumeJsonSchema(),
  },
  required: [
    'matchScore',
    'summary',
    'fitHighlights',
    'warnings',
    'changes',
    'rewrittenResume',
  ],
};

export function parseStructuredResume(input: unknown): StructuredResume {
  return structuredResumeSchema.parse(input);
}

export function parseTailoredResumeAnalysis(
  input: unknown,
  fallbackResume?: StructuredResume
): TailoredResumeAnalysis {
  return tailoredResumeAnalysisSchema.parse(
    normalizeTailoredResumeAnalysisInput(input, fallbackResume)
  );
}

function normalizeTailoredResumeAnalysisInput(
  input: unknown,
  fallbackResume?: StructuredResume
) {
  const source = parseLooseJson(input);
  const record = isRecord(source) ? source : {};

  const rewrittenResume = normalizeStructuredResumeCandidate(
    record.rewrittenResume ??
      record.rewritten_resume ??
      record.rewritten ??
      record.resume,
    fallbackResume
  );

  return {
    matchScore: normalizeNumber(record.matchScore ?? record.match_score, 0),
    summary: normalizeString(record.summary),
    fitHighlights: normalizeFitHighlights(
      record.fitHighlights ?? record.fit_highlights
    ),
    warnings: normalizeStringArray(record.warnings),
    changes: normalizeChanges(record.changes),
    rewrittenResume,
  };
}

function normalizeStructuredResumeCandidate(
  input: unknown,
  fallbackResume?: StructuredResume
) {
  const candidate = parseLooseJson(input);
  if (candidate !== undefined) {
    return candidate;
  }

  return fallbackResume;
}

function normalizeFitHighlights(input: unknown) {
  const value = parseLooseJson(input);

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') {
        return {
          title: '',
          reason: item.trim(),
        };
      }

      const record = isRecord(item) ? item : {};
      return {
        title: normalizeString(record.title),
        reason: normalizeString(record.reason ?? record.description),
      };
    });
  }

  if (typeof value === 'string' && value.trim()) {
    return [
      {
        title: '',
        reason: value.trim(),
      },
    ];
  }

  return [];
}

function normalizeChanges(input: unknown) {
  const value = parseLooseJson(input);

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') {
        return {
          section: 'General',
          before: '',
          after: '',
          reason: item.trim(),
        };
      }

      const record = isRecord(item) ? item : {};
      return {
        section: normalizeString(record.section || record.title || 'General'),
        before: normalizeString(record.before),
        after: normalizeString(record.after),
        reason: normalizeString(record.reason || record.description),
      };
    });
  }

  if (typeof value === 'string' && value.trim()) {
    return [
      {
        section: 'General',
        before: '',
        after: '',
        reason: value.trim(),
      },
    ];
  }

  return [];
}

function normalizeStringArray(input: unknown) {
  const value = parseLooseJson(input);

  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function normalizeNumber(input: unknown, fallback: number) {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }

  if (typeof input === 'string') {
    const parsed = Number(input.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeString(input: unknown) {
  if (typeof input === 'string') {
    return input.trim();
  }

  return '';
}

function parseLooseJson(input: unknown) {
  if (typeof input !== 'string') {
    return input;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return input;
    }
  }

  return input;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
