import type { ActionFunctionArgs } from 'react-router';
import { POST } from '../api/pickup/route';
export function action({ request }: ActionFunctionArgs) {
  return request.method === 'POST' ? POST(request) : loader();
}
export function loader() {
  return new Response('Method not allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
