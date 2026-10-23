import { ResetPasswordPage } from '@/components/reset-password-page';
import { getResetPasswordPageData } from '@/lib/firebase/reset-password-data';

export default async function ResetPasswordPageRoute() {
  const data = await getResetPasswordPageData();

  return <ResetPasswordPage data={data} />;
}
