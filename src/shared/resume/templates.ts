export interface ResumeTemplateSection {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  fields: string[];
  fieldsZh: string[];
}

export interface ResumeTemplateDefinition {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  fileName: string;
  filePath: string;
  renderTemplateFileName: string;
  renderTemplatePath: string;
  sourceFormat: 'docx';
  importedFrom: string;
  languages: string[];
  outputFormats: string[];
  targetRoles: string[];
  sections: ResumeTemplateSection[];
  notes: string[];
  notesZh: string[];
}

export const resumeTemplates: ResumeTemplateDefinition[] = [
  {
    id: 'xiaoming-classic',
    name: 'Xiaoming Classic Resume',
    nameZh: '小明经典简历模板',
    description:
      'A fixed resume template centered on product, AI, data, and bilingual delivery.',
    descriptionZh:
      '一套固定的简历模板，围绕产品、AI、数据经历和中英双语交付组织内容。',
    fileName: 'xiaoming-resume-template.docx',
    filePath: 'content/templates/xiaoming-resume-template.docx',
    renderTemplateFileName: 'xiaoming-resume-export-template.docx',
    renderTemplatePath: 'content/templates/xiaoming-resume-export-template.docx',
    sourceFormat: 'docx',
    importedFrom: '/Users/mac/Desktop/小明简历.docx',
    languages: ['zh-CN', 'en-US'],
    outputFormats: ['docx', 'pdf'],
    targetRoles: [
      'AI Product Manager',
      'Data Product Manager',
      'Growth Product Manager',
      'Strategy and Operations',
    ],
    sections: [
      {
        id: 'profile',
        title: 'Profile Header',
        titleZh: '头部信息',
        description:
          'Name, target role, phone, email, WeChat, locations, and work availability.',
        descriptionZh: '姓名、岗位方向、电话、邮箱、微信、Base 城市和到岗状态。',
        fields: [
          'name',
          'headline',
          'phone',
          'email',
          'wechat',
          'locations',
          'availability',
          'portfolioLinks',
        ],
        fieldsZh: [
          '姓名',
          '职位标题',
          '手机号',
          '邮箱',
          '微信',
          '工作地点',
          '到岗状态',
          '作品链接',
        ],
      },
      {
        id: 'education',
        title: 'Education',
        titleZh: '教育背景',
        description:
          'Two education slots with school, degree, dates, rank, and honors.',
        descriptionZh:
          '双教育经历布局，适合学校、专业、时间、排名、奖项和项目说明。',
        fields: [
          'school',
          'degree',
          'major',
          'dateRange',
          'ranking',
          'honors',
        ],
        fieldsZh: ['学校', '学历', '专业', '时间', '排名', '奖项荣誉'],
      },
      {
        id: 'fulltime',
        title: 'Full-time Experience',
        titleZh: '工作经历',
        description:
          'Main work experience block with multi-bullet achievements and responsibility ratios.',
        descriptionZh: '主工作经历区，支持职责占比、项目名称、成果亮点和多条 bullet。',
        fields: [
          'company',
          'department',
          'role',
          'dateRange',
          'responsibilityMix',
          'bullets',
        ],
        fieldsZh: ['公司', '部门', '岗位', '时间', '职责占比', '经历要点'],
      },
      {
        id: 'internships',
        title: 'Internships',
        titleZh: '实习经历',
        description:
          'Internship block tailored for product, growth, and B2B business roles.',
        descriptionZh:
          '实习经历区，适合产品、增长、ToB 商务、平台运营等岗位叙述。',
        fields: ['company', 'team', 'role', 'dateRange', 'bullets'],
        fieldsZh: ['公司', '团队', '岗位', '时间', '经历要点'],
      },
      {
        id: 'venture',
        title: 'Venture Project',
        titleZh: '创业经历',
        description:
          'Founder-style section for 0-1 projects, traction, and market validation.',
        descriptionZh: '创业经历区，适合描述 0-1 项目、关键指标和市场验证结果。',
        fields: ['projectName', 'role', 'dateRange', 'bullets'],
        fieldsZh: ['项目名称', '角色', '时间', '经历要点'],
      },
      {
        id: 'skills',
        title: 'Professional Skills',
        titleZh: '专业技能',
        description:
          'Grouped skills for AI, data, product, and tooling capabilities.',
        descriptionZh: '按 AI、数据、产品、工具等维度组织技能标签。',
        fields: ['skillGroup', 'summary'],
        fieldsZh: ['技能分组', '技能描述'],
      },
      {
        id: 'strengths',
        title: 'Personal Strengths',
        titleZh: '个人优势',
        description:
          'Three to four concise strengths with evidence-based proof points.',
        descriptionZh: '三到四条个人优势，强调事实依据和岗位相关性。',
        fields: ['strengthTitle', 'strengthDescription'],
        fieldsZh: ['优势标题', '优势说明'],
      },
      {
        id: 'bilingual',
        title: 'Bilingual Addendum',
        titleZh: '双语附录',
        description:
          'English addendum for international or bilingual submissions.',
        descriptionZh: '为国际岗位或双语投递准备的英文附录部分。',
        fields: ['englishProfile', 'englishExperience', 'englishEducation'],
        fieldsZh: ['英文简介', '英文经历', '英文教育'],
      },
    ],
    notes: [
      'This template was normalized from a legacy WPS Word document into standard DOCX for future templating.',
      'The layout is fixed: editing should happen on structured content, not free-form drag-and-drop formatting.',
      'Future templates can be appended as new registry entries without changing the workspace IA.',
    ],
    notesZh: [
      '该模板已经从旧版 WPS Word 文档标准化为 DOCX，便于后续模板填充。',
      '页面编辑只改结构化内容，不开放自由排版拖拽，以保证模板输出一致性。',
      '后续新增模板时，只需要继续往模板注册表里追加，不需要推翻工作台结构。',
    ],
  },
];

export const defaultResumeTemplate = resumeTemplates[0];

export function getResumeTemplateById(id?: string | null) {
  if (!id) {
    return defaultResumeTemplate;
  }

  return resumeTemplates.find((template) => template.id === id) || defaultResumeTemplate;
}
