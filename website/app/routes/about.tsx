import { StorySection } from '@/components/home-sections';
import { routeMeta } from '@/lib/page-metadata';
import { socialMetadata } from '@/lib/social-metadata';
const metadata = {
  title: 'Our Story | Bulk Away',
  description:
    'Meet the family-owned Utah junk removal company behind Bulk Away.',
  alternates: { canonical: '/about' },
  ...socialMetadata(
    'Our Story | Bulk Away',
    'Meet the family-owned Utah junk removal company behind Bulk Away.',
    '/about',
  ),
};
export const handle = { metadata };
export const meta = routeMeta(metadata);
export default function Page() {
  return (
    <main id="main" tabIndex={-1}>
      <StorySection standalone />
    </main>
  );
}
