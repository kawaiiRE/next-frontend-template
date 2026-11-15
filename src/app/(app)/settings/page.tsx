import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { DeleteAccount } from '@/components/account/DeleteAccount';
import { SettingsSection } from '@/components/account/SettingsSection';
import { LocaleSetting } from '@/components/preferences/LocaleSetting';
import { ThemeSetting } from '@/components/preferences/ThemeSetting';
import { PageHeader } from '@/components/ui/PageHeader';
import { Stack } from '@/components/ui/Stack';
import { requireSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('settings') };
}

export default async function SettingsPage() {
  const [{ user }, t, guest] = await Promise.all([
    requireSession(),
    getTranslations('settings'),
    getTranslations('guest'),
  ]);

  return (
    <>
      <PageHeader title={t('title')} description={t('subtitle')} />
      <Stack>
        <SettingsSection
          id="settings-appearance"
          title={t('appearanceTitle')}
          description={t('appearanceDescription')}
        >
          <ThemeSetting />
        </SettingsSection>
        <SettingsSection
          id="settings-language"
          title={t('languageTitle')}
          description={t('languageDescription')}
        >
          <LocaleSetting />
        </SettingsSection>
        {user.isGuest ? null : (
          <SettingsSection
            id="settings-password"
            title={t('passwordTitle')}
            description={t('passwordDescription')}
          >
            <ChangePasswordForm />
          </SettingsSection>
        )}
        <SettingsSection
          id="settings-danger"
          tone="danger"
          title={user.isGuest ? guest('endTitle') : t('dangerTitle')}
          description={user.isGuest ? guest('endDescription') : t('dangerDescription')}
        >
          <DeleteAccount email={user.email} isGuest={user.isGuest} />
        </SettingsSection>
      </Stack>
    </>
  );
}
