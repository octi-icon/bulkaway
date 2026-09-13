import Link from '@/components/site-link';
import type { PageMetadata as Metadata } from '@/lib/page-metadata';
import { ArrowUpRight, Orbit } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found | Bulk Away',
  description:
    'Find your way back to Bulk Away or request a junk removal pickup.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main" className="missing-page wrap" tabIndex={-1}>
      <Orbit size={60} strokeWidth={1.5} aria-hidden="true" />
      <h1>
        This page has
        <br />
        <em>taken off.</em>
      </h1>
      <p>
        404 — We couldn’t find that page. Your next fresh start is still right
        here.
      </p>
      <div className="missing-actions">
        <Link className="button" href="/">
          Back to Bulk Away <ArrowUpRight aria-hidden="true" />
        </Link>
        <Link className="text-link" href="/#pickup-request">
          Request a pickup <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <p className="missing-help">
        Need the crew? <a href="tel:+18016027705">Call 801.602.7705</a> or{' '}
        <a href="mailto:service@bulkaway.com">email us</a>.
      </p>
    </main>
  );
}
