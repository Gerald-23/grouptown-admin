import { LoginPage } from '@/components/login-page';
import { getLoginPageData } from '@/lib/firebase/login-data';

type AdminLoginPageRouteProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function AdminLoginPageRoute({ searchParams }: AdminLoginPageRouteProps) {
  const data = await getLoginPageData();
  const params = searchParams ? await searchParams : undefined;

  return <LoginPage data={data} mode="admin" redirectTo={params?.redirect} />;
}
