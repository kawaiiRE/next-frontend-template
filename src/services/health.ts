import { healthViewModelSchema, type HealthViewModel } from '@/contracts/health';
import { APP_ROUTES } from '@/constants/routes';
import { request, type ApiResult } from '@/services/api';

export function readHealth(): Promise<ApiResult<HealthViewModel>> {
  return request(APP_ROUTES.health, (value) => healthViewModelSchema.parse(value));
}
