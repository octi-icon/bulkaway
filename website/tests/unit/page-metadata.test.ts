import { expect, test } from 'vitest';
import { pageMeta } from '../../lib/page-metadata';

test('renders absolute canonical/social URLs and honors prelaunch noindex', () => {
  const tags = pageMeta(
    { title: 'Services', alternates: { canonical: '/services' } },
    'https://bulkaway.example',
    false,
  );
  expect(tags).toContainEqual({ title: 'Services' });
  expect(tags).toContainEqual({
    tagName: 'link',
    rel: 'canonical',
    href: 'https://bulkaway.example/services',
  });
  expect(tags).toContainEqual({ name: 'robots', content: 'noindex, nofollow' });
  expect(tags).toContainEqual({
    property: 'og:image',
    content: 'https://bulkaway.example/brand/bulk-away-share.png',
  });
});
test('a launched site still prevents indexing an error or private receipt route', () => {
  expect(
    pageMeta(
      { robots: { index: false, follow: true } },
      'https://bulkaway.example',
      true,
    ),
  ).toContainEqual({ name: 'robots', content: 'noindex, follow' });
});
