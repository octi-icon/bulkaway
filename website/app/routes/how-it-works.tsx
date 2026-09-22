import { HowItWorksSection } from '@/components/home-sections';
import { routeMeta } from '@/lib/page-metadata';
import { socialMetadata } from '@/lib/social-metadata';
const metadata = {
  title: 'How It Works | Bulk Away',
  description:
    'See how to request a quote, plan your pickup, and reclaim your space with Bulk Away.',
  alternates: { canonical: '/how-it-works' },
  ...socialMetadata(
    'How It Works | Bulk Away',
    'See how to request a quote, plan your pickup, and reclaim your space with Bulk Away.',
    '/how-it-works',
  ),
};
export const handle = { metadata };
export const meta = routeMeta(metadata);
export default function Page() {
  return (
    <main id="main" tabIndex={-1}>
      <HowItWorksSection standalone />
    </main>
  );
}
