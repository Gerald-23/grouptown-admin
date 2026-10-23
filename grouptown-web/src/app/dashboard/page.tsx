import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard-page';
import { getDashboardPageData } from '@/lib/firebase/dashboard-data';

export default async function DashboardPageRoute() {
  const data = await getDashboardPageData();

  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading dashboard...</div>}>
      <DashboardPage data={data} />
    </Suspense>
  );
}
