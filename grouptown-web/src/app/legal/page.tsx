import { InformationPage } from '@/components/information-page';

export default function LegalPage() {
  return (
    <InformationPage
      eyebrow="Legal"
      title="Legal and compliance centre"
      intro="This section outlines the baseline legal, compliance, and privacy posture of the GroupTown platform while fuller counsel-reviewed documentation is finalised for production publication."
      sections={[
        {
          title: 'Current operating position',
          paragraphs: [
            'GroupTown operates as a property and programme coordination platform. Participation, approvals, payment scheduling, and title-related actions remain subject to programme rules, verification standards, and the final controlling transaction documents for each product.',
            'Nothing on this page replaces programme-specific contracts, title instruments, escrow terms, or professional legal advice. Where a programme-specific document conflicts with a general platform summary, the signed programme document controls.',
          ],
        },
        {
          title: 'What to review before participating',
          bullets: [
            'Programme eligibility requirements and approval criteria.',
            'Contribution, payment, and default handling terms.',
            'Allocation, delivery, and exit provisions.',
            'Identity verification, record retention, and communications consent.',
          ],
        },
      ]}
      meta={[
        { label: 'Support', value: 'help/contact' },
        { label: 'Coverage', value: 'Platform terms, privacy, compliance' },
      ]}
    />
  );
}
