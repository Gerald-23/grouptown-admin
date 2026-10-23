import { AdminProgrammeDetailPage } from '@/components/admin-programme-detail-page';

export default async function AdminProgrammeDetailRoute({
  params,
}: {
  params: Promise<{ programmeId: string }>;
}) {
  const { programmeId } = await params;

  return <AdminProgrammeDetailPage programmeId={programmeId} />;
}
