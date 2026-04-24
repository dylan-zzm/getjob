'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  Baseline,
  ChevronDown,
  Ellipsis,
  FileText,
  Image,
  IndentIncrease,
  Lock,
  Minus,
  Palette,
  Plus,
  Rows3,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Type,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import {
  defaultResumeSectionOrder,
  StructuredResume,
  type TailoredResumeAnalysis,
} from '@/shared/resume/schema';
import { type ResumeTemplateDefinition } from '@/shared/resume/templates';

type WorkspaceMode = 'edit' | 'preview' | 'cover-letter';
type EditorSection =
  | 'contact'
  | 'experience'
  | 'education'
  | 'involvement'
  | 'skills'
  | 'summary';

export interface ResumeWorkbenchOption {
  id: string;
  title: string;
  targetRole?: string;
}

type ResumeExperienceItem = StructuredResume['experiences'][number];
type ResumeEducationItem = StructuredResume['education'][number];
type ResumeSkillGroup = StructuredResume['skills'][number];
type ResumeStrengthItem = StructuredResume['strengths'][number];
type ResumePreviewSettings = {
  accentColor: string;
  fontFamily: string;
  fontLabel: string;
  fontSize: number;
  lineHeight: number;
  pagedView: boolean;
  sectionSpacing: number;
  showAvatar: boolean;
  showDivider: boolean;
  showIcons: boolean;
  textColor: string;
  zoom: number;
};

const fontOptions = [
  {
    label: 'Merriweather',
    value: 'Merriweather, Georgia, serif',
  },
  {
    label: 'Source Sans',
    value: '"Source Sans Pro", Arial, sans-serif',
  },
  {
    label: 'Georgia',
    value: 'Georgia, serif',
  },
];

const lineHeightOptions = [1.35, 1.5, 1.65];
const sectionSpacingOptions = [0.9, 1.1, 1.35];
const zoomOptions = [90, 100, 106, 120];
const colorOptions = ['#2e3d50', '#111827', '#0f766e', '#4d70eb'];

const defaultResumePreviewSettings: ResumePreviewSettings = {
  accentColor: '#2e3d50',
  fontFamily: fontOptions[0].value,
  fontLabel: fontOptions[0].label,
  fontSize: 11,
  lineHeight: 1.5,
  pagedView: true,
  sectionSpacing: 1.1,
  showAvatar: false,
  showDivider: true,
  showIcons: true,
  textColor: '#2e3d50',
  zoom: 100,
};

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitEditableLines(value: string) {
  return value.split('\n');
}

export function ResumeEditorClient({
  acceptedJobDescriptionFormats,
  acceptedResumeFormats,
  resumeId,
  resumeOptions,
  initialTitle,
  initialContent,
  template,
  templateId,
  locale,
  initialTargetRole,
  initialJobDescription,
  initialAnalysis,
}: {
  acceptedJobDescriptionFormats: string;
  acceptedResumeFormats: string;
  resumeId: string;
  resumeOptions: ResumeWorkbenchOption[];
  initialTitle: string;
  initialContent: StructuredResume;
  template: ResumeTemplateDefinition;
  templateId: string;
  locale: string;
  initialTargetRole: string;
  initialJobDescription: string;
  initialAnalysis?: TailoredResumeAnalysis | null;
}) {
  const t = useTranslations('activity.resumes.editor');
  const intakeT = useTranslations('activity.intake');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('preview');
  const [activeSection, setActiveSection] = useState<EditorSection>('contact');
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
  const [primaryLink, setPrimaryLink] = useState(
    initialContent.basics.links[0]?.url || ''
  );
  const [summary, setSummary] = useState(initialContent.summary);
  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [activeAction, setActiveAction] = useState<
    'save' | 'tailor' | 'intake' | null
  >(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [newJdFile, setNewJdFile] = useState<File | null>(null);
  const [newTargetRole, setNewTargetRole] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [sectionOrder, setSectionOrder] = useState(() =>
    normalizeDocumentSectionOrder(initialContent.sectionOrder)
  );
  const [rawSections, setRawSections] = useState(
    initialContent.rawSections || []
  );
  const [experiences, setExperiences] = useState(
    initialContent.experiences || []
  );
  const [educationItems, setEducationItems] = useState(
    initialContent.education || []
  );
  const [skillGroups, setSkillGroups] = useState(initialContent.skills || []);
  const [strengths, setStrengths] = useState(initialContent.strengths || []);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const [activeEducationIndex, setActiveEducationIndex] = useState(0);
  const [activeSkillIndex, setActiveSkillIndex] = useState(0);
  const [activeStrengthIndex, setActiveStrengthIndex] = useState(0);
  const [previewSettings, setPreviewSettings] = useState(
    defaultResumePreviewSettings
  );

  const experienceText = useMemo(
    () => formatExperienceItems(experiences),
    [experiences]
  );
  const educationText = useMemo(
    () => formatEducationItems(educationItems),
    [educationItems]
  );
  const skillsText = useMemo(
    () => formatSkillGroups(skillGroups),
    [skillGroups]
  );
  const involvementText = useMemo(
    () => formatStrengthItems(strengths),
    [strengths]
  );

  const draftContent = useMemo(
    () =>
      buildDraftResumeContent({
        initialContent,
        name,
        headline,
        email,
        phone,
        wechat,
        location,
        availability,
        primaryLink,
        summary,
        skillGroups,
        strengths,
        educationItems,
        experiences,
        rawSections,
        sectionOrder,
      }),
    [
      availability,
      educationItems,
      email,
      experiences,
      headline,
      initialContent,
      strengths,
      location,
      name,
      phone,
      primaryLink,
      rawSections,
      sectionOrder,
      skillGroups,
      summary,
      wechat,
    ]
  );

  const matchScore = initialAnalysis?.matchScore || 0;
  const resumeBadgeLabel = (title || name || 'resume').toUpperCase();
  const updatePreviewSettings = (values: Partial<ResumePreviewSettings>) => {
    setPreviewSettings((current) => ({
      ...current,
      ...values,
    }));
  };
  const resetUploadDraft = () => {
    setNewResumeFile(null);
    setNewJdFile(null);
    setNewTargetRole('');
    setNewJobDescription('');
  };

  const moveDocumentSection = (sectionId: string, direction: -1 | 1) => {
    setSectionOrder((current) => {
      const next = normalizeDocumentSectionOrder(current);
      const index = next.indexOf(sectionId);
      const targetIndex = index + direction;

      if (index === -1 || targetIndex < 0 || targetIndex >= next.length) {
        return next;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const addRawSection = () => {
    setRawSections((current) => [
      ...current,
      {
        title: '',
        content: '',
      },
    ]);
    setSectionOrder((current) =>
      normalizeDocumentSectionOrder([...current, 'rawSections'])
    );
  };

  const updateRawSection = (
    index: number,
    values: Partial<StructuredResume['rawSections'][number]>
  ) => {
    setRawSections((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      )
    );
  };

  const removeRawSection = (index: number) => {
    setRawSections((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateExperience = (
    index: number,
    values: Partial<ResumeExperienceItem>
  ) => {
    setExperiences((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      )
    );
  };

  const updateExperienceDate = (
    index: number,
    field: keyof ResumeExperienceItem['dateRange'],
    value: string
  ) => {
    setExperiences((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              dateRange: {
                ...item.dateRange,
                [field]: value,
              },
            }
          : item
      )
    );
  };

  const addExperience = () => {
    const nextIndex = experiences.length;
    setExperiences((current) => [...current, createEmptyExperience()]);
    setActiveExperienceIndex(nextIndex);
  };

  const removeExperience = (index: number) => {
    const next = experiences.filter((_, itemIndex) => itemIndex !== index);
    setExperiences(next);
    setActiveExperienceIndex(Math.min(index, Math.max(0, next.length - 1)));
  };

  const updateEducation = (
    index: number,
    values: Partial<ResumeEducationItem>
  ) => {
    setEducationItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      )
    );
  };

  const updateEducationDate = (
    index: number,
    field: keyof ResumeEducationItem['dateRange'],
    value: string
  ) => {
    setEducationItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              dateRange: {
                ...item.dateRange,
                [field]: value,
              },
            }
          : item
      )
    );
  };

  const addEducation = () => {
    const nextIndex = educationItems.length;
    setEducationItems((current) => [...current, createEmptyEducation()]);
    setActiveEducationIndex(nextIndex);
  };

  const removeEducation = (index: number) => {
    const next = educationItems.filter((_, itemIndex) => itemIndex !== index);
    setEducationItems(next);
    setActiveEducationIndex(Math.min(index, Math.max(0, next.length - 1)));
  };

  const updateSkillGroup = (
    index: number,
    values: Partial<ResumeSkillGroup>
  ) => {
    setSkillGroups((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      )
    );
  };

  const addSkillGroup = () => {
    const nextIndex = skillGroups.length;
    setSkillGroups((current) => [...current, createEmptySkillGroup()]);
    setActiveSkillIndex(nextIndex);
  };

  const removeSkillGroup = (index: number) => {
    const next = skillGroups.filter((_, itemIndex) => itemIndex !== index);
    setSkillGroups(next);
    setActiveSkillIndex(Math.min(index, Math.max(0, next.length - 1)));
  };

  const updateStrength = (
    index: number,
    values: Partial<ResumeStrengthItem>
  ) => {
    setStrengths((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      )
    );
  };

  const addStrength = () => {
    const nextIndex = strengths.length;
    setStrengths((current) => [...current, createEmptyStrength()]);
    setActiveStrengthIndex(nextIndex);
  };

  const removeStrength = (index: number) => {
    const next = strengths.filter((_, itemIndex) => itemIndex !== index);
    setStrengths(next);
    setActiveStrengthIndex(Math.min(index, Math.max(0, next.length - 1)));
  };

  const persistDraft = async () => {
    const resp = await fetch('/api/resume/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeId,
        title,
        targetRole,
        jobDescription,
        content: draftContent,
      }),
    });
    const payload = await resp.json();

    if (!resp.ok || payload.code !== 0) {
      toast.error(payload.message || t('error'));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    startTransition(async () => {
      setActiveAction('save');
      const ok = await persistDraft();
      setActiveAction(null);

      if (!ok) {
        return;
      }

      toast.success(t('success'));
      router.refresh();
    });
  };

  const handleTailor = async () => {
    if (!targetRole.trim()) {
      toast.error(t('tailoring.role_required'));
      return;
    }

    if (!jobDescription.trim()) {
      toast.error(t('tailoring.jd_required'));
      return;
    }

    startTransition(async () => {
      setActiveAction('tailor');

      const saved = await persistDraft();
      if (!saved) {
        setActiveAction(null);
        return;
      }

      const resp = await fetch('/api/resume/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });
      const payload = await resp.json();
      setActiveAction(null);

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || t('tailoring.error'));
        return;
      }

      toast.success(t('tailoring.success'));
      router.refresh();
    });
  };

  const handleCreateResume = async () => {
    if (!newResumeFile) {
      toast.error(intakeT('form.errors.resume_required'));
      return;
    }

    if (!newTargetRole.trim()) {
      toast.error(intakeT('form.errors.role_required'));
      return;
    }

    if (!newJobDescription.trim() && !newJdFile) {
      toast.error(intakeT('form.errors.jd_required'));
      return;
    }

    const formData = new FormData();
    formData.append('templateId', templateId);
    formData.append('resumeFile', newResumeFile);
    formData.append('targetRole', newTargetRole.trim());
    formData.append('jobDescription', newJobDescription.trim());
    if (newJdFile) {
      formData.append('jdFile', newJdFile);
    }

    startTransition(async () => {
      setActiveAction('intake');
      const resp = await fetch('/api/resume/intake', {
        method: 'POST',
        body: formData,
      });
      const payload = await resp.json();
      setActiveAction(null);

      if (!resp.ok || payload.code !== 0) {
        toast.error(payload.message || intakeT('form.error'));
        return;
      }

      const nextResumeId = payload.data?.id;
      if (!nextResumeId) {
        toast.error(intakeT('form.error'));
        return;
      }

      if (payload.data?.parsedOnly) {
        toast.warning(intakeT('form.partial_success'));
      } else {
        toast.success(intakeT('form.success'));
      }

      resetUploadDraft();
      setIsUploadDialogOpen(false);
      router.push(`/activity?resumeId=${nextResumeId}`);
      router.refresh();
    });
  };

  const openSection = (section: EditorSection) => {
    setActiveSection(section);
    setWorkspaceMode('edit');
  };

  return (
    <div className="space-y-6 rounded-[2rem] bg-[#11192e] p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.22)] md:p-8">
      <div className="flex flex-row flex-wrap justify-start gap-3 py-1">
        <ToolbarGroup className="min-w-[200px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-12 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-semibold tracking-[0.04em] text-white uppercase"
                type="button"
              >
                <span className="truncate">{resumeBadgeLabel}</span>
                <ChevronDown className="size-4 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[320px] rounded-2xl border-white/10 bg-[#18233b] p-2 text-white">
              <DropdownMenuLabel className="px-3 text-xs font-semibold tracking-[0.08em] text-white/55 uppercase">
                {t('workspace.switcher_label')}
              </DropdownMenuLabel>
              {resumeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  className="rounded-xl px-3 py-3 text-white focus:bg-white/8 focus:text-white"
                  onClick={() => {
                    if (option.id !== resumeId) {
                      router.push(`/activity?resumeId=${option.id}`);
                    }
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{option.title}</p>
                    {option.targetRole ? (
                      <p className="truncate text-xs text-white/55">
                        {option.targetRole}
                      </p>
                    ) : null}
                  </div>
                  {option.id === resumeId ? (
                    <span className="rounded-full border border-white/12 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.08em] text-white/72 uppercase">
                      {t('workspace.switcher_current')}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="rounded-xl px-3 py-3 font-semibold text-white focus:bg-white/8 focus:text-white"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                {t('workspace.switcher_create')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolbarGroup>

        <ToolbarGroup>
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'contact'}
            label={t('tabs.contact')}
            onClick={() => openSection('contact')}
          />
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'experience'}
            label={t('tabs.experience')}
            onClick={() => openSection('experience')}
          />
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'education'}
            label={t('tabs.education')}
            onClick={() => openSection('education')}
          />
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'involvement'}
            label={t('tabs.involvement')}
            onClick={() => openSection('involvement')}
          />
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'skills'}
            label={t('tabs.skills')}
            onClick={() => openSection('skills')}
          />
          <WorkspaceTab
            active={workspaceMode === 'edit' && activeSection === 'summary'}
            label={t('tabs.summary')}
            onClick={() => openSection('summary')}
          />
          <button
            className="flex h-10 items-center justify-center rounded-xl px-3 text-white/80 transition hover:bg-white/8 hover:text-white"
            type="button"
          >
            <Ellipsis className="size-4" />
          </button>
        </ToolbarGroup>

        <ToolbarGroup>
          <WorkspaceTab
            active={workspaceMode === 'preview'}
            label={t('tabs.preview')}
            onClick={() => setWorkspaceMode('preview')}
          />
          <WorkspaceTab
            active={workspaceMode === 'cover-letter'}
            label={t('tabs.cover_letter')}
            onClick={() => setWorkspaceMode('cover-letter')}
          />
        </ToolbarGroup>

        <Button
          className="h-12 rounded-2xl bg-[#8f98ff] px-5 text-sm font-bold tracking-[0.04em] text-[#0b1020] uppercase hover:bg-[#a1a8ff]"
          type="button"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          {t('workspace.upload_resume')}
        </Button>
      </div>

      {workspaceMode === 'preview' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <PreviewSettingsToolbar
              isTailoring={isPending && activeAction === 'tailor'}
              resumeId={resumeId}
              settings={previewSettings}
              t={t}
              onAutoAdjust={() => void handleTailor()}
              onCycleAccentColor={() =>
                updatePreviewSettings({
                  accentColor: getNextValue(
                    colorOptions,
                    previewSettings.accentColor
                  ),
                })
              }
              onCycleFont={() => {
                const nextFont = getNextFont(previewSettings.fontLabel);
                updatePreviewSettings({
                  fontFamily: nextFont.value,
                  fontLabel: nextFont.label,
                });
              }}
              onCycleLineHeight={() =>
                updatePreviewSettings({
                  lineHeight: getNextValue(
                    lineHeightOptions,
                    previewSettings.lineHeight
                  ),
                })
              }
              onCycleSectionSpacing={() =>
                updatePreviewSettings({
                  sectionSpacing: getNextValue(
                    sectionSpacingOptions,
                    previewSettings.sectionSpacing
                  ),
                })
              }
              onCycleTextColor={() =>
                updatePreviewSettings({
                  textColor: getNextValue(
                    colorOptions,
                    previewSettings.textColor
                  ),
                })
              }
              onCycleZoom={() =>
                updatePreviewSettings({
                  zoom: getNextValue(zoomOptions, previewSettings.zoom),
                })
              }
              onDecreaseFont={() =>
                updatePreviewSettings({
                  fontSize: Math.max(8, previewSettings.fontSize - 1),
                })
              }
              onIncreaseFont={() =>
                updatePreviewSettings({
                  fontSize: Math.min(16, previewSettings.fontSize + 1),
                })
              }
              onToggleAvatar={() =>
                updatePreviewSettings({
                  showAvatar: !previewSettings.showAvatar,
                })
              }
              onToggleDivider={() =>
                updatePreviewSettings({
                  showDivider: !previewSettings.showDivider,
                })
              }
              onToggleIcons={() =>
                updatePreviewSettings({
                  showIcons: !previewSettings.showIcons,
                })
              }
              onTogglePagedView={() =>
                updatePreviewSettings({
                  pagedView: !previewSettings.pagedView,
                })
              }
            />

            <div className="rounded-[1.75rem] bg-[#202b43] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <EditableResumeDocument
                availability={availability}
                educationText={educationText}
                email={email}
                experienceText={experienceText}
                headline={headline}
                involvementText={involvementText}
                isSaving={isPending && activeAction === 'save'}
                location={location}
                name={name}
                onAddRawSection={addRawSection}
                onMoveSection={moveDocumentSection}
                onRemoveRawSection={removeRawSection}
                onSave={handleSave}
                onUpdateRawSection={updateRawSection}
                phone={phone}
                primaryLink={primaryLink}
                previewSettings={previewSettings}
                rawSections={rawSections}
                sectionOrder={sectionOrder}
                setEducationText={(value) =>
                  setEducationItems(parseEducationText(value, educationItems))
                }
                setExperienceText={(value) =>
                  setExperiences(parseExperienceText(value, experiences))
                }
                setHeadline={setHeadline}
                setInvolvementText={(value) =>
                  setStrengths(parseStrengthText(value))
                }
                setName={setName}
                setSkillsText={(value) =>
                  setSkillGroups(parseSkillsText(value))
                }
                setSummary={setSummary}
                skillsText={skillsText}
                summary={summary}
                t={t}
                wechat={wechat}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.6rem] border border-white/10 bg-[#26324a] p-6">
              <ScoreGauge
                score={matchScore}
                label={t('preview.score_label')}
                cta={t('preview.score_cta')}
              />
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-[#26324a] p-6">
              <h2 className="text-[1.55rem] font-semibold text-white">
                {t('preview.sidebar_title')}
              </h2>
              <div className="mt-8 space-y-5">
                <EditorField id="job-title" label={t('tailoring.role_label')}>
                  <Input
                    id="job-title"
                    className={darkInputClassName}
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                  />
                </EditorField>
                <EditorField
                  id="job-description"
                  label={t('tailoring.jd_label')}
                >
                  <Textarea
                    id="job-description"
                    className={cn(darkInputClassName, 'min-h-52 py-3')}
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                  />
                </EditorField>
                <Button
                  className="h-14 w-full rounded-xl bg-[#8f98ff] text-base font-bold tracking-[0.04em] text-[#0b1020] uppercase hover:bg-[#a1a8ff]"
                  disabled={isPending}
                  type="button"
                  onClick={() => void handleTailor()}
                >
                  {isPending && activeAction === 'tailor'
                    ? t('tailoring.pending')
                    : t('preview.save_job')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : workspaceMode === 'cover-letter' ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-[#26324a] p-8">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-semibold text-white">
              {t('cover_letter.title')}
            </h2>
            <p className="text-base leading-8 text-white/70">
              {t('cover_letter.description')}
            </p>
            <div className="rounded-2xl border border-dashed border-white/12 bg-[#202b43] p-6 text-sm leading-7 text-white/72">
              {summary || headline || name}
            </div>
          </div>
        </div>
      ) : (
        <StructuredResumeSectionEditor
          activeEducationIndex={activeEducationIndex}
          activeExperienceIndex={activeExperienceIndex}
          activeSection={activeSection}
          activeSkillIndex={activeSkillIndex}
          activeStrengthIndex={activeStrengthIndex}
          availability={availability}
          educationItems={educationItems}
          email={email}
          experiences={experiences}
          headline={headline}
          isSaving={isPending && activeAction === 'save'}
          location={location}
          name={name}
          onAddEducation={addEducation}
          onAddExperience={addExperience}
          onAddSkillGroup={addSkillGroup}
          onAddStrength={addStrength}
          onRemoveEducation={removeEducation}
          onRemoveExperience={removeExperience}
          onRemoveSkillGroup={removeSkillGroup}
          onRemoveStrength={removeStrength}
          onSave={handleSave}
          onSelectEducation={setActiveEducationIndex}
          onSelectExperience={setActiveExperienceIndex}
          onSelectSkillGroup={setActiveSkillIndex}
          onSelectStrength={setActiveStrengthIndex}
          onUpdateEducation={updateEducation}
          onUpdateEducationDate={updateEducationDate}
          onUpdateExperience={updateExperience}
          onUpdateExperienceDate={updateExperienceDate}
          onUpdateSkillGroup={updateSkillGroup}
          onUpdateStrength={updateStrength}
          phone={phone}
          primaryLink={primaryLink}
          setAvailability={setAvailability}
          setEmail={setEmail}
          setHeadline={setHeadline}
          setLocation={setLocation}
          setName={setName}
          setPhone={setPhone}
          setPrimaryLink={setPrimaryLink}
          setSummary={setSummary}
          skillGroups={skillGroups}
          strengths={strengths}
          summary={summary}
          t={t}
        />
      )}

      <Dialog
        open={isUploadDialogOpen}
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open);
          if (!open) {
            resetUploadDraft();
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-[1.8rem] border-white/10 bg-[#18233b] p-0 text-white shadow-[0_32px_96px_rgba(2,6,23,0.35)] sm:max-w-2xl">
          <DialogHeader className="border-b border-white/10 px-6 py-5 text-left">
            <DialogTitle className="text-2xl font-semibold text-white">
              {intakeT('form.title')}
            </DialogTitle>
            <DialogDescription className="text-sm leading-7 text-white/65">
              {intakeT('form.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <EditorField
              id="upload-resume-file"
              label={intakeT('form.resume_label')}
            >
              <Input
                id="upload-resume-file"
                accept={acceptedResumeFormats}
                className={cn(darkInputClassName, 'file:text-white')}
                type="file"
                onChange={(event) =>
                  setNewResumeFile(event.target.files?.[0] || null)
                }
              />
            </EditorField>
            <EditorField id="upload-role" label={intakeT('form.role_label')}>
              <Input
                id="upload-role"
                className={darkInputClassName}
                value={newTargetRole}
                onChange={(event) => setNewTargetRole(event.target.value)}
              />
            </EditorField>
            <EditorField id="upload-jd" label={intakeT('form.jd_label')}>
              <Textarea
                id="upload-jd"
                className={cn(darkInputClassName, 'min-h-44 py-3')}
                value={newJobDescription}
                onChange={(event) => setNewJobDescription(event.target.value)}
              />
            </EditorField>
            <EditorField
              id="upload-jd-file"
              label={intakeT('form.jd_file_label')}
            >
              <Input
                id="upload-jd-file"
                accept={acceptedJobDescriptionFormats}
                className={cn(darkInputClassName, 'file:text-white')}
                type="file"
                onChange={(event) =>
                  setNewJdFile(event.target.files?.[0] || null)
                }
              />
            </EditorField>
            <div className="flex justify-end">
              <Button
                className="h-14 rounded-xl bg-[#8f98ff] px-8 text-base font-bold tracking-[0.04em] text-[#0b1020] uppercase hover:bg-[#a1a8ff]"
                disabled={isPending}
                type="button"
                onClick={() => void handleCreateResume()}
              >
                {isPending && activeAction === 'intake'
                  ? intakeT('form.pending')
                  : t('workspace.submit_resume')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type EditorTranslation = (
  key: string,
  values?: Record<string, string | number>
) => string;

function EditableResumeDocument({
  name,
  headline,
  email,
  phone,
  wechat,
  location,
  availability,
  primaryLink,
  previewSettings,
  summary,
  experienceText,
  educationText,
  involvementText,
  skillsText,
  rawSections,
  sectionOrder,
  isSaving,
  t,
  setName,
  setHeadline,
  setSummary,
  setExperienceText,
  setEducationText,
  setInvolvementText,
  setSkillsText,
  onMoveSection,
  onAddRawSection,
  onUpdateRawSection,
  onRemoveRawSection,
  onSave,
}: {
  name: string;
  headline: string;
  email: string;
  phone: string;
  wechat: string;
  location: string;
  availability: string;
  primaryLink: string;
  previewSettings: ResumePreviewSettings;
  summary: string;
  experienceText: string;
  educationText: string;
  involvementText: string;
  skillsText: string;
  rawSections: StructuredResume['rawSections'];
  sectionOrder: string[];
  isSaving: boolean;
  t: EditorTranslation;
  setName: (value: string) => void;
  setHeadline: (value: string) => void;
  setSummary: (value: string) => void;
  setExperienceText: (value: string) => void;
  setEducationText: (value: string) => void;
  setInvolvementText: (value: string) => void;
  setSkillsText: (value: string) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onAddRawSection: () => void;
  onUpdateRawSection: (
    index: number,
    values: Partial<StructuredResume['rawSections'][number]>
  ) => void;
  onRemoveRawSection: (index: number) => void;
  onSave: () => void;
}) {
  const orderedSections = normalizeDocumentSectionOrder(sectionOrder);
  const contactItems = [
    location,
    email,
    phone,
    wechat ? `WeChat: ${wechat}` : '',
    primaryLink,
    availability,
  ].filter(Boolean);
  const contactLine = compactJoin(contactItems, '  ·  ');
  const previewWidth = Math.round(794 * (previewSettings.zoom / 100));
  const sectionGap = `${previewSettings.sectionSpacing}rem`;

  const renderSectionBody = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return (
          <DocumentTextarea
            ariaLabel={t('tabs.summary')}
            lineHeight={previewSettings.lineHeight}
            minRows={3}
            textColor={previewSettings.textColor}
            value={summary}
            onChange={setSummary}
          />
        );
      case 'experience':
        return (
          <DocumentTextarea
            ariaLabel={t('sections.experience')}
            lineHeight={previewSettings.lineHeight}
            minRows={10}
            textColor={previewSettings.textColor}
            value={experienceText}
            onChange={setExperienceText}
          />
        );
      case 'education':
        return (
          <DocumentTextarea
            ariaLabel={t('sections.education')}
            lineHeight={previewSettings.lineHeight}
            minRows={6}
            textColor={previewSettings.textColor}
            value={educationText}
            onChange={setEducationText}
          />
        );
      case 'involvement':
        return (
          <DocumentTextarea
            ariaLabel={t('sections.involvement')}
            lineHeight={previewSettings.lineHeight}
            minRows={5}
            textColor={previewSettings.textColor}
            value={involvementText}
            onChange={setInvolvementText}
          />
        );
      case 'skills':
        return (
          <DocumentTextarea
            ariaLabel={t('sections.skills')}
            lineHeight={previewSettings.lineHeight}
            minRows={5}
            textColor={previewSettings.textColor}
            value={skillsText}
            onChange={setSkillsText}
          />
        );
      case 'rawSections':
        return (
          <div className="space-y-4">
            {rawSections.map((section, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    className={documentInputClassName}
                    placeholder={t('document.custom_title_placeholder')}
                    value={section.title}
                    onChange={(event) =>
                      onUpdateRawSection(index, {
                        title: event.target.value,
                      })
                    }
                  />
                  <button
                    aria-label={`${t('document.remove')} ${section.title || t('document.custom_section')}`}
                    className="rounded-md p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    type="button"
                    onClick={() => onRemoveRawSection(index)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <DocumentTextarea
                  ariaLabel={section.title || t('document.custom_section')}
                  className="mt-3"
                  lineHeight={previewSettings.lineHeight}
                  minRows={4}
                  placeholder={t('document.custom_content_placeholder')}
                  textColor={previewSettings.textColor}
                  value={section.content}
                  onChange={(value) =>
                    onUpdateRawSection(index, {
                      content: value,
                    })
                  }
                />
              </div>
            ))}
            <button
              className="flex h-11 items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
              type="button"
              onClick={onAddRawSection}
            >
              <Plus className="size-4" />
              {t('document.add_section')}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div data-testid="resume-document-editor" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-white/45 uppercase">
            {t('preview.template')}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {t('preview.save_document')}
          </p>
        </div>
        <Button
          className="h-11 rounded-xl bg-[#8f98ff] px-5 text-sm font-bold tracking-[0.04em] text-[#0b1020] uppercase hover:bg-[#a1a8ff]"
          disabled={isSaving}
          type="button"
          onClick={onSave}
        >
          {isSaving ? t('saving') : t('preview.save_document')}
        </Button>
      </div>

      <div
        data-format="a4"
        data-testid="resume-template-preview"
        className={cn(
          'mx-auto aspect-[210/297] w-full max-w-[794px] overflow-y-auto rounded-sm bg-white px-8 py-10 text-slate-800 md:px-14 md:py-14',
          previewSettings.pagedView
            ? 'shadow-[0_18px_60px_rgba(15,23,42,0.22)]'
            : 'shadow-none'
        )}
        style={{
          color: previewSettings.textColor,
          fontFamily: previewSettings.fontFamily,
          fontSize: `${previewSettings.fontSize}pt`,
          lineHeight: previewSettings.lineHeight,
          maxWidth: `${previewWidth}px`,
        }}
      >
        <header
          className={cn(
            'pb-7 text-center',
            previewSettings.showDivider ? 'border-b' : ''
          )}
          style={{
            borderColor: previewSettings.accentColor,
          }}
        >
          {previewSettings.showAvatar ? (
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ backgroundColor: previewSettings.accentColor }}
            >
              {(name || 'R').slice(0, 1).toUpperCase()}
            </div>
          ) : null}
          <input
            aria-label={t('fields.name')}
            className="w-full bg-transparent text-center text-[2.3rem] font-semibold text-slate-950 outline-none focus:ring-2 focus:ring-[#8f98ff]/30"
            style={{ color: previewSettings.textColor }}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            aria-label={t('fields.headline')}
            className="mt-3 w-full bg-transparent text-center text-[1.05rem] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#8f98ff]/30"
            style={{ color: previewSettings.textColor }}
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
          {contactItems.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
              {contactItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5"
                  style={{ color: previewSettings.textColor }}
                >
                  {previewSettings.showIcons ? (
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: previewSettings.accentColor }}
                    />
                  ) : null}
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p
              className="mt-4 text-sm whitespace-pre-wrap"
              style={{ color: previewSettings.textColor }}
            >
              {contactLine || t('document.contact')}
            </p>
          )}
        </header>

        <div className="pt-7">
          {orderedSections.map((sectionId, index) => {
            const label = getDocumentSectionLabel(sectionId, t);
            const body = renderSectionBody(sectionId);

            if (!body) {
              return null;
            }

            return (
              <section
                key={sectionId}
                className="group rounded-lg border border-transparent p-2 transition hover:border-slate-200 hover:bg-slate-50/70"
                style={{
                  marginTop: index === 0 ? 0 : sectionGap,
                }}
              >
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 pb-1',
                    previewSettings.showDivider ? 'border-b' : ''
                  )}
                  style={{ borderColor: previewSettings.accentColor }}
                >
                  <h3
                    className="text-[1.05rem] font-semibold tracking-[0.04em] uppercase"
                    style={{ color: previewSettings.accentColor }}
                  >
                    {label}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                    <button
                      aria-label={`${t('document.move_up')} ${label}`}
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={index === 0}
                      type="button"
                      onClick={() => onMoveSection(sectionId, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      aria-label={`${t('document.move_down')} ${label}`}
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={index === orderedSections.length - 1}
                      type="button"
                      onClick={() => onMoveSection(sectionId, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="pt-3">{body}</div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DocumentTextarea({
  ariaLabel,
  value,
  onChange,
  minRows,
  placeholder,
  className,
  lineHeight,
  textColor,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  minRows: number;
  placeholder?: string;
  className?: string;
  lineHeight?: number;
  textColor?: string;
}) {
  return (
    <textarea
      aria-label={ariaLabel}
      className={cn(
        'w-full resize-y rounded-md border border-transparent bg-transparent p-1 text-[0.98rem] leading-7 text-slate-800 transition outline-none placeholder:text-slate-400 hover:border-slate-200 hover:bg-white focus:border-[#8f98ff] focus:bg-white focus:ring-2 focus:ring-[#8f98ff]/20',
        className
      )}
      placeholder={placeholder}
      rows={minRows}
      style={{
        color: textColor,
        lineHeight,
      }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function PreviewSettingsToolbar({
  isTailoring,
  resumeId,
  settings,
  t,
  onAutoAdjust,
  onCycleAccentColor,
  onCycleFont,
  onCycleLineHeight,
  onCycleSectionSpacing,
  onCycleTextColor,
  onCycleZoom,
  onDecreaseFont,
  onIncreaseFont,
  onToggleAvatar,
  onToggleDivider,
  onToggleIcons,
  onTogglePagedView,
}: {
  isTailoring: boolean;
  resumeId: string;
  settings: ResumePreviewSettings;
  t: EditorTranslation;
  onAutoAdjust: () => void;
  onCycleAccentColor: () => void;
  onCycleFont: () => void;
  onCycleLineHeight: () => void;
  onCycleSectionSpacing: () => void;
  onCycleTextColor: () => void;
  onCycleZoom: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
  onToggleAvatar: () => void;
  onToggleDivider: () => void;
  onToggleIcons: () => void;
  onTogglePagedView: () => void;
}) {
  return (
    <div
      data-testid="resume-preview-settings"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
    >
      <div className="flex flex-col items-start justify-between gap-4 px-6 py-4 xl:flex-row xl:items-center xl:gap-2">
        <div className="flex flex-row flex-wrap items-center justify-start gap-2">
          <PreviewToolbarButton
            icon={Sparkles}
            label={
              isTailoring ? t('tailoring.pending') : t('preview.auto_adjust')
            }
            onClick={onAutoAdjust}
          />
          <PreviewToolbarButton
            active
            icon={SlidersHorizontal}
            label={t('preview.adjustments')}
          />
          <PreviewToolbarButton icon={FileText} label={t('preview.template')} />
        </div>

        <div className="flex flex-row items-center justify-start gap-2 xl:justify-end">
          <PreviewToolbarButton
            icon={Lock}
            label={t('preview.share')}
            variant="secondary"
          />
          <div className="relative flex flex-nowrap gap-x-px">
            <a
              className="inline-flex min-h-8 items-center justify-center gap-1 rounded-l-md bg-[#4d70eb] px-3 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition hover:bg-[#3d60db]"
              href={`/api/resume/export?resumeId=${resumeId}&format=pdf`}
            >
              <FileText className="size-[18px]" />
              {t('actions.pdf')}
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t('actions.docx')}
                  className="inline-flex min-h-8 w-8 items-center justify-center rounded-r-md bg-[#4d70eb] text-white transition hover:bg-[#3d60db]"
                  type="button"
                >
                  <ChevronDown className="size-[18px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem asChild>
                  <a
                    href={`/api/resume/export?resumeId=${resumeId}&format=docx`}
                  >
                    <ArrowDownToLine className="size-4" />
                    {t('actions.docx')}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-y-2 border-t border-slate-200 bg-slate-50 px-6 py-2 font-semibold select-none">
        <div className="flex space-x-1">
          <PreviewIconButton
            active={settings.showIcons}
            icon={Image}
            label={t('preview_settings.icons')}
            onClick={onToggleIcons}
          />
          <PreviewIconButton
            active={settings.showAvatar}
            icon={User}
            label={t('preview_settings.avatar')}
            onClick={onToggleAvatar}
          />
        </div>
        <PreviewToolbarDivider />
        <PreviewValueButton
          icon={Type}
          label={t('preview_settings.font')}
          value={settings.fontLabel}
          onClick={onCycleFont}
        />
        <PreviewToolbarDivider />
        <div className="flex items-center">
          <PreviewIconButton
            icon={Minus}
            label={t('preview_settings.decrease_font')}
            onClick={onDecreaseFont}
          />
          <div className="w-7 text-center text-xs">{settings.fontSize}</div>
          <PreviewIconButton
            icon={Plus}
            label={t('preview_settings.increase_font')}
            onClick={onIncreaseFont}
          />
        </div>
        <PreviewToolbarDivider />
        <PreviewValueButton
          icon={Rows3}
          label={t('preview_settings.line_height')}
          value={settings.lineHeight.toFixed(2).replace(/0$/, '')}
          onClick={onCycleLineHeight}
        />
        <PreviewValueButton
          icon={SlidersHorizontal}
          label={t('preview_settings.section_spacing')}
          value={settings.sectionSpacing.toFixed(2).replace(/0$/, '')}
          onClick={onCycleSectionSpacing}
        />
        <div className="flex space-x-1">
          <PreviewIconButton
            icon={IndentIncrease}
            label={t('preview_settings.indent')}
          />
          <PreviewIconButton
            active={settings.showDivider}
            icon={Minus}
            label={t('preview_settings.divider')}
            onClick={onToggleDivider}
          />
        </div>
        <PreviewToolbarDivider />
        <PreviewTextButton label={t('preview_settings.page_size')} value="A4" />
        <PreviewTextButton
          label={t('preview_settings.zoom')}
          value={`${settings.zoom}%`}
          onClick={onCycleZoom}
        />
        <PreviewToolbarDivider />
        <PreviewColorButton
          color={settings.textColor}
          icon={Baseline}
          label={t('preview_settings.text_color')}
          onClick={onCycleTextColor}
        />
        <PreviewColorButton
          color={settings.accentColor}
          icon={Palette}
          label={t('preview_settings.accent_color')}
          onClick={onCycleAccentColor}
        />
        <PreviewToolbarDivider />
        <label className="flex h-8 cursor-pointer items-center gap-2 px-3 text-xs font-bold uppercase">
          <span
            className={cn(
              'relative flex h-3.5 w-7 items-center rounded-full p-[0.19rem] transition',
              settings.pagedView ? 'bg-[#4d70eb]' : 'bg-slate-300'
            )}
          >
            <span
              className={cn(
                'absolute size-2 rounded-full bg-white transition',
                settings.pagedView ? 'right-[0.19rem]' : 'left-[0.19rem]'
              )}
            />
            <input
              checked={settings.pagedView}
              className="absolute inset-0 cursor-pointer opacity-0"
              type="checkbox"
              onChange={onTogglePagedView}
            />
          </span>
          {t('preview_settings.paged_view')}
        </label>
      </div>
    </div>
  );
}

function PreviewToolbarButton({
  icon: Icon,
  label,
  active,
  variant = 'default',
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  variant?: 'default' | 'secondary';
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        'inline-flex min-h-8 items-center justify-center gap-1 rounded-md border px-3 py-1 text-xs font-bold whitespace-nowrap uppercase transition',
        active
          ? 'border-slate-300 bg-slate-100 text-slate-950'
          : 'border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100',
        variant === 'secondary' ? 'bg-white' : ''
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className="size-[18px]" />
      <span className="px-1">{label}</span>
    </button>
  );
}

function PreviewIconButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex min-h-8 w-8 items-center justify-center rounded-md bg-transparent text-slate-900 transition hover:bg-slate-200/70',
        active ? 'bg-blue-100 text-blue-800' : ''
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function PreviewValueButton({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-slate-900 uppercase transition hover:bg-slate-200/70"
      type="button"
      onClick={onClick}
    >
      <Icon className="mr-1 size-[18px]" />
      <span className="min-w-8 truncate px-1 text-center">{value}</span>
      <ChevronDown className="size-[18px]" />
    </button>
  );
}

function PreviewTextButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-slate-900 uppercase transition hover:bg-slate-200/70"
      type="button"
      onClick={onClick}
    >
      <span className="min-w-8 truncate px-1 text-center">{value}</span>
      <ChevronDown className="size-[18px]" />
    </button>
  );
}

function PreviewColorButton({
  color,
  icon: Icon,
  label,
  onClick,
}: {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 items-center rounded-md px-2 text-slate-900 transition hover:bg-slate-200/70"
      type="button"
      onClick={onClick}
    >
      <span className="relative size-[18px]">
        <Icon className="size-[18px]" />
        <span
          className="absolute -bottom-1 left-0 h-1.5 w-5 border border-slate-300"
          style={{ backgroundColor: color }}
        />
      </span>
      <ChevronDown className="ml-1 size-[18px]" />
    </button>
  );
}

function PreviewToolbarDivider() {
  return <hr className="mx-1 h-6 border-l border-slate-300" />;
}

function ToolbarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-fit items-center gap-1 rounded-2xl border border-white/14 bg-[#18233b] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        className
      )}
    >
      {children}
    </div>
  );
}

function WorkspaceTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'flex h-10 items-center rounded-xl px-4 text-sm font-semibold tracking-[0.04em] text-white/90 uppercase transition',
        active
          ? 'bg-[#8f98ff] text-[#0b1020]'
          : 'hover:bg-white/8 hover:text-white'
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EditorField({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <label
        className="block text-sm font-semibold tracking-[0.04em] text-white uppercase"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StructuredResumeSectionEditor({
  activeSection,
  activeExperienceIndex,
  activeEducationIndex,
  activeSkillIndex,
  activeStrengthIndex,
  name,
  email,
  phone,
  headline,
  primaryLink,
  location,
  availability,
  summary,
  experiences,
  educationItems,
  skillGroups,
  strengths,
  isSaving,
  t,
  setName,
  setEmail,
  setPhone,
  setHeadline,
  setPrimaryLink,
  setLocation,
  setAvailability,
  setSummary,
  onSave,
  onSelectExperience,
  onUpdateExperience,
  onUpdateExperienceDate,
  onAddExperience,
  onRemoveExperience,
  onSelectEducation,
  onUpdateEducation,
  onUpdateEducationDate,
  onAddEducation,
  onRemoveEducation,
  onSelectSkillGroup,
  onUpdateSkillGroup,
  onAddSkillGroup,
  onRemoveSkillGroup,
  onSelectStrength,
  onUpdateStrength,
  onAddStrength,
  onRemoveStrength,
}: {
  activeSection: EditorSection;
  activeExperienceIndex: number;
  activeEducationIndex: number;
  activeSkillIndex: number;
  activeStrengthIndex: number;
  name: string;
  email: string;
  phone: string;
  headline: string;
  primaryLink: string;
  location: string;
  availability: string;
  summary: string;
  experiences: ResumeExperienceItem[];
  educationItems: ResumeEducationItem[];
  skillGroups: ResumeSkillGroup[];
  strengths: ResumeStrengthItem[];
  isSaving: boolean;
  t: EditorTranslation;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setHeadline: (value: string) => void;
  setPrimaryLink: (value: string) => void;
  setLocation: (value: string) => void;
  setAvailability: (value: string) => void;
  setSummary: (value: string) => void;
  onSave: () => void;
  onSelectExperience: (index: number) => void;
  onUpdateExperience: (
    index: number,
    values: Partial<ResumeExperienceItem>
  ) => void;
  onUpdateExperienceDate: (
    index: number,
    field: keyof ResumeExperienceItem['dateRange'],
    value: string
  ) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  onSelectEducation: (index: number) => void;
  onUpdateEducation: (
    index: number,
    values: Partial<ResumeEducationItem>
  ) => void;
  onUpdateEducationDate: (
    index: number,
    field: keyof ResumeEducationItem['dateRange'],
    value: string
  ) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
  onSelectSkillGroup: (index: number) => void;
  onUpdateSkillGroup: (
    index: number,
    values: Partial<ResumeSkillGroup>
  ) => void;
  onAddSkillGroup: () => void;
  onRemoveSkillGroup: (index: number) => void;
  onSelectStrength: (index: number) => void;
  onUpdateStrength: (
    index: number,
    values: Partial<ResumeStrengthItem>
  ) => void;
  onAddStrength: () => void;
  onRemoveStrength: (index: number) => void;
}) {
  const activeExperience = experiences[activeExperienceIndex];
  const activeEducation = educationItems[activeEducationIndex];
  const activeSkill = skillGroups[activeSkillIndex];
  const activeStrength = strengths[activeStrengthIndex];

  return (
    <div
      data-testid="structured-section-editor"
      className="rounded-[1.75rem] border border-white/10 bg-[#26324a] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:p-8"
    >
      {activeSection === 'contact' ? (
        <StructuredPanel title={t('tabs.contact')}>
          <div className="grid gap-6 md:grid-cols-2">
            <StructuredInput
              id="full-name"
              label={t('fields.name')}
              value={name}
              onChange={setName}
            />
            <StructuredInput
              id="email-address"
              label={t('fields.email')}
              value={email}
              onChange={setEmail}
            />
            <StructuredInput
              id="phone-number"
              label={t('fields.phone')}
              value={phone}
              onChange={setPhone}
            />
            <StructuredInput
              id="headline"
              label={t('fields.headline')}
              value={headline}
              onChange={setHeadline}
            />
            <StructuredInput
              className="md:col-span-2"
              id="primary-link"
              label={t('fields.primary_link')}
              value={primaryLink}
              onChange={setPrimaryLink}
            />
            <StructuredInput
              id="city"
              label={t('fields.location')}
              value={location}
              onChange={setLocation}
            />
            <StructuredInput
              id="availability"
              label={t('fields.availability')}
              value={availability}
              onChange={setAvailability}
            />
          </div>
          <SaveSectionButton
            isSaving={isSaving}
            label={t('structured.actions.save_contact')}
            savingLabel={t('saving')}
            onSave={onSave}
          />
        </StructuredPanel>
      ) : activeSection === 'experience' ? (
        <StructuredPanel title={t('structured.experience_title')}>
          <ItemSelector
            activeIndex={activeExperienceIndex}
            addLabel={t('structured.add_experience')}
            getLabel={(item: ResumeExperienceItem, index) =>
              item.role ||
              item.company ||
              `${t('sections.experience')} ${index + 1}`
            }
            items={experiences}
            onAdd={onAddExperience}
            onSelect={onSelectExperience}
          />
          {activeExperience ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <StructuredInput
                  id="experience-role"
                  label={t('structured.fields.role')}
                  value={activeExperience.role}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, { role: value })
                  }
                />
                <StructuredInput
                  id="experience-company"
                  label={t('structured.fields.company')}
                  value={activeExperience.company}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, {
                      company: value,
                    })
                  }
                />
                <StructuredInput
                  id="experience-team"
                  label={t('structured.fields.team')}
                  value={activeExperience.team}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, { team: value })
                  }
                />
                <StructuredInput
                  id="experience-location"
                  label={t('structured.fields.location')}
                  value={activeExperience.location}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, {
                      location: value,
                    })
                  }
                />
                <StructuredInput
                  id="experience-start"
                  label={t('structured.fields.start_date')}
                  value={activeExperience.dateRange.start}
                  onChange={(value) =>
                    onUpdateExperienceDate(
                      activeExperienceIndex,
                      'start',
                      value
                    )
                  }
                />
                <StructuredInput
                  id="experience-end"
                  label={t('structured.fields.end_date')}
                  value={activeExperience.dateRange.end}
                  onChange={(value) =>
                    onUpdateExperienceDate(activeExperienceIndex, 'end', value)
                  }
                />
                <StructuredInput
                  className="md:col-span-2"
                  id="experience-mix"
                  label={t('structured.fields.responsibility_mix')}
                  value={activeExperience.responsibilityMix}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, {
                      responsibilityMix: value,
                    })
                  }
                />
                <StructuredTextarea
                  className="md:col-span-2"
                  id="experience-bullets"
                  label={t('structured.fields.bullets')}
                  minRows={8}
                  value={activeExperience.bullets.join('\n')}
                  onChange={(value) =>
                    onUpdateExperience(activeExperienceIndex, {
                      bullets: splitEditableLines(value),
                    })
                  }
                />
              </div>
              <StructuredFooter
                isSaving={isSaving}
                removeLabel={t('structured.remove_item')}
                saveLabel={t('structured.actions.save_experience')}
                savingLabel={t('saving')}
                onRemove={() => onRemoveExperience(activeExperienceIndex)}
                onSave={onSave}
              />
            </>
          ) : null}
        </StructuredPanel>
      ) : activeSection === 'education' ? (
        <StructuredPanel title={t('structured.education_title')}>
          <ItemSelector
            activeIndex={activeEducationIndex}
            addLabel={t('structured.add_education')}
            getLabel={(item: ResumeEducationItem, index) =>
              item.degree ||
              item.school ||
              `${t('sections.education')} ${index + 1}`
            }
            items={educationItems}
            onAdd={onAddEducation}
            onSelect={onSelectEducation}
          />
          {activeEducation ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <StructuredInput
                  id="education-degree"
                  label={t('structured.fields.degree')}
                  value={activeEducation.degree}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, { degree: value })
                  }
                />
                <StructuredInput
                  id="education-school"
                  label={t('structured.fields.school')}
                  value={activeEducation.school}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, { school: value })
                  }
                />
                <StructuredInput
                  className="md:col-span-2"
                  id="education-major"
                  label={t('structured.fields.major')}
                  value={activeEducation.major}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, { major: value })
                  }
                />
                <StructuredInput
                  id="education-start"
                  label={t('structured.fields.start_date')}
                  value={activeEducation.dateRange.start}
                  onChange={(value) =>
                    onUpdateEducationDate(activeEducationIndex, 'start', value)
                  }
                />
                <StructuredInput
                  id="education-end"
                  label={t('structured.fields.end_date')}
                  value={activeEducation.dateRange.end}
                  onChange={(value) =>
                    onUpdateEducationDate(activeEducationIndex, 'end', value)
                  }
                />
                <StructuredInput
                  className="md:col-span-2"
                  id="education-ranking"
                  label={t('structured.fields.ranking')}
                  value={activeEducation.ranking}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, { ranking: value })
                  }
                />
                <StructuredTextarea
                  id="education-honors"
                  label={t('structured.fields.honors')}
                  minRows={5}
                  value={activeEducation.honors.join('\n')}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, {
                      honors: splitEditableLines(value),
                    })
                  }
                />
                <StructuredTextarea
                  id="education-bullets"
                  label={t('structured.fields.bullets')}
                  minRows={5}
                  value={activeEducation.bullets.join('\n')}
                  onChange={(value) =>
                    onUpdateEducation(activeEducationIndex, {
                      bullets: splitEditableLines(value),
                    })
                  }
                />
              </div>
              <StructuredFooter
                isSaving={isSaving}
                removeLabel={t('structured.remove_item')}
                saveLabel={t('structured.actions.save_education')}
                savingLabel={t('saving')}
                onRemove={() => onRemoveEducation(activeEducationIndex)}
                onSave={onSave}
              />
            </>
          ) : null}
        </StructuredPanel>
      ) : activeSection === 'skills' ? (
        <StructuredPanel title={t('structured.skills_title')}>
          <ItemSelector
            activeIndex={activeSkillIndex}
            addLabel={t('structured.add_skill')}
            getLabel={(item: ResumeSkillGroup, index) =>
              item.group || `${t('sections.skills')} ${index + 1}`
            }
            items={skillGroups}
            onAdd={onAddSkillGroup}
            onSelect={onSelectSkillGroup}
          />
          {activeSkill ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <StructuredInput
                  id="skill-group"
                  label={t('structured.fields.skill_group')}
                  value={activeSkill.group}
                  onChange={(value) =>
                    onUpdateSkillGroup(activeSkillIndex, { group: value })
                  }
                />
                <StructuredInput
                  id="skill-summary"
                  label={t('structured.fields.skill_summary')}
                  value={activeSkill.summary}
                  onChange={(value) =>
                    onUpdateSkillGroup(activeSkillIndex, { summary: value })
                  }
                />
                <StructuredTextarea
                  className="md:col-span-2"
                  id="skill-items"
                  label={t('structured.fields.items')}
                  minRows={7}
                  value={activeSkill.items.join('\n')}
                  onChange={(value) =>
                    onUpdateSkillGroup(activeSkillIndex, {
                      items: splitEditableLines(value),
                    })
                  }
                />
              </div>
              <StructuredFooter
                isSaving={isSaving}
                removeLabel={t('structured.remove_item')}
                saveLabel={t('structured.actions.save_skills')}
                savingLabel={t('saving')}
                onRemove={() => onRemoveSkillGroup(activeSkillIndex)}
                onSave={onSave}
              />
            </>
          ) : null}
        </StructuredPanel>
      ) : activeSection === 'involvement' ? (
        <StructuredPanel title={t('structured.involvement_title')}>
          <ItemSelector
            activeIndex={activeStrengthIndex}
            addLabel={t('structured.add_involvement')}
            getLabel={(item: ResumeStrengthItem, index) =>
              item.title || `${t('sections.involvement')} ${index + 1}`
            }
            items={strengths}
            onAdd={onAddStrength}
            onSelect={onSelectStrength}
          />
          {activeStrength ? (
            <>
              <div className="grid gap-6">
                <StructuredInput
                  id="strength-title"
                  label={t('structured.fields.strength_title')}
                  value={activeStrength.title}
                  onChange={(value) =>
                    onUpdateStrength(activeStrengthIndex, { title: value })
                  }
                />
                <StructuredTextarea
                  id="strength-description"
                  label={t('structured.fields.strength_description')}
                  minRows={8}
                  value={activeStrength.description}
                  onChange={(value) =>
                    onUpdateStrength(activeStrengthIndex, {
                      description: value,
                    })
                  }
                />
              </div>
              <StructuredFooter
                isSaving={isSaving}
                removeLabel={t('structured.remove_item')}
                saveLabel={t('structured.actions.save_involvement')}
                savingLabel={t('saving')}
                onRemove={() => onRemoveStrength(activeStrengthIndex)}
                onSave={onSave}
              />
            </>
          ) : null}
        </StructuredPanel>
      ) : (
        <StructuredPanel title={t('structured.summary_title')}>
          <StructuredTextarea
            id="summary-editor"
            label={t('fields.summary')}
            minRows={12}
            value={summary}
            onChange={setSummary}
          />
          <SaveSectionButton
            isSaving={isSaving}
            label={t('structured.actions.save_summary')}
            savingLabel={t('saving')}
            onSave={onSave}
          />
        </StructuredPanel>
      )}
    </div>
  );
}

function StructuredPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StructuredInput({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <EditorField className={className} id={id} label={label}>
      <Input
        id={id}
        className={darkInputClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </EditorField>
  );
}

function StructuredTextarea({
  id,
  label,
  value,
  onChange,
  minRows,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows: number;
  className?: string;
}) {
  return (
    <EditorField className={className} id={id} label={label}>
      <Textarea
        id={id}
        className={cn(darkInputClassName, 'h-auto min-h-36 resize-y py-4')}
        rows={minRows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </EditorField>
  );
}

function ItemSelector<T>({
  items,
  activeIndex,
  addLabel,
  getLabel,
  onSelect,
  onAdd,
}: {
  items: T[];
  activeIndex: number;
  addLabel: string;
  getLabel: (item: T, index: number) => string;
  onSelect: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={index}
          className={cn(
            'rounded-xl border px-4 py-2 text-sm font-semibold transition',
            index === activeIndex
              ? 'border-[#8f98ff] bg-[#8f98ff] text-[#0b1020]'
              : 'border-white/12 bg-[#202b43] text-white/75 hover:bg-white/6 hover:text-white'
          )}
          type="button"
          onClick={() => onSelect(index)}
        >
          {getLabel(item, index)}
        </button>
      ))}
      <button
        className="flex items-center gap-2 rounded-xl border border-dashed border-white/18 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-white/32 hover:text-white"
        type="button"
        onClick={onAdd}
      >
        <Plus className="size-4" />
        {addLabel}
      </button>
    </div>
  );
}

function StructuredFooter({
  saveLabel,
  savingLabel,
  removeLabel,
  isSaving,
  onSave,
  onRemove,
}: {
  saveLabel: string;
  savingLabel: string;
  removeLabel: string;
  isSaving: boolean;
  onSave: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button
        className="h-12 rounded-xl border border-white/12 bg-transparent px-5 text-sm font-bold tracking-[0.04em] text-white uppercase hover:bg-white/6"
        type="button"
        variant="outline"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
        {removeLabel}
      </Button>
      <SaveSectionButton
        isSaving={isSaving}
        label={saveLabel}
        savingLabel={savingLabel}
        onSave={onSave}
      />
    </div>
  );
}

function SaveSectionButton({
  label,
  savingLabel,
  isSaving,
  onSave,
}: {
  label: string;
  savingLabel: string;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end">
      <Button
        className="h-14 rounded-xl bg-[#8f98ff] px-8 text-base font-bold tracking-[0.04em] text-[#0b1020] uppercase hover:bg-[#a1a8ff]"
        disabled={isSaving}
        type="button"
        onClick={onSave}
      >
        {isSaving ? savingLabel : label}
      </Button>
    </div>
  );
}

function ScoreGauge({
  score,
  label,
  cta,
}: {
  score: number;
  label: string;
  cta: string;
}) {
  const clamped = Math.max(0, Math.min(score, 100));
  const radius = 88;
  const startAngle = 180;
  const endAngle = 0;
  const angle = startAngle - (clamped / 100) * (startAngle - endAngle);

  return (
    <div className="space-y-5">
      <div className="relative flex items-center justify-center">
        <svg
          className="h-[180px] w-full max-w-[320px]"
          viewBox="0 0 240 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ArcPath color="#ff4b4b" end={145} radius={radius} start={180} />
          <ArcPath color="#ffab10" end={35} radius={radius} start={145} />
          <ArcPath color="#14c8c0" end={0} radius={radius} start={35} />
          <circle
            cx={polarToCartesian(120, 120, radius, angle).x}
            cy={polarToCartesian(120, 120, radius, angle).y}
            fill="#26324a"
            r="12"
            stroke="#f8fafc"
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <p className="text-6xl font-semibold text-white">
            {Math.round(clamped)}
          </p>
          <p className="mt-2 text-lg text-white/55">{label}</p>
        </div>
      </div>
      <Button
        className="h-14 w-full rounded-xl border border-white/14 bg-transparent text-base font-bold tracking-[0.04em] text-white uppercase hover:bg-white/6"
        type="button"
        variant="outline"
      >
        {cta}
      </Button>
    </div>
  );
}

function ArcPath({
  start,
  end,
  radius,
  color,
}: {
  start: number;
  end: number;
  radius: number;
  color: string;
}) {
  const path = describeArc(120, 120, radius, start, end);

  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth="20"
    />
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= -180 ? '1' : '0';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

function buildDraftResumeContent({
  initialContent,
  name,
  headline,
  email,
  phone,
  wechat,
  location,
  availability,
  primaryLink,
  summary,
  skillGroups,
  strengths,
  educationItems,
  experiences,
  rawSections,
  sectionOrder,
}: {
  initialContent: StructuredResume;
  name: string;
  headline: string;
  email: string;
  phone: string;
  wechat: string;
  location: string;
  availability: string;
  primaryLink: string;
  summary: string;
  skillGroups: ResumeSkillGroup[];
  strengths: ResumeStrengthItem[];
  educationItems: ResumeEducationItem[];
  experiences: ResumeExperienceItem[];
  rawSections: StructuredResume['rawSections'];
  sectionOrder: string[];
}): StructuredResume {
  const originalLinks = initialContent.basics.links || [];
  const remainingLinks = originalLinks.slice(1);

  return {
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
      links: [
        ...(primaryLink
          ? [
              {
                label: originalLinks[0]?.label || 'Portfolio',
                url: primaryLink,
              },
            ]
          : []),
        ...remainingLinks,
      ],
    },
    summary,
    sectionOrder: normalizeDocumentSectionOrder(sectionOrder),
    rawSections: rawSections
      .map((section) => ({
        title: section.title.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title || section.content),
    skills: skillGroups
      .map((item) => ({
        group: item.group.trim(),
        summary: item.summary.trim(),
        items: item.items.map((value) => value.trim()).filter(Boolean),
      }))
      .filter((item) => item.group || item.summary || item.items.length),
    strengths: strengths
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.title || item.description),
    education: educationItems
      .map((item) => ({
        school: item.school.trim(),
        degree: item.degree.trim(),
        major: item.major.trim(),
        dateRange: {
          start: item.dateRange.start.trim(),
          end: item.dateRange.end.trim(),
        },
        ranking: item.ranking.trim(),
        honors: item.honors.map((value) => value.trim()).filter(Boolean),
        bullets: item.bullets.map((value) => value.trim()).filter(Boolean),
      }))
      .filter(
        (item) =>
          item.school ||
          item.degree ||
          item.major ||
          item.dateRange.start ||
          item.dateRange.end ||
          item.ranking ||
          item.honors.length ||
          item.bullets.length
      ),
    experiences: experiences
      .map((item) => ({
        type: item.type,
        company: item.company.trim(),
        team: item.team.trim(),
        role: item.role.trim(),
        location: item.location.trim(),
        dateRange: {
          start: item.dateRange.start.trim(),
          end: item.dateRange.end.trim(),
        },
        responsibilityMix: item.responsibilityMix.trim(),
        bullets: item.bullets.map((value) => value.trim()).filter(Boolean),
        keywords: item.keywords.map((value) => value.trim()).filter(Boolean),
      }))
      .filter(
        (item) =>
          item.company ||
          item.team ||
          item.role ||
          item.location ||
          item.dateRange.start ||
          item.dateRange.end ||
          item.responsibilityMix ||
          item.bullets.length ||
          item.keywords.length
      ),
  };
}

function formatExperienceItems(items: ResumeExperienceItem[]) {
  return items
    .map((item) =>
      [
        compactJoin(
          [
            item.company,
            item.team,
            item.role,
            formatDateRange(item.dateRange.start, item.dateRange.end),
          ],
          ' | '
        ),
        item.responsibilityMix,
        ...item.bullets,
      ]
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n\n');
}

function formatEducationItems(items: ResumeEducationItem[]) {
  return items
    .map((item) =>
      [
        compactJoin(
          [
            item.school,
            item.degree,
            item.major,
            formatDateRange(item.dateRange.start, item.dateRange.end),
          ],
          ' | '
        ),
        item.ranking,
        ...item.honors,
        ...item.bullets,
      ]
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n\n');
}

function formatSkillGroups(items: ResumeSkillGroup[]) {
  return items
    .map((item) =>
      `${item.group}: ${item.summary}${item.items.length ? ` (${item.items.join(' / ')})` : ''}`.trim()
    )
    .filter(Boolean)
    .join('\n');
}

function formatStrengthItems(items: ResumeStrengthItem[]) {
  return items
    .map((item) => compactJoin([item.title, item.description], ': '))
    .filter(Boolean)
    .join('\n');
}

function parseExperienceText(
  value: string,
  previous: ResumeExperienceItem[]
): ResumeExperienceItem[] {
  return value
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const lines = splitLines(block);
      const [header = '', mix = '', ...bullets] = lines;
      const [company = '', team = '', role = '', dates = ''] = header
        .split('|')
        .map((item) => item.trim());
      const [start = '', end = ''] = splitDateRange(dates);
      const previousItem = previous[index] || createEmptyExperience();

      return {
        ...previousItem,
        company,
        team,
        role,
        dateRange: { start, end },
        responsibilityMix: mix,
        bullets,
      };
    });
}

function parseEducationText(
  value: string,
  previous: ResumeEducationItem[]
): ResumeEducationItem[] {
  return value
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const lines = splitLines(block);
      const [header = '', ranking = '', ...rest] = lines;
      const [school = '', degree = '', major = '', dates = ''] = header
        .split('|')
        .map((item) => item.trim());
      const [start = '', end = ''] = splitDateRange(dates);
      const previousItem = previous[index] || createEmptyEducation();

      return {
        ...previousItem,
        school,
        degree,
        major,
        dateRange: { start, end },
        ranking,
        honors: rest,
        bullets: [],
      };
    });
}

function parseSkillsText(value: string): ResumeSkillGroup[] {
  return splitLines(value).map((line) => {
    const [groupPart, rest] = splitOnce(line, ':');
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
  });
}

function parseStrengthText(value: string): ResumeStrengthItem[] {
  return splitLines(value).map((line) => {
    const [titlePart, description] = splitOnce(line, ':');
    return {
      title: titlePart.trim(),
      description: description.trim(),
    };
  });
}

function createEmptyExperience(): ResumeExperienceItem {
  return {
    type: 'other',
    company: '',
    team: '',
    role: '',
    location: '',
    dateRange: {
      start: '',
      end: '',
    },
    responsibilityMix: '',
    bullets: [],
    keywords: [],
  };
}

function createEmptyEducation(): ResumeEducationItem {
  return {
    school: '',
    degree: '',
    major: '',
    dateRange: {
      start: '',
      end: '',
    },
    ranking: '',
    honors: [],
    bullets: [],
  };
}

function createEmptySkillGroup(): ResumeSkillGroup {
  return {
    group: '',
    summary: '',
    items: [],
  };
}

function createEmptyStrength(): ResumeStrengthItem {
  return {
    title: '',
    description: '',
  };
}

function formatDateRange(start: string, end: string) {
  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end;
}

function getNextValue<T>(values: T[], current: T) {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0];
}

function getNextFont(currentLabel: string) {
  const index = fontOptions.findIndex((font) => font.label === currentLabel);
  return fontOptions[(index + 1) % fontOptions.length] ?? fontOptions[0];
}

function splitOnce(value: string, delimiter: string) {
  const index = value.indexOf(delimiter);
  if (index === -1) {
    return [value, ''];
  }

  return [value.slice(0, index), value.slice(index + delimiter.length)];
}

function splitDateRange(value: string) {
  const normalized = value.trim();
  const spacedHyphenMatch = normalized.match(/^(.*?)(?:\s+-\s+)(.*)$/);
  if (spacedHyphenMatch) {
    return [
      spacedHyphenMatch[1]?.trim() || '',
      spacedHyphenMatch[2]?.trim() || '',
    ];
  }

  return [normalized, ''];
}

function normalizeDocumentSectionOrder(sectionOrder?: string[]) {
  const allowed = new Set(defaultResumeSectionOrder);
  const normalized = (sectionOrder || [])
    .filter((sectionId) => allowed.has(sectionId))
    .filter((sectionId, index, values) => values.indexOf(sectionId) === index);

  defaultResumeSectionOrder.forEach((sectionId) => {
    if (!normalized.includes(sectionId)) {
      normalized.push(sectionId);
    }
  });

  return normalized;
}

function getDocumentSectionLabel(sectionId: string, t: EditorTranslation) {
  switch (sectionId) {
    case 'summary':
      return t('tabs.summary');
    case 'experience':
      return t('sections.experience');
    case 'education':
      return t('sections.education');
    case 'involvement':
      return t('sections.involvement');
    case 'skills':
      return t('sections.skills');
    case 'rawSections':
      return t('document.custom_section');
    default:
      return sectionId;
  }
}

function compactJoin(
  items: Array<string | undefined | null | false>,
  delimiter: string
) {
  return items.filter(Boolean).join(delimiter).trim();
}

const documentInputClassName =
  'h-11 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-200 hover:bg-white focus:border-[#8f98ff] focus:bg-white focus:ring-2 focus:ring-[#8f98ff]/20';

const darkInputClassName =
  'h-16 rounded-xl border border-[#52617f] !bg-[#202b43] px-5 text-lg font-semibold !text-white caret-white shadow-none placeholder:text-white/25 focus-visible:border-[#8f98ff] focus-visible:ring-2 focus-visible:ring-[#8f98ff]/35';
