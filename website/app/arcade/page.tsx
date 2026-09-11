import type { Metadata } from 'next';
import { BulkArcade } from '@/components/bulk-arcade';
import { socialMetadata } from '@/lib/social-metadata';

export const metadata: Metadata = {
  title: 'Space Reclaimed — Free Retro Arcade | Bulk Away',
  description:
    'Pilot a Bulk Away UFO, beam up junk, and earn 5% off your next removal. Play the free retro arcade or an untimed cleanup mode.',
  alternates: { canonical: '/arcade' },
  ...socialMetadata(
    'Space Reclaimed — Bulk Away Arcade',
    'Earth has a clutter problem. You have a tractor beam. Play for 5% off your next removal.',
    '/arcade',
  ),
};
export default function ArcadePage() {
  return (
    <main id="main" tabIndex={-1} className="arcade-page">
      <BulkArcade />
      <p className="arcade-page-footnote">
        A little otherworldly fun from your Utah hauling crew.
        <br />
        Women-majority owned. Family operated. Ready for what’s next.
      </p>
    </main>
  );
}
