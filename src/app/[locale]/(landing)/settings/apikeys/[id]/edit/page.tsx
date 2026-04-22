import { redirect } from '@/core/i18n/navigation';

export default async function EditApiKeyPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/settings/templates', locale });
}
