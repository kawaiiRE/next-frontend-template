'use client';

import { useTranslations } from 'next-intl';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme } from '@/components/preferences/ThemeProvider';
import { useThemeOptions } from '@/components/preferences/options';

/** Settings control: visible segmented radio group. */
export function ThemeSetting() {
  const t = useTranslations('theme');
  const { theme, setTheme } = useTheme();
  const options = useThemeOptions();

  return (
    <SegmentedControl
      legend={t('label')}
      hideLegend
      options={options}
      value={theme}
      onValueChange={setTheme}
    />
  );
}
