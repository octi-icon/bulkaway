// Service scope and prices supplied in Bulk Removal Rates - 2026 (1).pdf.
// Published prices apply only to multifamily communities, not single-family homes.
// Owner clarified bundle eligibility includes customers of other WSI companies.
// The crew confirms the applicable rate and final job quote.
export const serviceCatalog = [
  {
    id: 'bulk-item-removal',
    name: 'Bulk item removal',
    headline: 'One bulky problem. A little more room.',
    beforeImage: 'bulk-removal-before',
    afterImage: 'bulk-removal',
    beforeAlt:
      'A house entrance crowded with bulky furniture, a mattress, rugs, and boxes.',
    alt: 'Retro illustration of two Bulk Away workers carrying a sofa toward a hauling truck.',
    description:
      'That sofa, old chair, or oversized item does not have to become a permanent fixture. Our on-demand bulk pickup helps homes, apartment communities, and commercial properties clear furniture and other bulky items without arranging a whole-property trash out.',
    detail:
      'Tell us what needs to go and where it is. We review the load, access, and any special handling, then confirm the quote and pickup arrangements with you.',
    includes: [
      'Pickup requests for one item or a larger group',
      'Furniture and other bulky household items',
      'Review of items that need separate handling or disposal',
    ],
    prepare:
      'List each item and quantity. Add photos, approximate sizes, stairs or elevators, and whether items are inside a unit or in a shared pickup area.',
    note: 'Tell us about mattresses, refrigerators, electronics, and tires before pickup so any special handling can be included in your quote.',
    cta: 'Request a bulk pickup',
    bundle: '$75',
    standard: '$150',
    rateUnit: 'Starting price for one item',
  },
  {
    id: 'trash-outs',
    name: 'Trash outs',
    headline: 'Left behind? Let’s move it along.',
    beforeImage: 'trash-out-before',
    afterImage: 'trash-out-after',
    beforeAlt:
      'An apartment crowded with left-behind furniture, a mattress, boxes, and bagged rubbish.',
    alt: 'The same apartment with the left-behind items removed and its floor clear.',
    description:
      'A move-out can leave a unit full of furniture, bagged trash, boxes, and belongings that need to be removed. Our trash out service is for apartment and property teams facing a larger clear-out, with the scope of work agreed before the crew arrives.',
    detail:
      'We plan the removal around the property and what has been left behind. A lightly filled room and a heavily loaded unit can need very different amounts of work, so every trash out requires a quote. Clearing the contents makes room for your team’s next turnover steps; discuss any carpet removal or other special cleanup separately.',
    includes: [
      'Apartment and property clear-out requests',
      'Removal of agreed left-behind items and trash',
      'A quote based on the actual scope of work',
    ],
    prepare:
      'Share the unit or property type, photos of each affected room, the amount of material, and building access. Identify anything that must stay.',
    note: 'Carpet removal, excess trash, and special handling may add to the quote. Infested items require completed extermination procedures before removal.',
    cta: 'Plan a trash out',
    bundle: '$200',
    standard: '$400',
    rateUnit: 'Minimum · price quote required',
  },
  {
    id: 'weekly-bulk-service',
    name: 'Weekly bulk service',
    headline: 'Make “all clear” a weekly habit.',
    beforeImage: 'weekly-bulk-before',
    afterImage: 'weekly-bulk-after',
    beforeAlt:
      'A dumpster enclosure overwhelmed by piled furniture, cardboard, and bagged rubbish.',
    alt: 'Bulk Away workers sweep a dumpster enclosure and collect stacked cardboard beside a retro truck.',
    description:
      'When bulky items keep returning to a community’s waste areas, a recurring plan gives the work a regular place on the calendar. Our bulk removal subscription combines weekly bulk item removal, dumpster-enclosure sweeping, and removal of recyclable materials.',
    detail:
      'The listed subscription includes service once a week. Tell us about your property’s enclosures, usual buildup, and access arrangements so we can discuss a schedule that fits. Multifamily communities using other Waste Solution Innovators companies can ask about the bundle rate shown below.',
    includes: [
      'Service once a week',
      'Removal of bulk items and recyclable materials',
      'Sweeping of dumpster enclosures',
    ],
    prepare:
      'Include the community name, number of enclosures, typical weekly load, preferred service day, and any gates or access instructions.',
    note: 'Extra loads may incur additional charges. Share unusually large cleanouts in advance so our crew can confirm the scope and cost.',
    cta: 'Ask about weekly service',
    bundle: '$500',
    standard: '$750',
    rateUnit: 'Per month · once-weekly service',
  },
  {
    id: 'chute-room-clear-outs',
    name: 'Chute room clear outs',
    headline: 'Clear the room. Keep things moving.',
    beforeImage: 'chute-room-before',
    afterImage: 'chute-room-after',
    beforeAlt:
      'An enclosed upper-floor chute room crowded with bags, cardboard, and loose packaging beneath a small wall intake hatch.',
    alt: 'A Bulk Away worker moves bags and boxes out of an apartment chute room on a four-wheel flatbed cart.',
    description:
      'Bags, boxes, and left-behind material can crowd the floor of an enclosed chute room. Our crew clears the agreed buildup from these separate rooms on the building’s upper floors, using a flatbed cart to move material out through the interior hall. Haul-off is included, with the rate calculated per chute room.',
    detail:
      'Let us know how many rooms need attention and what is in them. We confirm access and the work needed before scheduling. If buildup is a recurring issue, ask about weekly pickups and the additional discounts noted in the rate sheet.',
    includes: [
      'Removal of agreed chute-room buildup',
      'Haul-off included',
      'Weekly pickup options to discuss with the crew',
    ],
    prepare:
      'List the number and location of rooms, include photos of the buildup, and explain building access, elevators, gates, or keys.',
    note: 'This is a room clear-out service. Describe any chute blockage, equipment issue, or unusual material separately so the crew can confirm what can be handled.',
    cta: 'Request a chute room clear-out',
    bundle: '$20',
    standard: '$40',
    rateUnit: 'Per chute room · haul-off included',
  },
  {
    id: 'donations-recyclables',
    name: 'Donations & recyclables',
    headline: 'Out of your space. On to what’s next.',
    beforeImage: 'donations-recycling-before',
    afterImage: 'donations-recycling',
    beforeAlt:
      'A crowded collection of usable furniture, clothing, boxes, and recyclable materials awaiting pickup.',
    alt: 'A customer and Bulk Away worker organize usable furniture, clothing, cardboard, and recyclable cans.',
    description:
      'Some things still have another chapter in them. If you have items set aside for donation or materials to recycle, tell us what you have and their condition. Our crew reviews acceptance and handling options before arranging pickup.',
    detail:
      'Keep donation items and recyclable materials identified separately in your request. Photos and a clear list help us understand the load and discuss the next step. Acceptance depends on the items and available handling options; a pickup request is not a guarantee that every item can be donated or recycled.',
    includes: [
      'Pickup requests for potential donation items',
      'Removal of recyclable materials',
      'Acceptance and handling confirmed before pickup',
    ],
    prepare:
      'List materials, quantities, and condition. Note damaged or mixed items and add photos so we can review what you have.',
    note: 'For multifamily communities, the rate sheet lists an estimated $25–$50 bundle fuel surcharge and a $100 standard minimum. Other properties are quoted separately.',
    cta: 'Ask about donation & recycling pickup',
    bundle: '$25–$50',
    standard: '$100',
    rateUnit: 'Bundle: estimated fuel surcharge · Standard: minimum',
  },
] as const;
