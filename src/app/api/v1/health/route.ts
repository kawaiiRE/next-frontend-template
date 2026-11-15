import { apiRoute, jsonResponse } from '@/server/http/route';
import { getHealth } from '@/server/services/health';

export const GET = apiRoute({}, async () => jsonResponse(await getHealth()));
