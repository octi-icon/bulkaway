import type { PageMetadata as Metadata } from '@/lib/page-metadata';

export function socialMetadata(
  title: string,
  description: string,
  path = '/',
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const image = {
    url: '/brand/bulk-away-share.png',
    width: 1200,
    height: 630,
    alt: 'Bulk Away — Utah junk removal and trash outs. Clearing the Way for What’s Next.',
  };
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Bulk Away',
      locale: 'en_US',
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
