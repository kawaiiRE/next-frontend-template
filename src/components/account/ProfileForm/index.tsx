'use client';

import { BadgeCheck, CircleAlert, Clock } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { GuestUpgradeForm } from '@/components/account/GuestUpgradeForm';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Form, FormActions } from '@/components/ui/Form';
import { TextField } from '@/components/ui/TextField';
import { NAME_MAX_LENGTH } from '@/contracts/user';
import type { UserViewModel } from '@/presenters/user';
import { useProfileForm } from './logic';
import styles from './styles.module.scss';

export function ProfileForm({ user }: { user: UserViewModel }) {
  const t = useTranslations('profile');
  const fields = useTranslations('auth.fields');
  const common = useTranslations('common');
  const guest = useTranslations('guest');
  const format = useFormatter();
  const { handleSubmit, fieldErrors, formError, pending } = useProfileForm();

  return (
    <div className={styles.profile}>
      <Card className={styles.profile__summary}>
        <Avatar initials={user.initials} size="lg" />
        <div className={styles.profile__identity}>
          <p className={styles.profile__name} dir="auto">
            {user.displayName}
          </p>
          {user.email ? (
            <p className={styles.profile__email} dir="ltr">
              {user.email}
            </p>
          ) : null}
          <div className={styles.profile__meta}>
            {user.isGuest ? (
              <Badge tone="warning" icon={<Clock aria-hidden="true" />}>
                {guest('badge')}
              </Badge>
            ) : user.verified ? (
              <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
                {t('verified')}
              </Badge>
            ) : (
              <Badge tone="warning" icon={<CircleAlert aria-hidden="true" />}>
                {t('unverified')}
              </Badge>
            )}
            <span>
              {t('memberSince', { date: format.dateTime(new Date(user.memberSince), 'long') })}
            </span>
          </div>
        </div>
      </Card>

      {user.isGuest ? (
        <Card aria-labelledby="profile-upgrade">
          <CardHeader
            id="profile-upgrade"
            title={guest('upgradeTitle')}
            description={guest('upgradeDescription')}
          />
          <GuestUpgradeForm idPrefix="profile-upgrade" />
        </Card>
      ) : (
        <Card aria-labelledby="profile-details">
          <CardHeader
            id="profile-details"
            title={t('detailsTitle')}
            description={t('detailsDescription')}
          />
          <Form onSubmit={handleSubmit}>
            {formError ? (
              <Alert tone="danger" live>
                {formError}
              </Alert>
            ) : null}
            <TextField
              label={fields('name')}
              name="name"
              defaultValue={user.name}
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              enterKeyHint="done"
              required
              error={fieldErrors.name}
            />
            <TextField
              label={fields('email')}
              name="email-display"
              type="email"
              value={user.email}
              readOnly
              help={t('emailHelp')}
            />
            <FormActions>
              <Button type="submit" loading={pending}>
                {pending ? common('saving') : common('save')}
              </Button>
            </FormActions>
          </Form>
        </Card>
      )}
    </div>
  );
}
