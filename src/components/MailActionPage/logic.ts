import { startTransition, useEffect, useRef, useState, type FormEvent } from 'react';
import type { MailAction, MailLink } from '@/contracts/mail-actions';
import { confirmMailAction, parseMailLink, type MailActionOutcome } from '@/services/mail-actions';

export function useMailAction() {
  const [ready, setReady] = useState(false);
  const [link, setLink] = useState<MailLink | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<MailActionOutcome | null>(null);
  const hydrated = useRef(false);
  const inFlight = useRef(false);
  const linkVersion = useRef(0);
  useEffect(() => {
    const readLink = () => {
      const current = parseMailLink(window.location.hash);
      // Fragments never reach HTTP logs. Keep credentials out of browser history.
      window.history.replaceState(window.history.state, '', window.location.pathname);
      linkVersion.current += 1;
      startTransition(() => {
        setLink(current);
        setReady(true);
        setOutcome(null);
        setPassword('');
        setPasswordConfirm('');
      });
    };
    if (!hydrated.current) {
      hydrated.current = true;
      readLink();
    }
    window.addEventListener('hashchange', readLink);
    return () => window.removeEventListener('hashchange', readLink);
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!link || inFlight.current) return;
    inFlight.current = true;
    const version = linkVersion.current;
    const input: MailAction =
      link.action === 'verification'
        ? { ...link, action: 'verification' }
        : link.action === 'email-change'
          ? { ...link, action: 'email-change', password }
          : { ...link, action: 'password-reset', password, passwordConfirm };
    setBusy(true);
    setOutcome(null);
    try {
      const result = await confirmMailAction(input);
      if (version !== linkVersion.current) return;
      setOutcome(result);
      if (result.completed) {
        setLink(null);
        setPassword('');
        setPasswordConfirm('');
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return {
    ready,
    link,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    busy,
    outcome,
    submit,
  };
}
