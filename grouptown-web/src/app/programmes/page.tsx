import { ProgrammesPage as ProgrammesDirectoryPage } from '@/components/programmes-page';
import { getProgrammesPageData } from '@/lib/firebase/programmes-data';

export default async function ProgrammesPage() {
  const { cards, faqs } = await getProgrammesPageData();

  return <ProgrammesDirectoryPage cards={cards} faqs={faqs} />;
}
