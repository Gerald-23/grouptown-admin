import { SlopPage } from '@/components/slop-page';
import { getSlopPageData } from '@/lib/firebase/slop-data';

export default async function SlopPageRoute() {
  const data = await getSlopPageData();

  return <SlopPage data={data} />;
}
