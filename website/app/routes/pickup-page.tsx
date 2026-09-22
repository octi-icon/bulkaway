import { PickupSection } from '@/components/home-sections';
import { routeMeta } from '@/lib/page-metadata';
import { socialMetadata } from '@/lib/social-metadata';
const metadata = {
  title: 'Request a Pickup | Bulk Away',
  description:
    'Request a bulk pickup, trash out, or cleanup from the Bulk Away crew.',
  alternates: { canonical: '/pickup' },
  ...socialMetadata(
    'Request a Pickup | Bulk Away',
    'Request a bulk pickup, trash out, or cleanup from the Bulk Away crew.',
    '/pickup',
  ),
};
export const handle = { metadata };
export const meta = routeMeta(metadata);
export default function Page() {
  return (
    <main id="main" tabIndex={-1}>
      <PickupSection standalone />
    </main>
  );
}
