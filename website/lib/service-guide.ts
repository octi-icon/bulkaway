export const freshStartChoices = [
  { id: 'items', label: 'A few items or furniture' },
  { id: 'property', label: 'A unit or property' },
  { id: 'community', label: 'Shared waste areas' },
  { id: 'reuse', label: 'Donations or recyclables' },
] as const;
export const communityChoices = [
  { id: 'weekly', label: 'Recurring bulk buildup' },
  { id: 'chute', label: 'A chute room' },
] as const;
const suggestions = {
  items: {
    service: 'Bulk item removal',
    reason: 'For furniture and bulky items that need a proper send-off.',
  },
  property: {
    service: 'Trash outs',
    reason:
      'For left-behind items and trash when a unit or property needs a reset.',
  },
  weekly: {
    service: 'Weekly bulk service',
    reason:
      'For recurring bulk removal, dumpster-enclosure sweeping, and recyclable removal.',
  },
  chute: {
    service: 'Chute room clear outs',
    reason: 'For clearing buildup from your community’s chute rooms.',
  },
  reuse: {
    service: 'Donations & recyclables',
    reason:
      'For items set aside for donation or recycling. Our crew confirms acceptance and handling.',
  },
} as const;
export function recommendService(goal: string, area = '') {
  const key = goal === 'community' ? area : goal;
  if (goal === 'community' && !['weekly', 'chute'].includes(area)) return null;
  if (!['items', 'property', 'community', 'reuse'].includes(goal)) return null;
  return suggestions[key as keyof typeof suggestions] || null;
}
export function serviceNotesHint(service: string) {
  switch (service) {
    case 'Bulk item removal':
      return 'Mention item sizes, stairs, and where the items are.';
    case 'Trash outs':
      return 'Describe the unit or property, what is left behind, and any stairs or special cleanup needs.';
    case 'Weekly bulk service':
      return 'Tell us how many dumpster enclosures you have, what builds up, and your preferred service days.';
    case 'Chute room clear outs':
      return 'Tell us how many chute rooms need attention, where they are, and how our crew can access them.';
    case 'Donations & recyclables':
      return 'Describe the items or materials and their condition. We’ll confirm acceptance and handling options.';
    default:
      return 'Tell us what needs to go, where it is, and any access details. We can help choose the right service.';
  }
}
