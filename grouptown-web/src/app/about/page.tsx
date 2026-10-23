import { AboutPage } from '@/components/about-page';
import { getAboutPageData } from '@/lib/firebase/about-data';

export default async function AboutPageRoute() {
  const data = await getAboutPageData();

  return <AboutPage data={data} />;
}
