import { PropertiesPage } from '@/components/properties-page';
import { getPropertiesPageData } from '@/lib/firebase/properties-data';

export default async function PropertiesPageRoute() {
  const data = await getPropertiesPageData();

  return <PropertiesPage data={data} />;
}
