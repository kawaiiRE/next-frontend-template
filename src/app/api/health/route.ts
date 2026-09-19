import { handleApi } from '@/server/api';
import { getHealth } from '@/server/services/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(getHealth);
}
