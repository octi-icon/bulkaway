import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';
import { CookiePreferences } from '@/components/cookie-preferences';
import { ClickSparkles } from '@/components/click-sparkles';
import { HaulListProvider } from '@/components/haul-list';
import { SiteExperience } from '@/components/site-experience';
import { RequestDock } from '@/components/request-dock';
import { SiteHeader } from '@/components/site-header';
import './globals.css';
import './atomic.css';
import './privacy-controls.css';
import './photo-upload.css';
import './pickup-selectors.css';
import './pickup-steps.css';
import './flourishes.css';
import './atomic-cursor.css';
import './atomic-sparkles.css';
import './engagement.css';
import './engagement-round2.css';
import './pickup-compact.css';
import './refinement.css';
import './address-selector.css';
import './navigation-motion.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://bulkaway.com'),
  title: 'Bulk Away | Utah Junk Removal & Trash Outs',
  description:
    'Family-owned junk removal, bulk pickup, and apartment trash outs in Salt Lake, Utah, Weber, and Davis counties, Utah. Make space with Bulk Away.',
  robots: {
    index: process.env.PUBLIC_LAUNCH === 'true',
    follow: process.env.PUBLIC_LAUNCH === 'true',
  },
  icons: { icon: '/brand/favicon.svg' },
  ...socialMetadata(
    'Bulk Away — Clearing the Way for What’s Next',
    'Utah junk removal and trash outs for homes, apartment communities, and commercial properties.',
  ),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-motion="paused">
      <head>
        <link
          rel="preload"
          href="/fonts/Brookvale-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/taldosescript-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteExperience>
          <HaulListProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <SiteHeader />
            {children}
            <RequestDock />
            <ClickSparkles />
            <CookiePreferences />
          </HaulListProvider>
        </SiteExperience>
      </body>
    </html>
  );
}
