import { LoginPage } from '@/components/login-page';
import { getLoginPageData } from '@/lib/firebase/login-data';

export default async function LoginPageRoute() {
  const data = await getLoginPageData();

  return <LoginPage data={data} />;
}
