'use client';

import { ChevronDown, LogOut, Settings, UserRound, UserRoundPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu, type DropdownMenuEntry } from '@/components/ui/DropdownMenu';
import { APP_ROUTES } from '@/constants/routes';
import type { UserViewModel } from '@/presenters/user';
import { useSignOut } from './logic';
import styles from './styles.module.scss';

type MenuUser = Pick<UserViewModel, 'displayName' | 'email' | 'initials' | 'isGuest'>;

interface UserMenuProps {
  user: MenuUser;
  /** Opens the guest upgrade dialog. */
  onCreateAccount: () => void;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: MenuUser;
  label: string;
}

const UserMenuTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function UserMenuTrigger(
  { user, label, ...rest },
  ref,
) {
  return (
    <button {...rest} ref={ref} type="button" className={styles.trigger} aria-label={label}>
      <Avatar initials={user.initials} size="sm" />
      <span className={styles.trigger__name} dir="auto">
        {user.displayName}
      </span>
      <ChevronDown className={styles.trigger__chevron} aria-hidden="true" />
    </button>
  );
});

export function UserMenu({ user, onCreateAccount }: UserMenuProps) {
  const t = useTranslations('userMenu');
  const a11y = useTranslations('a11y');
  const guest = useTranslations('guest');
  const { requestSignOut, signOut, pending, confirmOpen, setConfirmOpen } = useSignOut(
    user.isGuest,
  );

  const entries: DropdownMenuEntry[] = [
    ...(user.isGuest
      ? [
          {
            type: 'item' as const,
            key: 'create-account',
            label: guest('createAccount'),
            icon: <UserRoundPlus aria-hidden="true" />,
            onSelect: onCreateAccount,
          },
        ]
      : []),
    {
      type: 'link',
      key: 'profile',
      label: t('profile'),
      href: APP_ROUTES.profile,
      icon: <UserRound aria-hidden="true" />,
    },
    {
      type: 'link',
      key: 'settings',
      label: t('settings'),
      href: APP_ROUTES.settings,
      icon: <Settings aria-hidden="true" />,
    },
    { type: 'separator', key: 'separator' },
    {
      type: 'item',
      key: 'sign-out',
      label: t('signOut'),
      icon: <LogOut className={styles.signOutIcon} aria-hidden="true" />,
      onSelect: requestSignOut,
      disabled: pending,
    },
  ];

  return (
    <>
      <DropdownMenu
        trigger={
          <UserMenuTrigger user={user} label={a11y('userMenu', { name: user.displayName })} />
        }
        header={
          <div className={styles.header}>
            <Avatar initials={user.initials} size="md" />
            <div className={styles.header__text}>
              <p className={styles.header__name} title={user.displayName} dir="auto">
                {user.displayName}
              </p>
              <p
                className={styles.header__email}
                title={user.email || undefined}
                dir={user.isGuest ? undefined : 'ltr'}
              >
                {user.isGuest ? guest('menuHint') : user.email}
              </p>
            </div>
          </div>
        }
        entries={entries}
      />
      {user.isGuest ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={guest('signOutTitle')}
          description={guest('signOutDescription')}
          confirmLabel={t('signOut')}
          pendingLabel={guest('signingOut')}
          onConfirm={signOut}
        />
      ) : null}
    </>
  );
}
