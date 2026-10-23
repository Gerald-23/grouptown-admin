import { VerifyPage } from '@/components/verify-page';
import { getVerifyPageData } from '@/lib/firebase/verify-data';

export default async function VerifyPageRoute() {
  const data = await getVerifyPageData();

  return <VerifyPage data={data} />;
}
