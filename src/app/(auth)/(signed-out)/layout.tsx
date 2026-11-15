import { headers } from 'next/headers';
import { REQUEST_PATH_HEADER } from '@/constants/headers';
import { NEXT_PARAM } from '@/constants/routes';
import { redirectIfAuthenticated } from '@/server/session';

/** Signed-out pages: a verified session continues to the dashboard (or its `next` target). */
export default async function SignedOutLayout({ children }: LayoutProps<'/'>) {
  const path = (await headers()).get(REQUEST_PATH_HEADER) ?? '';
  const next = new URL(path, 'http://internal.invalid').searchParams.get(NEXT_PARAM);
  await redirectIfAuthenticated(next);
  return children;
}
