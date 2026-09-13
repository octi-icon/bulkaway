import { type RouteConfig, index, route } from '@react-router/dev/routes';
export default [
  index('routes/home.tsx'),
  ...['services', 'team', 'arcade', 'privacy', 'sms', 'request'].map((name) =>
    route(name, 'routes/' + name + '.tsx'),
  ),
  route('api/pickup', 'routes/pickup.ts'),
  route('api/health', 'routes/health.ts'),
  route('robots.txt', 'routes/robots.ts'),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('*', 'routes/missing.tsx'),
] satisfies RouteConfig;
