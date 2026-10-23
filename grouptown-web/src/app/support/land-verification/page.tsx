import { InformationPage } from '@/components/information-page';

export default function LandVerificationPage() {
  return (
    <InformationPage
      eyebrow="Support"
      title="Land Verification"
      intro="This page explains the current land-verification support path for users who need clarification on title checks, documentation status, or property authenticity before proceeding."
      sections={[
        {
          title: 'Verification scope',
          bullets: [
            'Title search and ownership-chain review where applicable.',
            'Site and location confirmation against the represented parcel or property.',
            'Developer or seller documentation checks before a listing is treated as approved.',
          ],
        },
        {
          title: 'Before you proceed',
          paragraphs: [
            'Do not rely on a marketing summary alone when making a funding or ownership decision. Final verification must follow the approved transaction and documentation workflow for the specific property or programme.',
            'If you need a status update on a live property or land verification request, contact support with the listing or programme reference.',
          ],
        },
      ]}
      meta={[
        { label: 'Use for', value: 'Title, parcel, and listing verification questions' },
        { label: 'Escalate via', value: 'help/contact' },
      ]}
    />
  );
}
