import { AdminModulePage } from '@/components/admin-module-page';

export default function AdminAuditRoute() {
  return (
    <AdminModulePage
      moduleKey="audit"
      pageSummary="Audit is where sensitive admin actions stay traceable so approvals, membership edits, and visibility changes all preserve a reviewable evidence trail."
    />
  );
}
