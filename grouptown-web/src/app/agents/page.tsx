import { AgentsPage } from '@/components/agents-page';
import { getAgentsPageData } from '@/lib/firebase/agents-data';

export default async function AgentsPageRoute() {
  const data = await getAgentsPageData();

  return <AgentsPage data={data} />;
}
