import { renderActivityWorkspace } from '@/shared/resume/server/render-activity-workspace';

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ resumeId?: string }>;
}) {
  await params;
  const { resumeId } = await searchParams;

  return renderActivityWorkspace({ requestedResumeId: resumeId });
}
