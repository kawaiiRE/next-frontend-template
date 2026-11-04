import {
  mailActionSchema,
  mailActionResultSchema,
  mailLinkSchema,
  type MailAction,
  type MailLink,
} from '@/contracts/mail-actions';
import { MAIL_ACTION_ROUTES, MAIL_ACTION_TIMEOUT_MS } from '@/constants/mail-actions';

export type MailActionOutcome =
  | { completed: true }
  | { completed: false; reason: 'invalid' | 'unavailable' | 'rate-limited' | 'unconfirmed' };
export function parseMailLink(fragment: string): MailLink | null {
  if (fragment.length > 4600) return null;
  const values = new URLSearchParams(fragment.replace(/^#/, ''));
  if (new Set(values.keys()).size !== 3 || [...values.keys()].length !== 3) return null;
  const result = mailLinkSchema.safeParse(Object.fromEntries(values));
  return result.success ? result.data : null;
}
export async function confirmMailAction(
  input: MailAction,
  send: typeof fetch = fetch,
): Promise<MailActionOutcome> {
  const parsed = mailActionSchema.safeParse(input);
  if (!parsed.success) return { completed: false, reason: 'invalid' };
  try {
    const response = await send(MAIL_ACTION_ROUTES.confirm, {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(MAIL_ACTION_TIMEOUT_MS),
    });
    if (response.status === 429) return { completed: false, reason: 'rate-limited' };
    if ([400, 401, 403, 404, 422].includes(response.status))
      return { completed: false, reason: 'invalid' };
    if (!response.ok) return { completed: false, reason: 'unavailable' };
    return mailActionResultSchema.safeParse(await response.json()).success
      ? { completed: true }
      : { completed: false, reason: 'unconfirmed' };
  } catch {
    return { completed: false, reason: 'unconfirmed' };
  }
}
