import { InformationPage } from '@/components/information-page';

export default function AccountDeletionPage() {
  return (
    <InformationPage
      eyebrow="Account control"
      title="Delete your GroupTown account"
      intro="You can request permanent deletion of your GroupTown account and user-owned content. This page is also available to members who can no longer access the app."
      sections={[
        {
          title: 'How to request deletion',
          paragraphs: [
            'Send an email to sedanlandbank26@gmail.com from the email address registered to your GroupTown account. Use the subject “GroupTown account deletion” and include your full name and registered email address.',
            'We will verify that the request belongs to the account owner before processing it. Do not send a password, payment PIN, card number, or Hubtel credentials.',
          ],
        },
        {
          title: 'What we delete',
          bullets: [
            'Firebase Authentication account and GroupTown profile.',
            'Registration, waiting-interest, notification, device, support, and user-owned media records.',
            'Community/group posts, comments, reactions, messages, stories, and uploaded files owned by the account.',
          ],
        },
        {
          title: 'Records we may retain',
          paragraphs: [
            'Payment transaction metadata and programme/audit records may be retained when required for accounting, legal, fraud-prevention, dispute-resolution, or regulatory reasons. These records are detached from the deleted account identity where possible.',
            'Deletion requests are normally completed within 30 days after identity verification. We will email confirmation when the request is complete or explain why a specific record must be retained.',
          ],
        },
      ]}
      meta={[
        { label: 'Deletion email', value: 'sedanlandbank26@gmail.com' },
        { label: 'Expected timing', value: 'Within 30 days after verification' },
        { label: 'In-app option', value: 'Profile → Settings → Delete account' },
      ]}
    />
  );
}
