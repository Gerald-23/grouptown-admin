import { InformationPage } from '@/components/information-page';

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="Terms"
      title="Platform terms overview"
      intro="These summary terms explain the platform-level rules for access, registration, communication, and use of GroupTown services pending publication of the final counsel-reviewed production version."
      sections={[
        {
          title: 'Use of the platform',
          bullets: [
            'Users must provide accurate registration and identity information.',
            'Programme access, approval, and dashboard visibility may depend on verification and role checks.',
            'Platform misuse, impersonation, fraud, or interference with programme operations may lead to suspension or account termination.',
          ],
        },
        {
          title: 'Programme and property information',
          paragraphs: [
            'Listings, programme descriptions, timelines, and availability are provided for guidance and may change as underwriting, title review, development conditions, or regulatory requirements change.',
            'Final commitments should rely on approved transactional documents, not marketing summaries or interim dashboard text alone.',
          ],
        },
      ]}
      meta={[
        { label: 'Applies to', value: 'All public and authenticated GroupTown users' },
        { label: 'Questions', value: 'Contact support before committing funds' },
      ]}
    />
  );
}
