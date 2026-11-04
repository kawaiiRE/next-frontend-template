import { respondMailAction } from '@/server/services/mail-actions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return respondMailAction(request);
}
