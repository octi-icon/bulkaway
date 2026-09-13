import { routeMeta } from '@/lib/page-metadata';
import Page, { metadata } from '../sms/page';
export const handle = { metadata };
export const meta = routeMeta(metadata);
export default Page;
