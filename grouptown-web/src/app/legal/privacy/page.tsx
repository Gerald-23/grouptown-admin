import { InformationPage } from '@/components/information-page';

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Privacy"
      title="Privacy overview"
      intro="This summary explains the core categories of information GroupTown collects, why it is used, and how it supports programme administration, compliance checks, and member communication."
      sections={[
        {
          title: 'Data we collect',
          bullets: [
            'Identity and contact information submitted during registration and application.',
            'Programme preferences, onboarding responses, and delivery selections.',
            'Operational records such as approvals, notifications, transactions, and support history.',
          ],
        },
        {
          title: 'How data is used',
          paragraphs: [
            'Information is used to operate accounts, assess eligibility, manage programmes, support payments, communicate updates, and maintain audit and security controls.',
            'Access is restricted by authentication, role checks, and Firestore rules, and sensitive actions are intended to move through privileged backend paths where required.',
          ],
        },
      ]}
      meta={[
        { label: 'Primary use', value: 'Account, programme, compliance, and support operations' },
        { label: 'Contact', value: 'Use the support page for privacy questions' },
      ]}
    />
  );
}
