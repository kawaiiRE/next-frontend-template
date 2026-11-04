import 'server-only';
import type { MailAction } from '@/contracts/mail-actions';
import { createPocketBaseClient } from '@/server/pocketbase';
import { environment } from '@/server/environment';
import { MAIL_ACTION_TIMEOUT_MS } from '@/constants/mail-actions';

/** A fresh unauthenticated client, pinned to this application's canonical backend. */
export async function executeMailAction(input: MailAction): Promise<void> {
  const client = createPocketBaseClient();
  const collection = client.collection(input.collection);
  const options = {
    requestKey: null,
    headers: { Origin: environment().APP_ORIGIN },
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, {
        ...init,
        redirect: 'error',
        cache: 'no-store',
        signal: AbortSignal.timeout(MAIL_ACTION_TIMEOUT_MS),
      }),
  };
  if (input.action === 'verification') await collection.confirmVerification(input.token, options);
  else if (input.action === 'email-change')
    await collection.confirmEmailChange(input.token, input.password, options);
  else
    await collection.confirmPasswordReset(
      input.token,
      input.password,
      input.passwordConfirm,
      options,
    );
}
