import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { TeamGallery } from '@/components/team-gallery';
import { socialMetadata } from '@/lib/social-metadata';
import '../team.css';

export const metadata: Metadata = {
  title: 'Meet the Team | Bulk Away',
  description:
    'Meet Bulk Away Division Leader Bill Loftin and the Waste Solution Innovators advisory board and support team behind our Utah junk removal services.',
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
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="crew-page-nav wrap">
        <Link className="wordmark" href="/" aria-label="Bulk Away home">
          Bulk Away
        </Link>
        <Link className="text-link" href="/#pickup-request">
          Request a pickup <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </header>
      <main id="main" tabIndex={-1}>
        <TeamGallery />
      </main>
      <footer className="crew-page-footer wrap">
        <Link className="text-link" href="/#about">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Bulk Away
        </Link>
        <Link href="/#family">Explore the WSI family of brands</Link>
      </footer>
    </div>
  );
}
