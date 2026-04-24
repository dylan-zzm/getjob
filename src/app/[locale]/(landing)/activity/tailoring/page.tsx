import { redirect } from '@/core/i18n/navigation';

export default async function TailoringPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ resumeId?: string }>;
}) {
  const { locale } = await params;
  const { resumeId } = await searchParams;

  redirect({
    href: resumeId ? `/activity?resumeId=${resumeId}` : '/activity',
    locale,
  });
}
