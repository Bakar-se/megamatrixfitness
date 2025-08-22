'use client';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ActiveThemeProvider } from '../active-theme';
import { store } from '@/store/Store';
import { Provider } from 'react-redux';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  // we need the resolvedTheme value to set the baseTheme for clerk based on the dark or light theme
  const { resolvedTheme } = useTheme();

  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <SessionProvider>
          <Provider store={store}>{children}</Provider>
        </SessionProvider>
      </ActiveThemeProvider>
    </>
  );
}
