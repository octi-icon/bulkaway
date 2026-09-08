import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-data';
export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be able to read the page-level noindex before launch.
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    ...(process.env.PUBLIC_LAUNCH === 'true'
      ? { sitemap: `${siteOrigin}/sitemap.xml` }
      : {}),
  };
}
