'use client';

import { useTranslations } from 'next-intl';
import { RadioMenu } from '@/components/ui/DropdownMenu';
import { IconButton } from '@/components/ui/IconButton';
import { useTheme } from '@/components/preferences/ThemeProvider';
import { ThemeIcon, useThemeOptions } from '@/components/preferences/options';

/** Header control: a compact menu with Light / Dark / System. */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const { theme, setTheme } = useTheme();
  const options = useThemeOptions();

  return (
    <RadioMenu
      label={t('label')}
      value={theme}
      options={options}
      onValueChange={setTheme}
      trigger={<IconButton label={t('label')} icon={<ThemeIcon theme={theme} />} />}
    />
  );
}
