import Link from '@/components/site-link';
import type { PageMetadata as Metadata } from '@/lib/page-metadata';
import { ArrowLeft } from 'lucide-react';
import { TeamGallery } from '@/components/team-gallery';
import { socialMetadata } from '@/lib/social-metadata';
import '../team.css';

export const metadata: Metadata = {
  title: 'Meet the Team | Bulk Away',
  description:
    'Meet Bulk Away Division Leader Bill Loftin, Lead Bulk Technician Nick Loftin, and the Waste Solution Innovators business, operations, and advisory team.',
  alternates: { canonical: '/team' },
  ...socialMetadata(
    'Meet the Team | Bulk Away',
    'Real people. Big lift-off energy. Meet the people behind Bulk Away.',
    '/team',
  ),
};

export default function TeamPage() {
  return (
    <div className="crew-page">
      <main id="main" tabIndex={-1}>
        <TeamGallery />
      </main>
      <footer className="crew-page-footer wrap">
        <Link className="text-link" href="/">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Bulk Away
        </Link>
        <Link href="/#family">Explore the WSI family of brands</Link>
      </footer>
    </div>
  );
}
