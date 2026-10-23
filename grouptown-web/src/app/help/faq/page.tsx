import { InformationPage } from '@/components/information-page';

export default function FaqPage() {
  return (
    <InformationPage
      eyebrow="FAQs"
      title="Frequently asked questions"
      intro="Quick answers to the most common questions about onboarding, programme participation, property verification, and support handling on GroupTown."
      sections={[
        {
          title: 'Common questions',
          bullets: [
            'How do I register and complete onboarding for S.H.O.P. or S.L.O.P.?',
            'When does a registration move from submitted to approved?',
            'How do delivery selections and group assignments work?',
            'Where can I get support if I cannot access data or my account status looks wrong?',
          ],
        },
        {
          title: 'Support direction',
          paragraphs: [
            'For account-specific issues, approvals, or live programme questions, use the support contact path instead of relying on general FAQs alone.',
            'Property and programme availability can change over time, so live support remains the right path for any decision that affects payments, approvals, or legal documentation.',
          ],
        },
      ]}
      meta={[
        { label: 'Best next step', value: 'Use help/contact for account-specific support' },
        { label: 'Audience', value: 'Guests, applicants, and active members' },
      ]}
    />
  );
}
