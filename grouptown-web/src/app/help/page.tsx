import { HelpPage } from '@/components/help-page';
import { getHelpPageData } from '@/lib/firebase/help-data';

export default async function HelpPageRoute() {
  const data = await getHelpPageData();

  return <HelpPage data={data} />;
}
