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

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  type MetaFunction,
} from 'react-router';
import { pageMeta, type PageMetadata } from '@/lib/page-metadata';
import NotFound from './not-found';
export function loader() {
  return {
    googleMapsKey: process.env.GOOGLE_MAPS_BROWSER_KEY || '',
    origin:
      process.env.SITE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      'https://bulkaway.com',
    launched: process.env.PUBLIC_LAUNCH === 'true',
  };
}
export const meta: MetaFunction<typeof loader> = ({
  loaderData: data,
  matches,
}) => {
  const page = [...matches]
    .reverse()
    .find((match) => (match?.handle as { metadata?: PageMetadata })?.metadata);
  return pageMeta(
    (page?.handle as { metadata?: PageMetadata })?.metadata || {},
    data?.origin || 'https://bulkaway.com',
    data?.launched || false,
  );
};
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motion="paused" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/brand/favicon.svg" />
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />;
}
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <main id="main" tabIndex={-1} className="missing-page wrap">
      <h1>A brief detour.</h1>
      <p>We couldn’t load this page. Please try again or call the crew.</p>
      <a className="button" href="/">
        Back to Bulk Away
      </a>
      <a href="tel:+18016027705">801.602.7705</a>
    </main>
  );
}
