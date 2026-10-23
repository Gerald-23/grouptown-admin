import { AdminModulePage } from '@/components/admin-module-page';

export default function AdminBroadcastsRoute() {
  return (
    <AdminModulePage
      moduleKey="broadcasts"
      pageSummary="Broadcasts is where admins manage what guests and members can see in the live interest feed, including visibility, featuring, and stale-record cleanup."
    />
  );
}
