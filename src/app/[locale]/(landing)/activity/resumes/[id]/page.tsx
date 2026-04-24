import { redirect } from '@/core/i18n/navigation';

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  redirect({ href: `/activity?resumeId=${id}`, locale });
}
