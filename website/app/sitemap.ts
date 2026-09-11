import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-data';
export default function sitemap(): MetadataRoute.Sitemap {
  return process.env.PUBLIC_LAUNCH === 'true'
    ? [
        { url: siteOrigin, changeFrequency: 'monthly', priority: 1 },
        { url: `${siteOrigin}/team`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteOrigin}/arcade`, changeFrequency: 'monthly', priority: 0.4 },
        {
          url: `${siteOrigin}/privacy`,
          changeFrequency: 'yearly',
          priority: 0.2,
        },
        { url: `${siteOrigin}/sms`, changeFrequency: 'yearly', priority: 0.2 },
      ]
    : [];
}
