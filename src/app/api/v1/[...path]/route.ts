import { ApiFailure } from '@/server/http/errors';
import { apiRoute } from '@/server/http/route';

/** Unknown `/api/v1/*` paths answer with the gateway error shape instead of an HTML 404 page. */
const notFound = apiRoute({}, async () => {
  throw new ApiFailure('NOT_FOUND');
});

export {
  notFound as GET,
  notFound as POST,
  notFound as PATCH,
  notFound as PUT,
  notFound as DELETE,
};
