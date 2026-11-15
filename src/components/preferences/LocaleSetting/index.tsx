'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import { useLocaleOptions } from '@/components/preferences/options';
import { useLocaleSwitch } from '@/components/preferences/LocaleSwitcher/logic';

/** Settings control: language select. */
export function LocaleSetting() {
  const t = useTranslations('language');
  const { locale, pending, switchLocale } = useLocaleSwitch();
  const options = useLocaleOptions();

  return (
    <Select
      label={t('label')}
      hideLabel
      options={options}
      value={locale}
      onValueChange={switchLocale}
      disabled={pending}
    />
  );
}
