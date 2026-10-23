import { ContactPage } from '@/components/contact-page';
import { getContactPageData } from '@/lib/firebase/contact-data';

export default async function ContactPageRoute() {
  const data = await getContactPageData();

  return <ContactPage data={data} />;
}
