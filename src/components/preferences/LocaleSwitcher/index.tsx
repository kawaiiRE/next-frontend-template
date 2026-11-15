'use client';

import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RadioMenu } from '@/components/ui/DropdownMenu';
import { IconButton } from '@/components/ui/IconButton';
import { useLocaleOptions } from '@/components/preferences/options';
import { useLocaleSwitch } from './logic';

/** Header control: language menu showing each language in its own script. */
export function LocaleSwitcher() {
  const t = useTranslations('language');
  const { locale, pending, switchLocale } = useLocaleSwitch();
  const options = useLocaleOptions();

  return (
    <RadioMenu
      label={t('label')}
      value={locale}
      options={options}
      onValueChange={switchLocale}
      trigger={
        <IconButton
          label={t('label')}
          icon={<Languages aria-hidden="true" />}
          aria-busy={pending || undefined}
        />
      }
    />
  );
}
