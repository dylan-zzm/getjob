import type {
  StructuredResume,
  TailoredResumeAnalysis,
} from '@/shared/resume/schema';

export const sampleStructuredResume: StructuredResume = {
  basics: {
    name: '小明',
    headline: 'AI Product Manager',
    email: 'xiaoming@example.com',
    phone: '13800000000',
    wechat: 'xiaoming-ai',
    location: 'Shanghai',
    availability: '2 weeks',
    links: [
      {
        label: 'Portfolio',
        url: 'https://example.com/portfolio',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/xiaoming',
      },
    ],
  },
  summary: 'Product leader focused on AI workflow design and growth systems.',
  education: [
    {
      school: '成都大学',
      degree: '本科',
      major: '信息管理',
      dateRange: {
        start: '2018',
        end: '2022',
      },
      ranking: 'Top 10%',
      honors: ['一等奖学金'],
      bullets: ['AI Lab 项目负责人'],
    },
    {
      school: '牛津大学',
      degree: '交流',
      major: '商业分析',
      dateRange: {
        start: '2021',
        end: '2021',
      },
      ranking: '',
      honors: ['交换项目'],
      bullets: [],
    },
  ],
  experiences: [
    {
      type: 'full_time',
      company: 'OpenResume',
      team: 'Growth',
      role: 'Product Manager',
      location: 'Shanghai',
      dateRange: {
        start: '2023.01',
        end: '2024.12',
      },
      responsibilityMix: '70% 产品 / 30% 分析',
      bullets: [
        'Built resume intake workflow from zero to one.',
        'Improved upload-to-export conversion by 18%.',
      ],
      keywords: ['resume', 'growth'],
    },
    {
      type: 'full_time',
      company: 'DataFlow',
      team: 'Platform',
      role: 'Senior Product Manager',
      location: 'Shanghai',
      dateRange: {
        start: '2022.01',
        end: '2022.12',
      },
      responsibilityMix: '60% 产品 / 40% 运营',
      bullets: ['Shipped internal analytics platform.'],
      keywords: ['platform'],
    },
    {
      type: 'internship',
      company: 'ByteDance',
      team: 'Monetization',
      role: 'Product Intern',
      location: 'Beijing',
      dateRange: {
        start: '2021.06',
        end: '2021.09',
      },
      responsibilityMix: '',
      bullets: ['Delivered pricing experiment dashboard.'],
      keywords: ['pricing'],
    },
    {
      type: 'internship',
      company: 'Tencent',
      team: 'B2B',
      role: 'Strategy Intern',
      location: 'Shenzhen',
      dateRange: {
        start: '2020.07',
        end: '2020.10',
      },
      responsibilityMix: '',
      bullets: ['Researched SME product demand.'],
      keywords: ['research'],
    },
    {
      type: 'venture',
      company: 'LaunchLab',
      team: 'Founder Office',
      role: 'Co-founder',
      location: 'Remote',
      dateRange: {
        start: '2024.01',
        end: '2024.08',
      },
      responsibilityMix: '',
      bullets: ['Validated demand for JD-based resume tailoring.'],
      keywords: ['venture'],
    },
  ],
  skills: [
    {
      group: 'AI',
      summary: 'LLM workflow design',
      items: ['OpenAI', 'Prompting'],
    },
    {
      group: 'Data',
      summary: 'SQL and funnel analytics',
      items: ['SQL', 'Metabase'],
    },
    {
      group: 'Tools',
      summary: 'Rapid product delivery',
      items: ['Figma', 'Notion'],
    },
  ],
  strengths: [
    {
      title: 'Structured thinking',
      description: 'Can turn ambiguous workflows into stable product systems.',
    },
    {
      title: 'Execution',
      description: 'Drives delivery across product, data, and ops.',
    },
    {
      title: 'Communication',
      description: 'Writes clear product specs and user-facing copy.',
    },
  ],
  extras: [],
  rawSections: [],
};

export const sampleTailoredResumeAnalysis: TailoredResumeAnalysis = {
  matchScore: 88,
  summary: 'Strong alignment with AI product and workflow optimization roles.',
  fitHighlights: [
    {
      title: 'Resume workflow ownership',
      reason: 'Directly built intake and export product surfaces.',
    },
  ],
  warnings: ['Do not overstate quantified impact without source evidence.'],
  changes: [
    {
      section: 'Summary',
      before: 'General PM profile',
      after: 'AI workflow product profile',
      reason: 'Better aligns with target role language.',
    },
  ],
  rewrittenResume: sampleStructuredResume,
};
