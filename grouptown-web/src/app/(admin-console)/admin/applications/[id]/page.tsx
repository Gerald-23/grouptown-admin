import { AdminApplicationDetailPage } from '@/components/admin-application-detail-page';

export default async function AdminApplicationDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminApplicationDetailPage applicationId={id} />;
}
