'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MAIL_ACTION_COPY, type MailLocale } from '@/content/mail-actions';
import { MAIL_ACTION_ROUTES } from '@/constants/mail-actions';
import { useMailAction } from './logic';
import styles from './styles.module.scss';

export function MailActionPage({
  locale = 'en',
  appName,
  demo = false,
}: {
  locale?: MailLocale;
  appName?: string;
  demo?: boolean;
}) {
  const [language, setLanguage] = useState<MailLocale>(locale);
  const copy = MAIL_ACTION_COPY[language];
  const state = useMailAction();
  return (
    <section
      className={styles.panel}
      aria-labelledby="mail-action-title"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      data-mail-confirmation="v1"
    >
      {appName && (
        <p>
          <strong>
            <bdi>{appName}</bdi>
          </strong>
        </p>
      )}
      {demo && <p>{copy.demo}</p>}
      <label>
        {copy.language}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as MailLocale)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
      </label>
      <h1 id="mail-action-title">{state.link ? copy.titles[state.link.action] : copy.title}</h1>
      <p>{copy.introduction}</p>
      {!state.ready ? (
        <p role="status">{copy.loading}</p>
      ) : state.outcome?.completed ? (
        <p role="status">{copy.success}</p>
      ) : !state.link ? (
        <p role="alert">{copy.missing}</p>
      ) : (
        <form onSubmit={state.submit} method="post" aria-busy={state.busy}>
          {state.link.action !== 'verification' && (
            <>
              <label>
                {state.link.action === 'email-change' ? copy.currentPassword : copy.password}
                <input
                  type="password"
                  value={state.password}
                  onChange={(event) => state.setPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete={
                    state.link.action === 'email-change' ? 'current-password' : 'new-password'
                  }
                  aria-describedby="mail-password-help"
                  disabled={state.busy}
                />
              </label>
              <p id="mail-password-help">{copy.passwordHelp}</p>
            </>
          )}
          {state.link.action === 'password-reset' && (
            <label>
              {copy.confirmPassword}
              <input
                type="password"
                value={state.passwordConfirm}
                onChange={(event) => state.setPasswordConfirm(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                disabled={state.busy}
              />
            </label>
          )}
          <button type="submit" disabled={state.busy}>
            {state.busy ? copy.busy : copy.submit}
          </button>
        </form>
      )}
      {state.outcome && !state.outcome.completed && (
        <p role="alert">{copy[state.outcome.reason]}</p>
      )}
      <Link href={MAIL_ACTION_ROUTES.home}>{copy.home}</Link>
      {MAIL_ACTION_ROUTES.privacy && (
        <p>
          <Link href={MAIL_ACTION_ROUTES.privacy(language)}>{copy.privacy}</Link>
        </p>
      )}
    </section>
  );
}
