import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { getDb } from './client';
import { hasFirebaseConfig } from './config';

export type AgentResponsibility = {
  icon: string;
  title: string;
  description: string;
  featured?: boolean;
};

export type AgentStep = {
  number: string;
  title: string;
  description: string;
  highlighted?: boolean;
};

export type AgentRequirement = {
  icon: string;
  title: string;
  description: string;
};

export type AgentFaq = {
  question: string;
  answer: string;
};

export type AgentsPageData = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  responsibilities: AgentResponsibility[];
  accreditationTitle: string;
  accreditationDescription: string;
  accreditationSteps: AgentStep[];
  eligibilityTitle: string;
  eligibilityItems: AgentRequirement[];
  territoryTitle: string;
  territoryDescription: string;
  territoryNote: string;
  workspaceTitle: string;
  workspaceDescription: string;
  workspaceStats: { label: string; value: string }[];
  workspaceDisclaimer: string;
  faqs: AgentFaq[];
  finalCtaTitle: string;
  finalCtaDescription: string;
};

const fallbackData: AgentsPageData = {
  heroEyebrow: 'Institutional Real Estate',
  heroTitle: 'Become an Accredited GroupTown Agent (AGA)',
  heroDescription:
    'Represent the future of collective property ownership in Ghana. Join a network of vetted professionals managing institutional-grade assets.',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANed2FoyX-Av8P3iM9H_nBowBue89XAeFAWZY_cuND52MM3bjPPDQJpGla1bS3xxcIHfaSN8dtDLq8a-FYdEVLf4XM0pIQOhxah3csJr8RbrNN1uejhtHvb53uGOxvKOHWSuxdUcnkPgRUIbPLQhGGNLJAkPOVXVhUApdRWHyofa1w715ahKyy_TsV51gwkBnL8uNnEPyNugE3_FiCERGCOROj_HsOOtIF3UlkN9y2wRqiIPdjyfL6VyiXRfpS-kFbEhO6Ar4BMx0',
  responsibilities: [
    {
      icon: 'real_estate_agent',
      title: 'Property Support',
      description:
        'Manage and support high-quality property listings within the GroupTown ecosystem.',
    },
    {
      icon: 'co_present',
      title: 'Enquiry Coordination',
      description:
        'Seamlessly coordinate property enquiries and viewing requests for potential co-owners.',
    },
    {
      icon: 'map',
      title: 'Territory Management',
      description:
        'Operate within assigned territories to ensure local expertise and presence in strategic locations.',
    },
    {
      icon: 'update',
      title: 'Transaction Updates',
      description:
        'Maintain accurate, real-time updates on all transaction stages, ensuring stakeholders are always informed.',
      featured: true,
    },
    {
      icon: 'folder_managed',
      title: 'Record Keeping',
      description:
        'Maintain meticulous records for compliance and transparency throughout the asset lifecycle.',
    },
  ],
  accreditationTitle: 'Accreditation Process',
  accreditationDescription: 'A structured path to becoming an institutional representative.',
  accreditationSteps: [
    {
      number: '01',
      title: 'Create/Verify Account',
      description: 'Set up your standard GroupTown identity with basic credentials.',
    },
    {
      number: '02',
      title: 'Submit Details',
      description: 'Provide your personal and professional background data.',
    },
    {
      number: '03',
      title: 'Document Upload',
      description: 'Submit requested certifications and identification documents.',
    },
    {
      number: '04',
      title: 'Admin Review',
      description: 'A thorough review of your application by our compliance team.',
    },
    {
      number: '05',
      title: 'Agreement & Activation',
      description: 'Finalize territory assignment and activate your workspace.',
      highlighted: true,
    },
  ],
  eligibilityTitle: 'Eligibility Requirements',
  eligibilityItems: [
    {
      icon: 'verified',
      title: 'Professional Certification',
      description:
        'Active membership with the Ghana Institution of Surveyors (GhIS) or Ghana Association of Real Estate Brokers (GAR).',
    },
    {
      icon: 'badge',
      title: 'Identification Verification',
      description:
        'Valid Ghana Card and Tax Identification Number (TIN) for professional vetting.',
    },
    {
      icon: 'location_on',
      title: 'Territorial Residency',
      description:
        'Proven presence or operational history within the proposed territory of management.',
    },
  ],
  territoryTitle: 'Territory Assignment',
  territoryDescription:
    'AGA territories are strictly assigned based on approved operational rules and the geographic needs of the GroupTown ecosystem. Each agent is granted a specific area of influence to ensure there is no overlap in service and to maximize local expertise.',
  territoryNote:
    'Assignments are reviewed quarterly based on performance and market demand.',
  workspaceTitle: 'The AGA Workspace',
  workspaceDescription: 'Intuitive control over your property portfolio.',
  workspaceStats: [
    { label: 'Active Listings', value: '12' },
    { label: 'Pending Enquiries', value: '04' },
    { label: 'Commission Accrued', value: 'GH₵ --' },
  ],
  workspaceDisclaimer:
    'Commission eligibility and calculation are subject to approved AGA, Finance and Legal terms.',
  faqs: [
    {
      question: 'What are the requirements?',
      answer:
        'Requirements include professional certification in Ghana (GhIS/GAR), valid national identification, a clean professional track record, and residency or operational presence in your target territory.',
    },
    {
      question: 'How is commission calculated?',
      answer:
        'Commission structure is predefined within the AGA agreement and is based on transaction volume and successful asset management milestones within your assigned territory.',
    },
    {
      question: 'How long does approval take?',
      answer:
        'The vetting and review process typically takes 10-15 business days, depending on the speed of document verification and interview scheduling.',
    },
  ],
  finalCtaTitle: 'Ready to join the network?',
  finalCtaDescription:
    'Take the first step toward becoming an Accredited GroupTown Agent and shape the landscape of property ownership in Ghana.',
};

export async function getAgentsPageData(): Promise<AgentsPageData> {
  if (!hasFirebaseConfig()) {
    return fallbackData;
  }

  try {
    const db = getDb();
    if (!db) {
      return fallbackData;
    }

    const pageQuery = query(
      collection(db, 'pages'),
      where('slug', '==', 'agents'),
      where('isPublished', '==', true),
      limit(1)
    );
    const faqQuery = query(
      collection(db, 'faqs'),
      where('category', '==', 'agents'),
      where('isPublished', '==', true),
      orderBy('sortOrder', 'asc'),
      limit(6)
    );

    const [pageSnapshot, faqSnapshot] = await Promise.all([getDocs(pageQuery), getDocs(faqQuery)]);

    if (pageSnapshot.empty) {
      return fallbackData;
    }

    const data = pageSnapshot.docs[0].data();

    return {
      heroEyebrow: String(data.heroEyebrow ?? fallbackData.heroEyebrow),
      heroTitle: String(data.heroTitle ?? fallbackData.heroTitle),
      heroDescription: String(data.heroDescription ?? fallbackData.heroDescription),
      heroImage: String(data.heroImage ?? fallbackData.heroImage),
      responsibilities: Array.isArray(data.responsibilities)
        ? data.responsibilities.map((item) => ({
            icon: String(item.icon ?? 'real_estate_agent'),
            title: String(item.title ?? 'Responsibility'),
            description: String(item.description ?? ''),
            featured: Boolean(item.featured ?? false),
          }))
        : fallbackData.responsibilities,
      accreditationTitle: String(data.accreditationTitle ?? fallbackData.accreditationTitle),
      accreditationDescription: String(
        data.accreditationDescription ?? fallbackData.accreditationDescription
      ),
      accreditationSteps: Array.isArray(data.accreditationSteps)
        ? data.accreditationSteps.map((item, index) => ({
            number: String(item.number ?? `${index + 1}`.padStart(2, '0')),
            title: String(item.title ?? 'Step'),
            description: String(item.description ?? ''),
            highlighted: Boolean(item.highlighted ?? false),
          }))
        : fallbackData.accreditationSteps,
      eligibilityTitle: String(data.eligibilityTitle ?? fallbackData.eligibilityTitle),
      eligibilityItems: Array.isArray(data.eligibilityItems)
        ? data.eligibilityItems.map((item) => ({
            icon: String(item.icon ?? 'verified'),
            title: String(item.title ?? 'Requirement'),
            description: String(item.description ?? ''),
          }))
        : fallbackData.eligibilityItems,
      territoryTitle: String(data.territoryTitle ?? fallbackData.territoryTitle),
      territoryDescription: String(
        data.territoryDescription ?? fallbackData.territoryDescription
      ),
      territoryNote: String(data.territoryNote ?? fallbackData.territoryNote),
      workspaceTitle: String(data.workspaceTitle ?? fallbackData.workspaceTitle),
      workspaceDescription: String(
        data.workspaceDescription ?? fallbackData.workspaceDescription
      ),
      workspaceStats: Array.isArray(data.workspaceStats)
        ? data.workspaceStats.map((item) => ({
            label: String(item.label ?? 'Metric'),
            value: String(item.value ?? '--'),
          }))
        : fallbackData.workspaceStats,
      workspaceDisclaimer: String(
        data.workspaceDisclaimer ?? fallbackData.workspaceDisclaimer
      ),
      faqs: faqSnapshot.empty
        ? fallbackData.faqs
        : faqSnapshot.docs.map((doc) => {
            const faq = doc.data();
            return {
              question: String(faq.question ?? 'Question'),
              answer: String(faq.answer ?? ''),
            } satisfies AgentFaq;
          }),
      finalCtaTitle: String(data.finalCtaTitle ?? fallbackData.finalCtaTitle),
      finalCtaDescription: String(
        data.finalCtaDescription ?? fallbackData.finalCtaDescription
      ),
    };
  } catch {
    return fallbackData;
  }
}
