import type { ReactNode } from 'react';

import { AdminAccessGate } from '@/components/admin-access-gate';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAccessGate>{children}</AdminAccessGate>;
}
