// Small routing map shared with the home-page controls. Keep detailed service
// copy and rate data in the server-rendered services page.
export const serviceRouteIds: Record<string, string> = {
  'Bulk item removal': 'bulk-item-removal',
  'Trash outs': 'trash-outs',
  'Weekly bulk service': 'weekly-bulk-service',
  'Chute room clear outs': 'chute-room-clear-outs',
  'Donations & recyclables': 'donations-recyclables',
};

export function serviceNameFromId(id: string) {
  return Object.entries(serviceRouteIds).find(([, slug]) => slug === id)?.[0];
}
