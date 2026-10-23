import { ShopPage } from '@/components/shop-page';
import { getShopPageData } from '@/lib/firebase/shop-data';

export default async function ShopPageRoute() {
  const data = await getShopPageData();

  return <ShopPage data={data} />;
}
