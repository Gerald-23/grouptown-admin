import { InformationPage } from '@/components/information-page';

export default function CompliancePage() {
  return (
    <InformationPage
      eyebrow="Legal"
      title="Compliance"
      intro="This page summarises the current compliance posture for onboarding, operational controls, and documentation handling across the GroupTown platform."
      sections={[
        {
          title: 'Operational controls',
          bullets: [
            'User identity and registration information is collected before programme access is completed.',
            'Admin approvals and role-sensitive actions are intended to be routed through controlled backend logic.',
            'Audit and notification records are maintained to support traceability of sensitive actions.',
          ],
        },
        {
          title: 'Documentation and verification',
          paragraphs: [
            'Property, programme, and ownership structures require final supporting documents before completion. Platform access alone does not replace those legal instruments.',
            'Where local law, title review, AML, KYC, or property-transfer obligations apply, those obligations must be completed before final execution.',
          ],
        },
      ]}
      meta={[
        { label: 'Focus', value: 'Onboarding, approval, audit, and document controls' },
        { label: 'Escalation', value: 'Request support for compliance-specific queries' },
      ]}
    />
  );
}
