import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { BrandingProvider } from '@/components/BrandingProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import SessionProvider from '@/components/SessionProvider';
import DemoBadge from '@/components/DemoBadge';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'Documotion',
  description: 'The AI operating system that brings clarity to registrations, compliance, and funding.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            <BrandingProvider>
              <LanguageProvider>
                <ErrorBoundary>
                  {children}
                  <DemoBadge />
                </ErrorBoundary>
              </LanguageProvider>
            </BrandingProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

