import { InformationPage } from '@/components/information-page';

export default function CareersPage() {
  return (
    <InformationPage
      eyebrow="Company"
      title="Careers"
      intro="GroupTown is building a coordinated property and programme operations platform. This page now serves as a live careers contact surface rather than a placeholder route."
      sections={[
        {
          title: 'What we look for',
          bullets: [
            'Experience in property operations, customer success, compliance, programme administration, or platform support.',
            'Strong communication, record discipline, and comfort working with regulated or documentation-heavy workflows.',
            'Familiarity with Ghanaian property, customer operations, or field-agent networks is a plus.',
          ],
        },
        {
          title: 'How to enquire',
          paragraphs: [
            'Current openings are handled through the GroupTown support and corporate contact channels while the dedicated recruitment workflow is being formalised.',
            'If you are enquiring about partnership or field representation, include your background, coverage area, and relevant experience in your message.',
          ],
        },
      ]}
      meta={[
        { label: 'Current route', value: 'Support-led recruitment enquiries' },
        { label: 'Send details to', value: 'help/contact' },
      ]}
    />
  );
}
