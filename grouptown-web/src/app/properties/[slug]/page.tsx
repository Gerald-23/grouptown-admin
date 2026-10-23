import { PropertyDetailPage } from '@/components/property-detail-page';
import { getPropertyDetailData } from '@/lib/firebase/properties-data';

type PropertyDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function PropertyDetailRoute({ params }: PropertyDetailRouteProps) {
  const { slug } = await params;

  const property = await getPropertyDetailData(slug);

  return <PropertyDetailPage property={property} />;
}
