import { apiRoute, jsonResponse } from '@/server/http/route';
import { getAppConfig } from '@/server/services/config';

export const GET = apiRoute({}, async () => jsonResponse(await getAppConfig()));
