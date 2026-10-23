import { LandingPage } from '@/components/landing-page';
import { getLandingData } from '@/lib/firebase/landing-data';

export default async function HomePage() {
  const { programmes, featuredProperties } = await getLandingData();

  return <LandingPage featuredProperties={featuredProperties} programmes={programmes} />;
}
