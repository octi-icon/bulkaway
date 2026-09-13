import { routeMeta } from '@/lib/page-metadata';
import Page, { metadata } from '../not-found';
export const handle = { metadata };
export const meta = routeMeta(metadata);
export function loader() {
  return new Response(null, { status: 404 });
}
export default Page;
