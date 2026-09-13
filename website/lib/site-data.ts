export const siteOrigin = (
  import.meta.env.VITE_SITE_URL || 'https://bulkaway.com'
).replace(/\/$/, '');
export const serviceCounties = [
  'Salt Lake County',
  'Utah County',
  'Weber County',
  'Davis County',
];
const areaServed = serviceCounties.map((name) => ({
  '@type': 'AdministrativeArea',
  name: `${name}, Utah`,
}));
export const searchData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteOrigin}/#business`,
      name: 'Bulk Away',
      slogan: 'Clearing the Way for What’s Next.',
      url: siteOrigin,
      logo: `${siteOrigin}/brand/bulk-away.png`,
      description:
        'Family-owned junk removal, bulk item pickup, apartment trash outs, and recurring bulk removal services.',
      telephone: '+1-801-602-7705',
      email: 'service@bulkaway.com',
      areaServed,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Waste Solution Innovators',
        logo: `${siteOrigin}/brand/waste-solution-innovators.png`,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Bulk Away removal services',
        itemListElement: [
          [
            'Bulk item removal',
            'On-demand removal of furniture and bulky items.',
          ],
          ['Trash outs', 'Apartment and property clear-outs.'],
          [
            'Weekly bulk service',
            'Weekly bulk removal, dumpster enclosure sweeping, and recyclable material removal.',
          ],
          ['Chute room clear outs', 'Chute room clear outs and haul-off.'],
          [
            'Donations and recyclables',
            'Pickup of donation items and recyclable materials, with acceptance confirmed before pickup.',
          ],
        ].map(([name, description]) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name,
            description,
            areaServed,
            provider: { '@id': `${siteOrigin}/#business` },
          },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteOrigin}/#website`,
      url: siteOrigin,
      name: 'Bulk Away',
      publisher: { '@id': `${siteOrigin}/#business` },
    },
  ],
};
