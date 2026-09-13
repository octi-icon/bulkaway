import type { MetaDescriptor, MetaFunction } from 'react-router';
type SocialImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};
export type PageMetadata = {
  title?: string;
  description?: string;
  alternates?: { canonical: string };
  robots?: { index: boolean; follow: boolean };
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: string;
    images: SocialImage[];
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    images: SocialImage[];
  };
};
export function pageMeta(
  page: PageMetadata,
  origin: string,
  launched: boolean,
): MetaDescriptor[] {
  const title = page.title || 'Bulk Away | Utah Junk Removal & Trash Outs';
  const description =
    page.description ||
    'Family-owned junk removal, bulk pickup, and apartment trash outs in Salt Lake, Utah, Weber, and Davis counties, Utah. Make space with Bulk Away.';
  const absolute = (path: string) => new URL(path, origin).href;
  const image = page.openGraph?.images[0] || {
    url: '/brand/bulk-away-share.png',
    width: 1200,
    height: 630,
    alt: 'Bulk Away — Utah junk removal and trash outs.',
  };
  return [
    { title },
    { name: 'description', content: description },
    {
      name: 'robots',
      content: `${launched && page.robots?.index !== false ? 'index' : 'noindex'}, ${launched && page.robots?.follow !== false ? 'follow' : 'nofollow'}`,
    },
    ...(page.alternates
      ? [
          {
            tagName: 'link' as const,
            rel: 'canonical',
            href: absolute(page.alternates.canonical),
          },
        ]
      : []),
    { property: 'og:title', content: page.openGraph?.title || title },
    {
      property: 'og:description',
      content: page.openGraph?.description || description,
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Bulk Away' },
    { property: 'og:locale', content: 'en_US' },
    {
      property: 'og:url',
      content: absolute(
        page.openGraph?.url || page.alternates?.canonical || '/',
      ),
    },
    { property: 'og:image', content: absolute(image.url) },
    { property: 'og:image:width', content: String(image.width || 1200) },
    { property: 'og:image:height', content: String(image.height || 630) },
    { property: 'og:image:alt', content: image.alt || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.twitter?.title || title },
    {
      name: 'twitter:description',
      content: page.twitter?.description || description,
    },
    {
      name: 'twitter:image',
      content: absolute(page.twitter?.images[0]?.url || image.url),
    },
  ];
}

export function routeMeta(page: PageMetadata): MetaFunction {
  return ({ matches }) => {
    const config = matches.find((match) => match.id === 'root')?.loaderData as
      | { origin?: string; launched?: boolean }
      | undefined;
    return pageMeta(
      page,
      config?.origin || 'https://bulkaway.com',
      config?.launched || false,
    );
  };
}
