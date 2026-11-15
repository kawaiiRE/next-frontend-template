'use client';

import { CSPProvider } from '@base-ui/react/csp-provider';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/preferences/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/Tooltip';
import type { ThemePreference } from '@/constants/preferences';

interface ProvidersProps {
  dir: 'ltr' | 'rtl';
  nonce: string | undefined;
  theme: ThemePreference;
  children: ReactNode;
}

/** Client-side context for the whole tree. Holds no request-shared mutable state. */
export function Providers({ dir, nonce, theme, children }: ProvidersProps) {
  return (
    <CSPProvider nonce={nonce}>
      <DirectionProvider direction={dir}>
        <ThemeProvider initialTheme={theme}>
          <TooltipProvider delay={400}>
            {children}
            <Toaster dir={dir} />
          </TooltipProvider>
        </ThemeProvider>
      </DirectionProvider>
    </CSPProvider>
  );
}
