import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'GroupTown Admin Console',
    template: '%s | GroupTown Admin Console',
  },
  description: 'Operational admin console for GroupTown programmes, applications, members, and platform controls.',
};

export default function AdminConsoleRouteGroupLayout({ children }: { children: ReactNode }) {
  return children;
}
