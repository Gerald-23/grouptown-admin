import { RegisterPage } from '@/components/register-page';
import { getRegisterPageData } from '@/lib/firebase/register-data';

export default async function RegisterPageRoute() {
  const data = await getRegisterPageData();

  return <RegisterPage data={data} />;
}
