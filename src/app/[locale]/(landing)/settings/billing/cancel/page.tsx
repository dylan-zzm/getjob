import { redirect } from '@/core/i18n/navigation';

export default async function CancelBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/settings/templates', locale });
}
